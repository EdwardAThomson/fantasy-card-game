import { getThreeUniqueCards } from '../Game';

describe('getThreeUniqueCards', () => {
  const sampleCreatures = [
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' }
  ];

  test('returns an array of length 3', () => {
    const cards = getThreeUniqueCards(sampleCreatures);
    expect(cards).toHaveLength(3);
  });

  test('returns unique cards', () => {
    const cards = getThreeUniqueCards(sampleCreatures);
    const names = cards.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(3);
  });
});
