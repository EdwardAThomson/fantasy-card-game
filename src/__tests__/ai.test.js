import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../Game';

const createCard = (name, stats) => ({
  name,
  image: '',
  stats: {
    strength: stats.strength || 0,
    agility: stats.agility || 0,
    intelligence: 0,
    defense: 0,
    magic: stats.magic || 0,
  },
  abilities: [],
  currentHealth: 100,
  maxHealth: 100,
});

test('AI selects highest stat card and style', async () => {
  const player1Deck = [
    createCard('Hero', { strength: 5, agility: 5, magic: 5 }),
    createCard('Spare1', { strength: 4, agility: 4, magic: 4 }),
    createCard('Spare2', { strength: 3, agility: 3, magic: 3 }),
  ];
  const player2Deck = [
    createCard('Warrior', { strength: 10, agility: 1, magic: 1 }),
    createCard('Archer', { strength: 1, agility: 8, magic: 1 }),
    createCard('Mage', { strength: 1, agility: 1, magic: 12 }),
  ];

  jest.spyOn(Math, 'random').mockReturnValue(0);

  render(
    <Game
      player1Deck={player1Deck}
      player2Deck={player2Deck}
      singlePlayer
    />
  );

  fireEvent.click(screen.getByText('Hero'));
  fireEvent.click(screen.getAllByText('Melee')[0]);

  await waitFor(() => {
    const aiMagicBtn = screen.getAllByText('Magic')[1].closest('button');
    expect(aiMagicBtn.classList.contains('selected')).toBe(true);
    const mageCard = screen.getByText('Mage').closest('.card');
    expect(mageCard.classList.contains('selected')).toBe(true);
  });

  const fightBtn = screen.getByText(/Fight/i);
  expect(fightBtn.disabled).toBe(false);
  fireEvent.click(fightBtn);

  await waitFor(() => {
    expect(screen.queryByText(/Round 1/i)).not.toBeNull();
  });

  Math.random.mockRestore();
});
