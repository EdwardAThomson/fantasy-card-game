import { combatRound } from '../Game';
import { ABILITIES } from '../creatures';

describe('ability interactions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('fire breath increases damage', () => {
    const attacker = {
      name: 'Dragon',
      stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
      abilities: [ABILITIES.FIRE_BREATH],
      currentHealth: 100,
      maxHealth: 100,
    };
    const defender = {
      name: 'Dummy',
      stats: { defense: 0 },
      currentHealth: 100,
      maxHealth: 100,
    };
    const logFn = jest.fn();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    combatRound(attacker, defender, 'Melee', logFn);

    expect(defender.currentHealth).toBe(40); // 50 base +10 ability
    expect(logFn.mock.calls.some(call => call[0].includes('Fire Breath'))).toBe(true);
  });

  test('heal restores attacker health', () => {
    const attacker = {
      name: 'Forest Spirit',
      stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
      abilities: [ABILITIES.HEAL],
      currentHealth: 80,
      maxHealth: 100,
    };
    const defender = {
      name: 'Dummy',
      stats: { defense: 0 },
      currentHealth: 100,
      maxHealth: 100,
    };
    const logFn = jest.fn();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    combatRound(attacker, defender, 'Melee', logFn);

    expect(attacker.currentHealth).toBe(90); // healed by 10
    expect(defender.currentHealth).toBe(50); // base 50 damage
    expect(logFn.mock.calls.some(call => call[0].includes('Heal'))).toBe(true);
  });

  test('berserk boosts damage slightly', () => {
    const attacker = {
      name: 'Orc',
      stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
      abilities: [ABILITIES.BERSERK],
      currentHealth: 100,
      maxHealth: 100,
    };
    const defender = {
      name: 'Dummy',
      stats: { defense: 0 },
      currentHealth: 100,
      maxHealth: 100,
    };
    const logFn = jest.fn();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    combatRound(attacker, defender, 'Melee', logFn);

    expect(defender.currentHealth).toBe(45); // 50 base +5 berserk
    expect(logFn.mock.calls.some(call => call[0].includes('Berserk'))).toBe(true);
  });

  test('stun prevents next attack', () => {
    const attacker = {
      name: 'Troll',
      stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
      abilities: [ABILITIES.STUN],
      currentHealth: 100,
      maxHealth: 100,
    };
    const defender = {
      name: 'Dummy',
      stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
      abilities: [],
      currentHealth: 100,
      maxHealth: 100,
      isStunned: false,
    };
    const logFn = jest.fn();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    combatRound(attacker, defender, 'Melee', logFn);
    expect(defender.isStunned).toBe(true);

    combatRound(defender, attacker, 'Melee', logFn);
    expect(attacker.currentHealth).toBe(100); // stunned defender deals no damage
    expect(defender.isStunned).toBe(false); // stun wears off
    expect(logFn.mock.calls.some(call => call[0].includes('stunned'))).toBe(true);
  });
});
