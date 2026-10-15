import { random, setRandomSource, seededRandom } from '../rng';
import TUTORIAL, { buildTutorialDecks, OPPONENT_PLAN, TUTORIAL_STEPS } from '../tutorial/tutorialScript';
import { handleCombatRound } from '../gameEngine';

afterEach(() => setRandomSource(null));

describe('seeded random source', () => {
  test('same seed gives the same sequence', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    seqA.forEach(n => expect(n >= 0 && n < 1).toBe(true));
  });

  test('engine random follows the installed source and falls back to Math.random', () => {
    setRandomSource(() => 0.25);
    expect(random()).toBe(0.25);
    setRandomSource(null);
    jest.spyOn(Math, 'random').mockReturnValue(0.75);
    expect(random()).toBe(0.75);
    Math.random.mockRestore();
  });
});

describe('tutorial script', () => {
  test('opponent creatures are weakened and fully healed', () => {
    const { player, opponent } = buildTutorialDecks();
    expect(player).toHaveLength(3);
    expect(opponent).toHaveLength(3);
    opponent.forEach(card => {
      expect(card.currentHealth).toBe(card.maxHealth);
      expect(card.maxHealth).toBeLessThan(200);
    });
  });

  test('opponent has a planned move for every creature', () => {
    const { opponent } = buildTutorialDecks();
    opponent.forEach(card => expect(OPPONENT_PLAN[card.name]).toBeDefined());
  });

  test('every card the steps point at is in the tutorial decks', () => {
    const { player, opponent } = buildTutorialDecks();
    const names = [...player, ...opponent].map(c => c.name);
    TUTORIAL_STEPS.forEach(step => {
      const targets = [step.target, ...(step.allow || [])].filter(Boolean).join(' ');
      for (const [, name] of targets.matchAll(/card-([^"]+?)"/g)) {
        if (!['health', 'stats', 'element'].includes(name)) expect(names).toContain(name);
      }
    });
  });

  test('the guided first round plays out the same way every time', () => {
    const play = () => {
      setRandomSource(seededRandom(TUTORIAL.seed));
      const { player, opponent } = buildTutorialDecks();
      handleCombatRound(player[0], opponent[0], 'Magic', OPPONENT_PLAN[opponent[0].name], () => {});
      return [player[0].currentHealth, opponent[0].currentHealth];
    };
    const first = play();
    expect(play()).toEqual(first);
    // Nobody falls before the tutorial has explained the round
    expect(first[0]).toBeGreaterThan(0);
    expect(first[1]).toBeGreaterThan(0);
  });
});
