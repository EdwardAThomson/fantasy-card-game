import React, { useState } from 'react';
import creatures from './creatures';
import { DECK_SIZE } from './constants';
import Card from './Card';
import { getRandomUniqueCards } from './Game';

function DeckBuilder({ onDecksSelected, singlePlayer = false }) {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [player1Confirmed, setPlayer1Confirmed] = useState(false);

  const activePlayer = player1Confirmed ? 2 : 1;

  const CREATURES_PER_PAGE = 5;
  const totalPages = Math.ceil(creatures.length / CREATURES_PER_PAGE);

  const handleSelectCreature = (creature) => {
    const deck = activePlayer === 1 ? player1Deck : player2Deck;
    const setDeck = activePlayer === 1 ? setPlayer1Deck : setPlayer2Deck;

    if (deck.length >= DECK_SIZE) {
      setError(`Player ${activePlayer} already has ${DECK_SIZE} creatures.`);
      return;
    }

    if (deck.some(c => c.name === creature.name)) {
      setError(`Player ${activePlayer} has already selected ${creature.name}.`);
      return;
    }

    setDeck([...deck, creature]);
    setError('');
  };

  const handleRemoveCreature = (player, creature) => {
    // Players can only modify their own deck during their turn
    if (player !== activePlayer) return;

    const deck = player === 1 ? player1Deck : player2Deck;
    const setDeck = player === 1 ? setPlayer1Deck : setPlayer2Deck;
    const newDeck = deck.filter(c => c.name !== creature.name);
    setDeck(newDeck);
  };

  const handleConfirmDeck = () => {
    if (player1Deck.length < DECK_SIZE) {
      setError(`Player 1 must select ${DECK_SIZE} creatures.`);
      return;
    }
    setPlayer1Confirmed(true);
    setError('');
  };

  const finalizeDecks = () => {
    const copyDeck = deck => deck.map(c => JSON.parse(JSON.stringify(c)));

    if (singlePlayer) {
      if (player1Deck.length !== DECK_SIZE) {
        setError(`You must select exactly ${DECK_SIZE} creatures.`);
        return;
      }
      const aiDeck = getRandomUniqueCards(creatures, DECK_SIZE);
      setError('');
      onDecksSelected(copyDeck(player1Deck), aiDeck);
    } else {
      if (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE) {
        setError(`Each player must select exactly ${DECK_SIZE} creatures.`);
        return;
      }
      setError('');
      onDecksSelected(copyDeck(player1Deck), copyDeck(player2Deck));
    }
  };

  const pageCreatures = creatures.slice(
    page * CREATURES_PER_PAGE,
    (page + 1) * CREATURES_PER_PAGE
  );

  const prevPage = () => setPage((page - 1 + totalPages) % totalPages);
  const nextPage = () => setPage((page + 1) % totalPages);

  const renderDeck = (player, isVisible) => {
    const deck = player === 1 ? player1Deck : player2Deck;
    return (
      <div className="deck-display" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
        <h3>Player {player}'s Deck ({deck.length}/{DECK_SIZE})</h3>
        <div className="player-cards">
          {deck.map(creature => (
            <Card
              key={`${player}-${creature.name}`}
              creature={creature}
              onCardSelect={() => handleRemoveCreature(player, creature)}
              disabled={player !== activePlayer}
            />
          ))}
        </div>
      </div>
    );
  };

  const getInstruction = () => {
    if (singlePlayer) return 'Select your creatures.';
    if (!player1Confirmed) return 'Player 1, select your creatures.';
    return 'Player 2, select your creatures.';
  };

  return (
    <div className="deck-builder">
      <h2>Deck Builder</h2>
      <p>{getInstruction()}</p>

      {/* Player Decks */}
      <div className="player-decks-container">
        {renderDeck(1, true)}
        {!singlePlayer && renderDeck(2, player1Confirmed)}
      </div>

      {/* Creature Pool */}
      <div className="creature-pool">
        <h3>Creature Pool</h3>
        <div className="player-cards">
          {pageCreatures.map(creature => {
            const p1Selected = player1Deck.some(c => c.name === creature.name);
            const p2Selected = player2Deck.some(c => c.name === creature.name);
            const isSelectedByCurrent = activePlayer === 1 ? p1Selected : p2Selected;
            return (
              <Card
                key={creature.name}
                creature={creature}
                onCardSelect={() => handleSelectCreature(creature)}
                disabled={isSelectedByCurrent}
                isSelected={p1Selected || p2Selected}
              />
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem'}}>
          <button onClick={prevPage}>Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={nextPage}>Next</button>
        </div>
      </div>

      {error && <p style={{color: 'red'}}>{error}</p>}

      {/* Action Buttons */}
      <div className="deck-builder-actions">
        {singlePlayer && player1Deck.length === DECK_SIZE && (
          <button onClick={finalizeDecks}>Start Game</button>
        )}
        {!singlePlayer && !player1Confirmed && player1Deck.length === DECK_SIZE && (
          <button onClick={handleConfirmDeck}>Confirm Player 1 Deck</button>
        )}
        {!singlePlayer && player1Confirmed && player2Deck.length === DECK_SIZE && (
          <button onClick={finalizeDecks}>Start Game</button>
        )}
      </div>
    </div>
  );
}

export default DeckBuilder;
