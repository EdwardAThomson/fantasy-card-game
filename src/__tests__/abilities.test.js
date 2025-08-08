import { combatRound, abilityEffects } from '../Game';
import { ABILITIES } from '../creatures';

describe('ability interactions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('all abilities have handlers', () => {
    expect(Object.keys(abilityEffects).sort()).toEqual(
      Object.values(ABILITIES).sort()
    );
  });

  Object.entries(abilityEffects).forEach(([ability, effect]) => {
    test(`${ability} applies its effect`, () => {
      const attacker = {
        name: 'Attacker',
        stats: { strength: 50, agility: 0, intelligence: 0, defense: 0, magic: 0 },
        abilities: [ability],
        currentHealth: effect.type === 'heal' ? 80 : 100,
        maxHealth: 100,
      };
      const defender = {
        name: 'Defender',
        stats: { defense: 0, strength: 50, agility: 0, intelligence: 0, magic: 0 },
        abilities: [],
        currentHealth: 100,
        maxHealth: 100,
        isStunned: false,
      };
      const logFn = jest.fn();
      jest.spyOn(Math, 'random').mockReturnValue(0);

      combatRound(attacker, defender, 'Melee', logFn);

      switch (effect.type) {
        case 'damage':
          expect(defender.currentHealth).toBe(100 - (50 + effect.value));
          break;
        case 'heal':
          expect(attacker.currentHealth).toBe(Math.min(100, 80 + effect.value));
          expect(defender.currentHealth).toBe(50);
          break;
        case 'defense':
          expect(defender.currentHealth).toBe(100 - (50 - effect.value));
          break;
        case 'stun':
          expect(defender.isStunned).toBe(true);
          expect(defender.currentHealth).toBe(50);
          break;
        default:
          throw new Error('Unknown ability type');
      }

      const message = ability.split('_').join(' ');
      expect(
        logFn.mock.calls.some(call => call[0].toLowerCase().includes(message))
      ).toBe(true);
    });
  });
});
