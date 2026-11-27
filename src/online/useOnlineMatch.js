// Client side of a game room. Owns the WebSocket, tracks the room/lobby
// state and the player's view of the match, and queues round events for the
// game screen to animate.
//
// Sketch of how Game.js will consume it (Phase 4): the screen stops holding
// hands/picks in its own useState and instead reads `view`, calls pick()
// and lockIn(), and drains `events` into the existing flying numbers,
// ability effects, death fades and combat log.
//
//   const online = useOnlineMatch({ code, name });
//   online.room          -> { phase, players, yourSide, result }
//   online.view          -> viewFor(state, you): sides[you].hand, pick, locked; opponent pick hidden
//   online.events        -> events from the last resolved round (call consumeEvents() once played)
//   online.deadline      -> pick timer end (ms since epoch) or null
//   online.pick(uid, style) / lockIn() / unlock() / setDeck(names) / randomDeck() / ready(bool) / rematch() / leave()
import { useCallback, useEffect, useRef, useState } from 'react';
import { C2S, S2C } from '../engine/protocol';

const TOKEN_KEY = (code) => `fcg.room.${code}.token`;
const WS_BASE = process.env.REACT_APP_ROOMS_WS || 'ws://localhost:8787';

export const createRoom = async () => {
  const base = WS_BASE.replace(/^ws/, 'http');
  const res = await fetch(`${base}/api/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error('Could not create a room');
  return (await res.json()).code;
};

export default function useOnlineMatch({ code, name }) {
  const socket = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting | open | closed | full
  const [room, setRoom] = useState(null);
  const [view, setView] = useState(null);
  const [events, setEvents] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [error, setError] = useState(null);

  const send = useCallback((msg) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    if (!code) return undefined;
    let closed = false;
    let retry = 0;
    let timer = null;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/${code}`);
      socket.current = ws;

      ws.onopen = () => {
        setStatus('open');
        retry = 0;
        let token = null;
        try { token = window.sessionStorage.getItem(TOKEN_KEY(code)); } catch (e) { /* private mode */ }
        ws.send(JSON.stringify({ type: C2S.HELLO, name, token }));
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case S2C.WELCOME:
            try { window.sessionStorage.setItem(TOKEN_KEY(code), msg.token); } catch (err) { /* ignore */ }
            break;
          case S2C.ROOM: setRoom(msg); break;
          case S2C.STATE: setView(msg.view); break;
          case S2C.ROUND:
            // Events first so the screen animates against the pre-round view,
            // then it calls consumeEvents() and the new view is already here.
            setEvents(msg.events);
            setView(msg.view);
            break;
          case S2C.TIMER: setDeadline(msg.endsAt); break;
          case S2C.FULL: setStatus('full'); break;
          case S2C.ERROR: setError(msg); break;
          default: break;
        }
      };

      ws.onclose = () => {
        if (closed) return;
        setStatus('closed');
        // Phones drop sockets in the background; the room keeps our seat for
        // RECONNECT_GRACE_MS, so come back with the saved token.
        timer = setTimeout(connect, Math.min(10_000, 500 * 2 ** retry++));
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      socket.current?.close(1000, 'unmount');
    };
  }, [code, name]);

  return {
    status,
    room,
    view,
    events,
    deadline,
    error,
    consumeEvents: useCallback(() => setEvents([]), []),
    clearError: useCallback(() => setError(null), []),
    setDeck: useCallback((creatureNames) => send({ type: C2S.SET_DECK, creatureNames }), [send]),
    randomDeck: useCallback(() => send({ type: C2S.RANDOM_DECK }), [send]),
    ready: useCallback((ready) => send({ type: C2S.READY, ready }), [send]),
    pick: useCallback((uid, style) => send({ type: C2S.PICK, uid, style }), [send]),
    lockIn: useCallback(() => send({ type: C2S.LOCK }), [send]),
    unlock: useCallback(() => send({ type: C2S.UNLOCK }), [send]),
    rematch: useCallback(() => send({ type: C2S.REMATCH }), [send]),
    leave: useCallback(() => send({ type: C2S.LEAVE }), [send]),
  };
}
