// Shared random source for the combat engine. Defaults to Math.random; the
// tutorial swaps in a seeded generator so its guided rounds play out the same
// way every time.
let source = null;

// Math.random is looked up on each call so tests can still spy on it.
export const random = () => (source ? source() : Math.random());

export const setRandomSource = (fn) => {
  source = fn || null;
};

// mulberry32: small, fast, good enough for game rolls.
export const seededRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
