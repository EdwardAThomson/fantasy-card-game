// One Durable Object per room: two seats, their WebSockets, the lobby state
// and, once both players are ready, the authoritative MatchState.
//
// The browser never computes a round. It sends intents (pick, lock); when
// both seats are locked the room calls resolveRound with the match's own RNG
// and sends each side the events plus its own view. The opponent's pick is
// hidden by viewFor until both have locked.
//
// Uses the WebSocket Hibernation API so an idle room costs nothing between
// messages. Durable state (seats, match) is kept in storage so it survives
// the object being evicted; sockets are re-associated by the token stored in
// each socket's attachment.
import { DurableObject } from 'cloudflare:workers';
import {
  createMatch,
  applyIntent,
  bothLocked,
  resolveRound,
  viewFor,
  buildDeck,
  livingHand,
  MatchError,
  SIDES,
} from '../../src/engine/match';
import { getRandomUniqueCards, makeAIDecision } from '../../src/gameEngine';
import creatures from '../../src/creatures';
import { DECK_SIZE } from '../../src/constants';
import {
  C2S, S2C, ROOM_PHASES, PICK_TIMEOUT_MS, RECONNECT_GRACE_MS, EMPTY_ROOM_TTL_MS,
} from '../../src/engine/protocol';

const now = () => Date.now();

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.room = (await this.ctx.storage.get('room')) || null;
    });
  }

  // ---- HTTP entry (from index.js) ----

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/claim') {
      if (this.room && this.room.phase !== ROOM_PHASES.FINISHED) {
        return new Response('taken', { status: 409 });
      }
      this.room = {
        code: url.searchParams.get('code'),
        phase: ROOM_PHASES.LOBBY,
        seats: { p1: null, p2: null },   // { token, name, deck: [names] | null, ready, connected, awaySince }
        match: null,
        pickDeadline: null,
      };
      await this.save();
      await this.ctx.storage.setAlarm(now() + EMPTY_ROOM_TTL_MS);
      return new Response('ok');
    }

    if (!this.room) return new Response('no such room', { status: 404 });

    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  // ---- WebSocket handlers (Hibernation API) ----

  async webSocketMessage(ws, raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return this.error(ws, 'bad_json'); }

    const seatSide = this.sideOf(ws);
    try {
      if (msg.type === C2S.HELLO) return await this.hello(ws, msg);
      if (!seatSide) return this.error(ws, 'say_hello_first');

      switch (msg.type) {
        case C2S.SET_DECK: return await this.setDeck(seatSide, msg.creatureNames);
        case C2S.RANDOM_DECK: return await this.setDeck(seatSide, getRandomUniqueCards(creatures, DECK_SIZE).map(c => c.name));
        case C2S.READY: return await this.setReady(seatSide, !!msg.ready);
        case C2S.PICK: return await this.intent(seatSide, { type: 'pick', uid: msg.uid, style: msg.style });
        case C2S.LOCK: return await this.intent(seatSide, { type: 'lock' });
        case C2S.UNLOCK: return await this.intent(seatSide, { type: 'unlock' });
        case C2S.REMATCH: return await this.rematch(seatSide);
        case C2S.LEAVE: return await this.leave(seatSide);
        default: return this.error(ws, 'unknown_message');
      }
    } catch (e) {
      if (e instanceof MatchError) return this.error(ws, e.code, e.message);
      throw e;
    }
  }

  async webSocketClose(ws) {
    const side = this.sideOf(ws);
    if (!side || !this.room.seats[side]) return;
    this.room.seats[side].connected = false;
    this.room.seats[side].awaySince = now();
    await this.save();
    this.broadcastRoom();
    // Forfeit if they do not come back in time (checked in alarm()).
    await this.ctx.storage.setAlarm(now() + RECONNECT_GRACE_MS);
  }

  async webSocketError(ws) {
    return this.webSocketClose(ws);
  }

  // ---- Lobby ----

  async hello(ws, { name, token }) {
    const seats = this.room.seats;
    // Reconnect: a token we issued earlier takes its seat back.
    let side = SIDES.find(s => seats[s] && token && seats[s].token === token);
    if (!side) {
      side = SIDES.find(s => !seats[s]);
      if (!side) { ws.send(JSON.stringify({ type: S2C.FULL })); return ws.close(1008, 'room full'); }
      seats[side] = { token: crypto.randomUUID(), name: cleanName(name), deck: null, ready: false };
    }
    seats[side].connected = true;
    seats[side].awaySince = null;
    ws.serializeAttachment({ side, token: seats[side].token });
    await this.save();

    this.send(ws, { type: S2C.WELCOME, side, token: seats[side].token, code: this.room.code });
    this.broadcastRoom();
    if (this.room.match) this.send(ws, { type: S2C.STATE, view: viewFor(this.room.match, side) });
    if (this.room.pickDeadline) this.send(ws, { type: S2C.TIMER, endsAt: this.room.pickDeadline });
  }

  async setDeck(side, names) {
    if (this.room.phase !== ROOM_PHASES.LOBBY) throw new MatchError('not_in_lobby');
    buildDeck(names); // validates; the match is built from names again at start
    this.room.seats[side].deck = names;
    this.room.seats[side].ready = false;
    await this.save();
    this.broadcastRoom();
  }

  async setReady(side, ready) {
    if (this.room.phase !== ROOM_PHASES.LOBBY) throw new MatchError('not_in_lobby');
    if (ready && !this.room.seats[side].deck) throw new MatchError('no_deck', 'Build a deck first');
    this.room.seats[side].ready = ready;
    await this.save();
    this.broadcastRoom();
    if (SIDES.every(s => this.room.seats[s]?.ready && this.room.seats[s]?.connected)) await this.startMatch();
  }

  async startMatch() {
    const { seats } = this.room;
    this.room.match = createMatch({
      p1Deck: buildDeck(seats.p1.deck),
      p2Deck: buildDeck(seats.p2.deck),
      seed: crypto.getRandomValues(new Uint32Array(1))[0],
    });
    this.room.phase = ROOM_PHASES.PLAYING;
    await this.armPickTimer();
    await this.save();
    this.broadcastRoom();
    this.broadcastState();
  }

  async rematch(side) {
    if (this.room.phase !== ROOM_PHASES.FINISHED) throw new MatchError('not_finished');
    this.room.seats[side].ready = true;
    this.room.phase = ROOM_PHASES.LOBBY;
    this.room.match = null;
    await this.save();
    this.broadcastRoom();
    if (SIDES.every(s => this.room.seats[s]?.ready)) await this.startMatch();
  }

  async leave(side) {
    if (this.room.phase === ROOM_PHASES.PLAYING) await this.finish(side === 'p1' ? 'p2' : 'p1', 'left');
    this.room.seats[side] = null;
    await this.save();
    this.broadcastRoom();
    for (const ws of this.ctx.getWebSockets()) if (this.sideOf(ws) === side) ws.close(1000, 'left');
  }

  // ---- Match ----

  async intent(side, intent) {
    if (this.room.phase !== ROOM_PHASES.PLAYING) throw new MatchError('not_playing');
    this.room.match = applyIntent(this.room.match, side, intent);
    if (bothLocked(this.room.match)) {
      await this.resolve();
    } else {
      await this.save();
      this.broadcastState();
    }
  }

  async resolve() {
    const { state, events } = resolveRound(this.room.match);
    this.room.match = state;
    for (const ws of this.ctx.getWebSockets()) {
      const side = this.sideOf(ws);
      if (side) this.send(ws, { type: S2C.ROUND, events, view: viewFor(state, side) });
    }
    if (state.phase === 'over') {
      await this.finish(state.winner, 'won');
    } else {
      await this.armPickTimer();
      await this.save();
    }
  }

  async finish(winner, reason) {
    this.room.phase = ROOM_PHASES.FINISHED;
    this.room.pickDeadline = null;
    this.room.result = { winner, reason };
    SIDES.forEach(s => { if (this.room.seats[s]) this.room.seats[s].ready = false; });
    await this.save();
    await this.ctx.storage.setAlarm(now() + EMPTY_ROOM_TTL_MS);
    this.broadcastRoom();
  }

  // ---- Timers ----

  async armPickTimer() {
    this.room.pickDeadline = now() + PICK_TIMEOUT_MS;
    await this.ctx.storage.setAlarm(this.room.pickDeadline);
    this.broadcast({ type: S2C.TIMER, endsAt: this.room.pickDeadline });
  }

  async alarm() {
    if (!this.room) return;
    const { seats, phase } = this.room;

    // Forfeit a player who has been away too long mid-match.
    if (phase === ROOM_PHASES.PLAYING) {
      for (const s of SIDES) {
        const seat = seats[s];
        if (seat && !seat.connected && now() - seat.awaySince >= RECONNECT_GRACE_MS) {
          return this.finish(s === 'p1' ? 'p2' : 'p1', 'forfeit');
        }
      }
      // Pick timeout: let the AI choose for anyone not yet locked, then resolve.
      if (this.room.pickDeadline && now() >= this.room.pickDeadline) {
        for (const s of SIDES) {
          if (!this.room.match.sides[s].locked) {
            const best = makeAIDecision(livingHand(this.room.match, s));
            this.room.match = applyIntent(this.room.match, s, { type: 'pick', uid: best.card.uid, style: best.choice });
            this.room.match = applyIntent(this.room.match, s, { type: 'lock' });
          }
        }
        return this.resolve();
      }
      // Something else woke us (a reconnect grace that was met); keep the pick timer alive.
      if (this.room.pickDeadline) return this.ctx.storage.setAlarm(this.room.pickDeadline);
    }

    // Lobby or finished room with nobody connected: clean up.
    if (!SIDES.some(s => seats[s]?.connected)) {
      await this.ctx.storage.deleteAll();
      this.room = null;
    }
  }

  // ---- Plumbing ----

  sideOf(ws) {
    const att = ws.deserializeAttachment();
    if (!att) return null;
    const seat = this.room?.seats[att.side];
    return seat && seat.token === att.token ? att.side : null;
  }

  send(ws, msg) {
    try { ws.send(JSON.stringify(msg)); } catch { /* socket already gone; close handler tidies up */ }
  }

  broadcast(msg) {
    for (const ws of this.ctx.getWebSockets()) if (this.sideOf(ws)) this.send(ws, msg);
  }

  broadcastRoom() {
    const players = {};
    SIDES.forEach(s => {
      const seat = this.room.seats[s];
      players[s] = seat ? { name: seat.name, connected: !!seat.connected, ready: !!seat.ready, hasDeck: !!seat.deck } : null;
    });
    for (const ws of this.ctx.getWebSockets()) {
      const side = this.sideOf(ws);
      if (side) this.send(ws, { type: S2C.ROOM, code: this.room.code, phase: this.room.phase, players, result: this.room.result || null, yourSide: side });
    }
  }

  broadcastState() {
    for (const ws of this.ctx.getWebSockets()) {
      const side = this.sideOf(ws);
      if (side) this.send(ws, { type: S2C.STATE, view: viewFor(this.room.match, side) });
    }
  }

  error(ws, code, message) {
    this.send(ws, { type: S2C.ERROR, code, message: message || code });
  }

  async save() {
    await this.ctx.storage.put('room', this.room);
  }
}

const cleanName = (name) => {
  const trimmed = String(name || '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 16);
  return trimmed || 'Player';
};
