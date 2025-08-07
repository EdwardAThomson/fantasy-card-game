import React, { useState } from 'react';
import creatures from './creatures';
import { DECK_SIZE } from './constants';

function DeckBuilder({ onDecksSelected }) {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const CREATURES_PER_PAGE = 5;
  const totalPages = Math.ceil(creatures.length / CREATURES_PER_PAGE);

  const toggleSelection = (player, creature) => {
    const deck = player === 1 ? player1Deck : player2Deck;
    const setDeck = player === 1 ? setPlayer1Deck : setPlayer2Deck;
    const isSelected = deck.some(c => c.name === creature.name);

    let newDeck;
    if (isSelected) {
      newDeck = deck.filter(c => c.name !== creature.name);
    } else {
      if (deck.length >= DECK_SIZE) {
        setError(`Player ${player} already has ${DECK_SIZE} creatures.`);
        return;
      }
      newDeck = [...deck, creature];
    }
    setError('');
    setDeck(newDeck);
  };

  const finalizeDecks = () => {
    if (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE) {
      setError(`Each player must select exactly ${DECK_SIZE} creatures.`);
      return;
    }
    const unique1 = new Set(player1Deck.map(c => c.name));
    const unique2 = new Set(player2Deck.map(c => c.name));
    if (unique1.size !== DECK_SIZE || unique2.size !== DECK_SIZE) {
      setError('Duplicate selections are not allowed.');
      return;
    }
    setError('');
    // Deep copy to avoid modifying the original objects during the game
    const copyDeck = deck => deck.map(c => JSON.parse(JSON.stringify(c)));
    onDecksSelected(copyDeck(player1Deck), copyDeck(player2Deck));
  };

  const renderCreature = (creature, player) => {
    const deck = player === 1 ? player1Deck : player2Deck;
    const isSelected = deck.some(c => c.name === creature.name);
    const disabled = deck.length >= DECK_SIZE && !isSelected;
    return (
      <label key={`${player}-${creature.name}`} style={{display: 'block'}}>
        <input
          type="checkbox"
          checked={isSelected}
          disabled={disabled}
          onChange={() => toggleSelection(player, creature)}
        />
        {creature.name}
      </label>
    );
  };

  const pageCreatures = creatures.slice(
    page * CREATURES_PER_PAGE,
    (page + 1) * CREATURES_PER_PAGE
  );

  const prevPage = () =>
    setPage((page - 1 + totalPages) % totalPages);
  const nextPage = () =>
    setPage((page + 1) % totalPages);

  return (
    <div>
      <h2>Deck Builder</h2>
      <div style={{display: 'flex', justifyContent: 'space-around'}}>
        <div>
          <h3>Player 1</h3>
          {pageCreatures.map(creature => renderCreature(creature, 1))}
        </div>
        <div>
          <h3>Player 2</h3>
          {pageCreatures.map(creature => renderCreature(creature, 2))}
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem'}}>
        <button onClick={prevPage}>Prev</button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button onClick={nextPage}>Next</button>
      </div>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button onClick={finalizeDecks}>Start Game</button>
    </div>
  );
}

export default DeckBuilder;
