import {
  combatRound,
  applyStatusEffect,
  applyDoT,
  processDoTDamage,
} from '../gameEngine';
import creatures, { ABILITIES } from '../creatures';

const cloneCreature = (name) => {
  const original = creatures.find((c) => c.name === name);
  if (!original) throw new Error(`Creature ${name} not found`);
  return JSON.parse(JSON.stringify(original));
};

describe('Immunity smoke tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Fire Elemental ignores burning damage abilities', () => {
    const attacker = cloneCreature('Phoenix');
    const defender = cloneCreature('Fire Elemental');

    attacker.selectedAbility = ABILITIES.FIRE_BREATH;

    const logSpy = jest.fn();
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // attack roll randomness
      .mockReturnValueOnce(0.1); // ability trigger (ensures ability fires)

    const initialHealth = defender.currentHealth;
    const outcome = combatRound(attacker, defender, 'Magic', logSpy);

    expect(randomSpy).toHaveBeenCalled();
    expect(outcome.damageDealt).toBe(0);
    expect(defender.currentHealth).toBe(initialHealth);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('is immune to burning'));
  });

  test('Giant Spider resists poison damage over time', () => {
    const spider = cloneCreature('Giant Spider');
    spider.currentHealth = 300;

    const logSpy = jest.fn();

    applyDoT(spider, { damage: 4, duration: 3 }, 'poisoned', logSpy);
    expect(spider.dotEffects).toHaveLength(1);

    const totalDamage = processDoTDamage(spider, logSpy);

    expect(totalDamage).toBe(2);
    expect(spider.currentHealth).toBe(298);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('resists some of')); // resistance message
  });

  test('Undead Knight is immune to bleeding status', () => {
    const undead = cloneCreature('Undead Knight');
    const logSpy = jest.fn();

    applyStatusEffect(undead, 'bleeding', logSpy);

    expect(undead.statusEffects).toEqual([]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('shrugs off Bleeding'));
  });
});
