import React, { useState } from 'react';
import creatures from './creatures';
import { DECK_SIZE } from './constants';
import Card from './Card';
import { getRandomUniqueCards } from './gameEngine';
import Modal from './Modal';
import Tabs from './Tabs';

function DeckBuilder({ onDecksSelected, singlePlayer = false }) {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [player1Confirmed, setPlayer1Confirmed] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
        <div className="pagination-controls">
          <button onClick={prevPage} className="btn btn-secondary">Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={nextPage} className="btn btn-secondary">Next</button>
        </div>
      </div>

      {error && <p style={{color: 'red'}}>{error}</p>}

      {/* Action Buttons */}
      <div className="deck-builder-actions">
        {singlePlayer && player1Deck.length === DECK_SIZE && (
          <button onClick={finalizeDecks} className="btn btn-primary">Start</button>
        )}
        {!singlePlayer && !player1Confirmed && player1Deck.length === DECK_SIZE && (
          <button onClick={handleConfirmDeck} className="btn btn-primary">Confirm Player 1 Deck</button>
        )}
        {!singlePlayer && player1Confirmed && player2Deck.length === DECK_SIZE && (
          <button onClick={finalizeDecks} className="btn btn-primary">Start</button>
        )}
      </div>

      <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)}>
        <h2>How to Play</h2>
        <Tabs>
          <div label="Game Flow">
            <p><strong>Objective:</strong> Defeat all of your opponent's creatures to win the game!</p>
            <h4>Game Flow:</h4>
            <ol>
                <li>Each player is dealt a hand of three unique creature cards.</li>
                <li><strong>Selection Phase:</strong>
                    <ul>
                        <li>Select one of your creatures to send into combat by clicking on its card.</li>
                        <li>Choose a combat style for that round: Melee, Ranged, or Magic.</li>
                    </ul>
                </li>
                <li><strong>Combat Phase:</strong>
                    <ul>
                        <li>Once both players have made their selections, click the "Fight!" button.</li>
                        <li>DoT damage is applied at the start of the round, before combat.</li>
                        <li>Initiative determines attack order (based on Agility and Intelligence).</li>
                        <li>The faster creature attacks first, then the slower one retaliates (if still alive).</li>
                        <li>A creature is defeated and removed from the game when its HP reaches 0.</li>
                    </ul>
                </li>
                <li>The round ends after both creatures have attacked. The player with the last creature standing wins the game.</li>
            </ol>
          </div>
          <div label="Combat">
            <h4>Combat Styles:</h4>
            <ul>
                <li><strong>Melee (🗡️):</strong> Based on the creature's <strong>Strength</strong> stat.</li>
                <li><strong>Ranged (🏹):</strong> Based on the creature's <strong>Agility</strong> stat.</li>
                <li><strong>Magic (🪄):</strong> Based on the creature's <strong>Magic</strong> stat.</li>
            </ul>
            <h4>Damage Formula:</h4>
            <p>Base Attack = Combat Stat + Random(0–20), minus half of opponent's Defense.</p>
            <h4>Initiative:</h4>
            <p>The creature with the higher initiative attacks first. Initiative is calculated from 40% Agility + 60% Intelligence, plus a random roll.</p>
          </div>
          <div label="Abilities">
            <h4>Abilities:</h4>
            <p>Creatures have a 50% chance to use a special ability during combat. Abilities can deal extra damage, heal, provide defense, or apply status effects.</p>
            <ul>
                <li><strong>Damage:</strong> Deal bonus damage (e.g., Fire Breath, Berserk, Backstab, Thunder Strike, Nature's Wrath).</li>
                <li><strong>Heal:</strong> Restore health (e.g., Heal, Rally, Regenerate). Regenerate also heals over time.</li>
                <li><strong>Defense:</strong> Reduce incoming damage (e.g., Shield Wall, Fortify, Evasion, Camouflage).</li>
                <li><strong>Stun:</strong> Causes the opponent to skip their next turn (e.g., Stun, Constrict, Entangle).</li>
            </ul>
            <h4>Immunities &amp; Resistances:</h4>
            <p>Many creatures have immunities that make them completely immune to certain status effects. Some also have resistances that reduce their effectiveness.</p>
          </div>
          <div label="Status Effects">
            <h4>Damage Over Time (DoT):</h4>
            <p>DoT effects deal damage at the start of each round, before combat. Multiple DoTs can stack.</p>
            <ul>
                <li><strong>🔥 Burning:</strong> 5 damage/round for 2 rounds.</li>
                <li><strong>☠️ Poisoned:</strong> 4 damage/round for 3 rounds.</li>
                <li><strong>🩸 Bleeding:</strong> 3 damage/round for 3 rounds.</li>
                <li><strong>❄️ Frozen:</strong> Stuns + 2 damage/round for 2 rounds.</li>
                <li><strong>🦑 Constricted:</strong> 3 damage/round for 2 rounds.</li>
            </ul>
            <h4>Buffs &amp; Debuffs:</h4>
            <ul>
                <li><strong>✨ Blessed:</strong> Reduces incoming damage by 10%.</li>
                <li><strong>🌙 Cursed:</strong> Amplifies incoming damage by 10%.</li>
                <li><strong>⭐ Stunned:</strong> Creature skips its next turn completely.</li>
            </ul>
          </div>
        </Tabs>
      </Modal>
      <button className="help-button" onClick={() => setIsHelpModalOpen(true)}>?</button>
    </div>
  );
}

export default DeckBuilder;
