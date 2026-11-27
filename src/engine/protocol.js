// Wire protocol between the browser and a game room. Both ends import this
// file so message names only exist in one place. Every message is one JSON
// object with a `type` field.

// Client -> room
export const C2S = {
  HELLO: 'hello',          // { name, token? }         first message on a socket; token resumes a seat
  SET_DECK: 'setDeck',     // { creatureNames }        3 unique creature names
  RANDOM_DECK: 'randomDeck',
  READY: 'ready',          // { ready: bool }
  PICK: 'pick',            // { uid, style }
  LOCK: 'lock',
  UNLOCK: 'unlock',
  REMATCH: 'rematch',
  LEAVE: 'leave',
};

// Room -> client
export const S2C = {
  WELCOME: 'welcome',      // { side, token, code }    your seat; keep the token to reconnect
  ROOM: 'room',            // { code, phase, players: { p1: {name, connected, ready, hasDeck}, p2 }, yourSide }
  STATE: 'state',          // { view }                 viewFor(state, yourSide)
  ROUND: 'round',          // { events, view }         a resolved round: replay events, then show view
  TIMER: 'timer',          // { endsAt }               pick deadline (ms since epoch), null to clear
  ERROR: 'error',          // { code, message }
  FULL: 'full',            // room already has two players
};

export const ROOM_PHASES = {
  LOBBY: 'lobby',          // waiting for both players to have a deck and be ready
  PLAYING: 'playing',
  FINISHED: 'finished',
};

// Server-side limits
export const PICK_TIMEOUT_MS = 60_000;
export const RECONNECT_GRACE_MS = 120_000;
export const EMPTY_ROOM_TTL_MS = 10 * 60_000;

export const ROOM_CODE_LENGTH = 5;
// No vowels or lookalikes, so codes don't spell words and are easy to read out.
export const ROOM_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ23456789';
