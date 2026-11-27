// Shared random source for the combat engine. Defaults to Math.random; the
// tutorial swaps in a seeded generator so its guided rounds play out the same
// way every time, and the match engine installs a per-match generator for the
// duration of each round (see engine/match.js).
let source = null;

// Math.random is looked up on each call so tests can still spy on it.
export const random = () => (source ? source() : Math.random());

export const setRandomSource = (fn) => {
  source = fn || null;
};

// mulberry32 step: one uint32 of state in, next state and a float in [0, 1) out.
// Keeping the state as a plain number lets a match carry its RNG inside
// serialisable state (and so across the network, or a Durable Object restart).
export const mulberry32 = (state) => {
  const a = (state + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { state: a, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
};

// mulberry32: small, fast, good enough for game rolls.
export const seededRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    const next = mulberry32(a);
    a = next.state;
    return next.value;
  };
};
