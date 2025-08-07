import { getRandomUniqueCards } from '../Game';
import { DECK_SIZE } from '../constants';

describe('getRandomUniqueCards', () => {
  const sampleCreatures = [
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' }
  ];

  test('returns an array of specified length', () => {
    const cards = getRandomUniqueCards(sampleCreatures, DECK_SIZE);
    expect(cards).toHaveLength(DECK_SIZE);
  });

  test('returns unique cards', () => {
    const cards = getRandomUniqueCards(sampleCreatures, DECK_SIZE);
    const names = cards.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(DECK_SIZE);
  });
});
