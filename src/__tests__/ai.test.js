import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../Game';
import { makeAIDecision } from '../gameEngine';

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

test('makeAIDecision picks the card and style with the highest attack stat', () => {
  const hand = [
    createCard('Warrior', { strength: 10, agility: 1, magic: 1 }),
    createCard('Archer', { strength: 1, agility: 8, magic: 1 }),
    createCard('Mage', { strength: 1, agility: 1, magic: 12 }),
  ];
  const best = makeAIDecision(hand);
  expect(best.card.name).toBe('Mage');
  expect(best.choice).toBe('Magic');

  // Fainted cards are never picked
  hand[2].currentHealth = 0;
  expect(makeAIDecision(hand).card.name).toBe('Warrior');
  expect(makeAIDecision(hand).choice).toBe('Melee');
});

test('AI picks in secret and its card is revealed when the fight starts', async () => {
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

  // The AI hand is face down from the start
  expect(screen.queryByText('Mage')).toBeNull();
  expect(screen.getAllByRole('img', { name: /^Hidden card/ })).toHaveLength(3);

  fireEvent.click(screen.getByText('Hero'));
  fireEvent.click(screen.getAllByText(/Melee/)[0]);

  // The AI commits to a card without revealing which one it is
  const fightBtn = screen.getByRole('button', { name: 'Start combat' });
  await waitFor(() => expect(fightBtn.disabled).toBe(false));
  const backs = screen.getAllByRole('img', { name: /^Hidden card/ });
  expect(backs[2]).toHaveAttribute('aria-label', 'Hidden card, chosen to fight');
  expect(backs[2].classList.contains('selected')).toBe(true);
  expect(screen.queryByText('Mage')).toBeNull();

  fireEvent.click(fightBtn);

  // The chosen card flips over and fights with Magic
  await waitFor(() => {
    expect(screen.getByText('Mage')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText('Attacker: Mage (Magic)')).toBeInTheDocument();
  });
  expect(screen.queryByText('Warrior')).toBeNull();
  expect(screen.queryByText('Archer')).toBeNull();

  Math.random.mockRestore();
});

test('AI does not act in two player mode', async () => {
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

  render(<Game player1Deck={player1Deck} player2Deck={player2Deck} />);

  fireEvent.click(screen.getByText('Hero'));
  fireEvent.click(screen.getAllByText(/Melee/)[0]);

  await waitFor(() => {
    const aiMagicBtn = screen.getAllByText(/Magic/)[1].closest('button');
    expect(aiMagicBtn.classList.contains('selected')).toBe(false);
    const fightBtn = screen.getByText(/Fight/i);
    expect(fightBtn.disabled).toBe(true);
  });
});
