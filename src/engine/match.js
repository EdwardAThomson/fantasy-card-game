// Match engine: the whole of a match as plain data plus pure-ish functions.
//
// This is the piece every mode shares. The browser runs it directly for the
// AI, hot-seat and tutorial modes; the room server runs it for online play.
// Nothing here touches React, timers or the DOM.
//
//   createMatch({ p1Deck, p2Deck, seed })  -> MatchState
//   applyIntent(state, side, intent)       -> MatchState   (pick / lock / unlock)
//   bothLocked(state)                      -> boolean
//   resolveRound(state)                    -> { state, events }
//   viewFor(state, side)                   -> what that player may see
//
// MatchState is JSON: round, phase, rngState, sides.p1 / sides.p2 (hand,
// pick, locked) and winner. Cards carry a `uid` so picks are ids, not object
// references, and the RNG state travels inside the match so a seed replays
// the same way anywhere.
import creatures from '../creatures';
import { DECK_SIZE } from '../constants';
import { setRandomSource, mulberry32 } from '../rng';
import {
  abilityEffects,
  getElementMultiplier,
  handleCombatRound,
  processDoTDamage,
} from '../gameEngine';

export const SIDES = ['p1', 'p2'];
export const STYLES = ['Melee', 'Ranged', 'Magic'];
export const PHASES = { PICK: 'pick', OVER: 'over' };

export class MatchError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value));
const other = (side) => (side === 'p1' ? 'p2' : 'p1');

// --- Decks ---

// Server-side deck building: the client sends creature names, the server
// builds the cards from its own copy of creatures.js, so nobody can send a
// Dragon with 999 health. (Names are the creature id for now.)
export const buildDeck = (names) => {
  if (!Array.isArray(names) || names.length !== DECK_SIZE) {
    throw new MatchError('bad_deck_size', `A deck has ${DECK_SIZE} creatures`);
  }
  if (new Set(names).size !== names.length) {
    throw new MatchError('duplicate_creature', 'Creatures in a deck must be unique');
  }
  return names.map(name => {
    const base = creatures.find(c => c.name === name);
    if (!base) throw new MatchError('unknown_creature', `Unknown creature: ${name}`);
    return clone(base);
  });
};

const withUids = (deck, side) => deck.map((card, i) => ({
  ...clone(card),
  uid: `${side}-${i}`,
  statusEffects: card.statusEffects || [],
  dotEffects: card.dotEffects || [],
  isStunned: !!card.isStunned,
}));

// --- Lifecycle ---

export const createMatch = ({ p1Deck, p2Deck, seed }) => ({
  round: 1,
  phase: PHASES.PICK,
  rngState: (seed ?? Math.floor(Math.random() * 0xffffffff)) >>> 0,
  sides: {
    p1: { hand: withUids(p1Deck, 'p1'), pick: null, locked: false },
    p2: { hand: withUids(p2Deck, 'p2'), pick: null, locked: false },
  },
  winner: null,
});

export const livingHand = (state, side) => state.sides[side].hand.filter(c => c.currentHealth > 0);

export const findCard = (state, side, uid) => state.sides[side].hand.find(c => c.uid === uid) || null;

// --- Intents ---

export const applyIntent = (state, side, intent) => {
  if (!SIDES.includes(side)) throw new MatchError('bad_side');
  if (state.phase !== PHASES.PICK) throw new MatchError('match_over');
  const me = state.sides[side];

  switch (intent?.type) {
    case 'pick': {
      if (me.locked) throw new MatchError('already_locked', 'Unlock before changing your pick');
      const card = findCard(state, side, intent.uid);
      if (!card || card.currentHealth <= 0) throw new MatchError('bad_card', 'Pick a living creature from your hand');
      if (!STYLES.includes(intent.style)) throw new MatchError('bad_style', `Style must be one of ${STYLES.join(', ')}`);
      return { ...state, sides: { ...state.sides, [side]: { ...me, pick: { uid: intent.uid, style: intent.style } } } };
    }
    case 'lock': {
      if (!me.pick) throw new MatchError('no_pick', 'Pick a creature and a style first');
      return { ...state, sides: { ...state.sides, [side]: { ...me, locked: true } } };
    }
    case 'unlock': {
      if (bothLocked(state)) throw new MatchError('already_locked', 'The round is resolving');
      return { ...state, sides: { ...state.sides, [side]: { ...me, locked: false } } };
    }
    default:
      throw new MatchError('bad_intent');
  }
};

export const bothLocked = (state) =>
  state.phase === PHASES.PICK && SIDES.every(s => state.sides[s].locked && state.sides[s].pick);

// --- Round resolution ---

// Runs the round sequence that used to live inline in Game.js's Fight():
// defences logged, DoT ticks, statuses cleared, stun handled, the combat
// round itself, deaths, round counter, win check. Instead of calling React
// setters it returns an ordered list of events the UI (or the server) can
// replay: log lines, damage/heal popups, ability effects, deaths, results.
export const resolveRound = (input) => {
  if (!bothLocked(input)) throw new MatchError('not_ready', 'Both players must lock in');

  const state = clone(input);
  const events = [];
  const emit = (event) => events.push(event);
  const log = (text, type = 'info', style = null) => emit({ type: 'log', text, logType: type, style });

  // The engine helpers roll via rng.random(); install this match's generator
  // for the duration of this synchronous call so rolls come from the match,
  // not from a shared global. Several rooms can share one isolate on the
  // server, so nothing may stay installed afterwards.
  let rngState = state.rngState;
  setRandomSource(() => {
    const next = mulberry32(rngState);
    rngState = next.state;
    return next.value;
  });

  try {
    const p1 = findCard(state, 'p1', state.sides.p1.pick.uid);
    const p2 = findCard(state, 'p2', state.sides.p2.pick.uid);
    const p1Style = state.sides.p1.pick.style;
    const p2Style = state.sides.p2.pick.style;
    const round = state.round;

    log(`Round ${round}`, 'round-header');

    const logDefensiveProfile = (card, sideLabel) => {
      const immunities = card.immunities?.length ? card.immunities.join(', ') : 'none';
      const resistances = card.resistances
        ? Object.entries(card.resistances).map(([effect, m]) => `${effect} (${Math.round(m * 100)}% effect)`).join(', ') || 'none'
        : 'none';
      log(`${sideLabel} ${card.name} defenses → Immunities: ${immunities}; Resistances: ${resistances}`, 'info');
    };
    logDefensiveProfile(p1, 'Player 1');
    logDefensiveProfile(p2, 'Player 2');

    // DoT ticks before combat
    const p1Dot = processDoTDamage(p1, log);
    const p2Dot = processDoTDamage(p2, log);
    if (p1Dot > 0) emit({ type: 'dot', side: 'p1', uid: p1.uid, amount: p1Dot });
    if (p2Dot > 0) emit({ type: 'dot', side: 'p2', uid: p2.uid, amount: p2Dot });

    // A creature stunned last round skips this one; the stun clears after combat.
    const p1WasStunned = !!p1.isStunned;
    const p2WasStunned = !!p2.isStunned;
    if (p1WasStunned) log(`${p1.name} is recovering from stun...`, 'status');
    if (p2WasStunned) log(`${p2.name} is recovering from stun...`, 'status');

    // Status effects last one round
    p1.statusEffects = [];
    p2.statusEffects = [];

    const outcome = handleCombatRound(p1, p2, p1Style, p2Style, log);

    if (p1WasStunned) p1.isStunned = false;
    if (p2WasStunned) p2.isStunned = false;

    if (outcome.player1Damage > 0 && p1.currentHealth > 0) emit({ type: 'damage', side: 'p1', uid: p1.uid, amount: outcome.player1Damage });
    if (outcome.player2Damage > 0 && p2.currentHealth > 0) emit({ type: 'damage', side: 'p2', uid: p2.uid, amount: outcome.player2Damage });
    if (outcome.player1Heal > 0) emit({ type: 'heal', side: 'p1', uid: p1.uid, amount: outcome.player1Heal });
    if (outcome.player2Heal > 0) emit({ type: 'heal', side: 'p2', uid: p2.uid, amount: outcome.player2Heal });

    // Attacks and stuns play on the target; heals and defence play on the user.
    if (outcome.abilityUsed) {
      const { ability, side } = outcome.abilityUsed;
      const hitsTarget = ['damage', 'stun'].includes(abilityEffects[ability]?.type);
      const targetSide = hitsTarget ? other(side) : side;
      const target = targetSide === 'p1' ? p1 : p2;
      emit({ type: 'ability', ability, side: targetSide, uid: target.uid, cardName: target.name, user: side });
    }

    const deaths = [];
    SIDES.forEach(side => {
      const card = side === 'p1' ? p1 : p2;
      if (card.currentHealth <= 0) {
        deaths.push(side);
        log(`${card.name} (${side === 'p1' ? 'Player 1' : 'Player 2'}) has been killed.`, 'death');
        emit({ type: 'death', side, uid: card.uid, cardName: card.name, card: clone(card) });
      }
    });

    if (outcome.haveWinner) {
      const p1Won = outcome.winner === p1;
      log(`${outcome.winner.name} (${p1Won ? 'Player 1' : 'Player 2'}) wins the round!`, 'victory');
      emit({
        type: 'roundResult',
        round,
        winnerSide: p1Won ? 'p1' : 'p2',
        winnerUid: outcome.winner.uid,
        loserUid: (p1Won ? p2 : p1).uid,
      });
    }

    emit({
      type: 'roundResolved',
      round,
      p1Multiplier: getElementMultiplier(p1, p2),
      p2Multiplier: getElementMultiplier(p2, p1),
      abilityUsed: outcome.abilityUsed,
      newStatuses: [...(p1.statusEffects || []), ...(p2.statusEffects || [])],
      stunned: !!(p1.isStunned || p2.isStunned),
      deaths: deaths.map(side => (side === 'p1' ? p1 : p2).name),
    });

    // Next round: dead cards leave the hand and their side must pick again;
    // a surviving pick stays selected, but nobody is locked.
    SIDES.forEach(side => {
      const s = state.sides[side];
      s.hand = s.hand.filter(c => c.currentHealth > 0);
      s.locked = false;
      if (s.pick && !findCard(state, side, s.pick.uid)) s.pick = null;
    });

    state.round = round + 1;
    state.rngState = rngState;

    const p1Alive = livingHand(state, 'p1').length;
    const p2Alive = livingHand(state, 'p2').length;
    if (p1Alive === 0 || p2Alive === 0) {
      state.phase = PHASES.OVER;
      state.winner = p1Alive === 0 ? 'p2' : 'p1';
      log(`${state.winner === 'p1' ? 'Player 1' : 'Player 2'} is the winner!`, 'victory');
      emit({ type: 'gameOver', winnerSide: state.winner, survivors: livingHand(state, state.winner).map(c => c.uid) });
    }
  } finally {
    setRandomSource(null);
  }

  return { state, events };
};

// --- Views ---

// What one player is allowed to know. The opponent's pick is hidden until
// both players have locked in, and the RNG state never leaves the server.
export const viewFor = (state, side) => {
  const opp = other(side);
  const reveal = bothLocked(state);
  const { rngState, ...rest } = state;
  return {
    ...rest,
    you: side,
    sides: {
      [side]: state.sides[side],
      [opp]: {
        hand: state.sides[opp].hand,
        locked: state.sides[opp].locked,
        pick: reveal ? state.sides[opp].pick : null,
      },
    },
  };
};
