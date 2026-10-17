import creatures from '../creatures';
import { random, setRandomSource } from '../rng';
import {
  createMatch,
  applyIntent,
  bothLocked,
  resolveRound,
  viewFor,
  buildDeck,
  MatchError,
} from '../engine/match';

const names = (...n) => n;
const DECK_A = names('Dragon', 'Orc', 'Wizard');
const DECK_B = names('Elf Archer', 'Undead Knight', 'Forest Spirit');

const freshMatch = (seed = 7) => createMatch({ p1Deck: buildDeck(DECK_A), p2Deck: buildDeck(DECK_B), seed });

const lockBoth = (state, p1 = { uid: 'p1-0', style: 'Melee' }, p2 = { uid: 'p2-0', style: 'Magic' }) => {
  let s = applyIntent(state, 'p1', { type: 'pick', ...p1 });
  s = applyIntent(s, 'p2', { type: 'pick', ...p2 });
  s = applyIntent(s, 'p1', { type: 'lock' });
  return applyIntent(s, 'p2', { type: 'lock' });
};

// Plays a whole match with each side always sending its first living card.
const playOut = (seed) => {
  let state = freshMatch(seed);
  const all = [];
  let guard = 0;
  while (state.phase === 'pick' && guard++ < 100) {
    const current = state;
    const pick = side => ({ uid: current.sides[side].hand[0].uid, style: 'Melee' });
    const { state: next, events } = resolveRound(lockBoth(current, pick('p1'), pick('p2')));
    all.push(events);
    state = next;
  }
  return { state, events: all };
};

afterEach(() => setRandomSource(null));

describe('buildDeck', () => {
  test('builds fresh copies from creature names', () => {
    const deck = buildDeck(DECK_A);
    expect(deck.map(c => c.name)).toEqual(DECK_A);
    deck[0].currentHealth = 1;
    expect(creatures.find(c => c.name === 'Dragon').currentHealth).not.toBe(1);
  });

  test('rejects wrong sizes, duplicates and unknown creatures', () => {
    expect(() => buildDeck(['Dragon'])).toThrow(MatchError);
    expect(() => buildDeck(['Dragon', 'Dragon', 'Orc'])).toThrow(/unique/);
    expect(() => buildDeck(['Dragon', 'Orc', 'Nope'])).toThrow(/Unknown/);
  });
});

describe('intents', () => {
  test('cards get uids and picks reference them', () => {
    const state = freshMatch();
    expect(state.sides.p1.hand.map(c => c.uid)).toEqual(['p1-0', 'p1-1', 'p1-2']);
    const next = applyIntent(state, 'p1', { type: 'pick', uid: 'p1-1', style: 'Ranged' });
    expect(next.sides.p1.pick).toEqual({ uid: 'p1-1', style: 'Ranged' });
    expect(state.sides.p1.pick).toBeNull(); // input untouched
  });

  test('validates side, card, style and lock order', () => {
    const state = freshMatch();
    expect(() => applyIntent(state, 'p3', { type: 'lock' })).toThrow(/bad_side/);
    expect(() => applyIntent(state, 'p1', { type: 'pick', uid: 'p2-0', style: 'Melee' })).toThrow(/living creature/);
    expect(() => applyIntent(state, 'p1', { type: 'pick', uid: 'p1-0', style: 'Punch' })).toThrow(/Style/);
    expect(() => applyIntent(state, 'p1', { type: 'lock' })).toThrow(/Pick a creature/);
    const locked = applyIntent(applyIntent(state, 'p1', { type: 'pick', uid: 'p1-0', style: 'Melee' }), 'p1', { type: 'lock' });
    expect(() => applyIntent(locked, 'p1', { type: 'pick', uid: 'p1-1', style: 'Melee' })).toThrow(/Unlock/);
    expect(bothLocked(locked)).toBe(false);
    expect(bothLocked(lockBoth(state))).toBe(true);
  });
});

describe('resolveRound', () => {
  test('refuses to resolve until both players lock in', () => {
    expect(() => resolveRound(freshMatch())).toThrow(/lock in/);
  });

  test('is deterministic for a seed and leaves no RNG installed', () => {
    const a = resolveRound(lockBoth(freshMatch(99)));
    const b = resolveRound(lockBoth(freshMatch(99)));
    expect(a).toEqual(b);
    expect(a.state.rngState).not.toBe(99);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(random()).toBe(0.5); // back on Math.random
    Math.random.mockRestore();
  });

  test('different seeds give different rolls', () => {
    const a = resolveRound(lockBoth(freshMatch(1)));
    const b = resolveRound(lockBoth(freshMatch(2)));
    expect(a.events).not.toEqual(b.events);
  });

  test('does not mutate its input and stays JSON-serialisable', () => {
    const before = lockBoth(freshMatch(5));
    const snapshot = JSON.stringify(before);
    const { state } = resolveRound(before);
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  test('advances the round, unlocks both sides and emits the core events', () => {
    const { state, events } = resolveRound(lockBoth(freshMatch(3)));
    expect(state.round).toBe(2);
    expect(state.sides.p1.locked).toBe(false);
    expect(state.sides.p2.locked).toBe(false);
    const types = events.map(e => e.type);
    expect(types[0]).toBe('log');
    expect(types).toContain('roundResolved');
    expect(events.some(e => e.type === 'damage' || e.type === 'death')).toBe(true);
    const hp = state.sides.p1.hand[0].currentHealth + state.sides.p2.hand[0].currentHealth;
    expect(hp).toBeLessThan(500 + creatures.find(c => c.name === 'Elf Archer').maxHealth);
  });

  test('plays a whole match to a winner, removing dead cards as it goes', () => {
    const { state, events } = playOut(11);
    expect(state.phase).toBe('over');
    expect(['p1', 'p2']).toContain(state.winner);
    const loser = state.winner === 'p1' ? 'p2' : 'p1';
    expect(state.sides[loser].hand).toHaveLength(0);
    expect(state.sides[loser].pick).toBeNull();
    const last = events[events.length - 1];
    expect(last[last.length - 1]).toMatchObject({ type: 'gameOver', winnerSide: state.winner });
    const deaths = events.flat().filter(e => e.type === 'death');
    expect(deaths.length).toBeGreaterThanOrEqual(3);
    expect(() => applyIntent(state, state.winner, { type: 'lock' })).toThrow(/match_over/);
  });

  test('a round win is reported with winner and loser uids', () => {
    const { events } = playOut(11);
    const result = events.flat().find(e => e.type === 'roundResult');
    expect(result).toBeDefined();
    expect(result.winnerUid).toMatch(/^p[12]-\d$/);
    expect(result.loserUid).toMatch(/^p[12]-\d$/);
    expect(result.winnerUid[1]).not.toBe(result.loserUid[1]);
  });
});

describe('viewFor', () => {
  test('hides the opponent pick and the RNG until both are locked', () => {
    let state = applyIntent(freshMatch(), 'p2', { type: 'pick', uid: 'p2-1', style: 'Magic' });
    state = applyIntent(state, 'p2', { type: 'lock' });
    const view = viewFor(state, 'p1');
    expect(view.you).toBe('p1');
    expect(view.rngState).toBeUndefined();
    expect(view.sides.p2.locked).toBe(true);
    expect(view.sides.p2.pick).toBeNull();
    expect(view.sides.p2.hand).toHaveLength(3);
    expect(JSON.stringify(view)).not.toContain('"style":"Magic"');

    const both = lockBoth(freshMatch(), { uid: 'p1-0', style: 'Melee' }, { uid: 'p2-1', style: 'Magic' });
    expect(viewFor(both, 'p1').sides.p2.pick).toEqual({ uid: 'p2-1', style: 'Magic' });
  });
});
