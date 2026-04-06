import React, { useState, useEffect, useCallback } from 'react';
import creatures from './creatures';
import Card from './Card';
import Modal from './Modal';
import Tabs from './Tabs';
import { DECK_SIZE } from './constants';
import {
  getRandomUniqueCards,
  handleCombatRound,
  processDoTDamage,
  makeAIDecision,
} from './gameEngine';


// Main Game function
function Game({ player1Deck, player2Deck, singlePlayer = false }) {

  // Initialize player hands using useState
  const [player1Hand, setPlayer1Hand] = useState(() => {
    if (player1Deck && player1Deck.length === DECK_SIZE) {
      return player1Deck.map(card => JSON.parse(JSON.stringify(card)));
    }
    return getRandomUniqueCards(creatures, DECK_SIZE);
  });
  const [player2Hand, setPlayer2Hand] = useState(() => {
    if (player2Deck && player2Deck.length === DECK_SIZE) {
      return player2Deck.map(card => JSON.parse(JSON.stringify(card)));
    }
    return getRandomUniqueCards(creatures, DECK_SIZE);
  });

  // Selected card in each hand
  const [player1SelectedCard, setPlayer1SelectedCard] = useState(null);
  const [player2SelectedCard, setPlayer2SelectedCard] = useState(null);

  // Store the combat choice for both players
  const [player1Choice, setPlayer1Choice] = useState('');
  const [player2Choice, setPlayer2Choice] = useState('');

  // Store combat log messages
  const [logMessages, setLogMessages] = useState([]);
  
  // Store damage events for flying text animations
  const [player1DamageEvents, setPlayer1DamageEvents] = useState([]);
  const [player2DamageEvents, setPlayer2DamageEvents] = useState([]);
  
  // Store ability usage for icon animations
  const [abilityUsed, setAbilityUsed] = useState(null);

  const addLog = (message) => {
    setLogMessages(prev => [...prev, message]);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(false);
  const [dyingCards, setDyingCards] = useState([]);

  // variables used in combat
  const [round, setRound] = useState(1); // Track the number of rounds

  // AI decision logic
  const runAIDecision = useCallback(() => {
    if (!singlePlayer) return;
    if (!player1SelectedCard || !player1Choice) return;
    if (player2Hand.length === 0) return;

    const best = makeAIDecision(player2Hand);
    if (best) {
      setPlayer2SelectedCard(best.card);
      setPlayer2Choice(best.choice);
    }
  }, [singlePlayer, player1SelectedCard, player1Choice, player2Hand]);

  useEffect(() => {
    runAIDecision();
  }, [runAIDecision]);

  // Auto-select card if only one remains for player 1
  useEffect(() => {
    if (player1Hand.length === 1 && !player1SelectedCard) {
      setPlayer1SelectedCard(player1Hand[0]);
    }
  }, [player1Hand, player1SelectedCard]);

  // Auto-select card if only one remains for player 2 (in two-player mode)
  useEffect(() => {
    if (!singlePlayer && player2Hand.length === 1 && !player2SelectedCard) {
      setPlayer2SelectedCard(player2Hand[0]);
    }
  }, [player2Hand, player2SelectedCard, singlePlayer]);

 // Handle card selection for Player 1
  const handlePlayer1CardSelect = (card) => {
    setPlayer1SelectedCard(card); // Set the card as selected
  };

  // Handle combat choice for Player 1
  const handlePlayer1ChoiceSelect = (choice) => {
    setPlayer1Choice(choice);     // Set the chosen action
  };

  // Handle card selection for Player 2
  const handlePlayer2CardSelect = (card) => {
    setPlayer2SelectedCard(card); // Set the card as selected
  };

  // Handle combat choice for Player 2
  const handlePlayer2ChoiceSelect = (choice) => {
    setPlayer2Choice(choice);     // Set the chosen action
  };


  // Check for victory (overall) when hands change
  useEffect(() => {
    if (player1Hand.length === 0) {
      setModalMessage('Player 2 is the winner!');
      setIsModalOpen(true);
      addLog('Player 2 is the winner!');
    } else if (player2Hand.length === 0) {
      setModalMessage('Player 1 is the winner!');
      setIsModalOpen(true);
      addLog('Player 1 is the winner!');
    }
  }, [player1Hand, player2Hand]);  // This will trigger when player1Hand or player2Hand changes

  // Fight logic
  // - Call combat functions
  // - Victory conditions (for a combat round) check
  const Fight = () => {
    addLog(`-------- Round ${round} --------`);

    const logDefensiveProfile = (card, sideLabel) => {
      if (!card) return;
      const immunities = Array.isArray(card.immunities) && card.immunities.length > 0
        ? card.immunities.join(', ')
        : 'none';
      const resistanceEntries = card.resistances
        ? Object.entries(card.resistances).map(([effect, multiplier]) => {
            const percent = Math.round(multiplier * 100);
            return `${effect} (${percent}% effect)`;
          })
        : [];
      const resistances = resistanceEntries.length > 0 ? resistanceEntries.join(', ') : 'none';
      addLog(`${sideLabel} ${card.name} defenses → Immunities: ${immunities}; Resistances: ${resistances}`);
    };

    logDefensiveProfile(player1SelectedCard, 'Player 1');
    logDefensiveProfile(player2SelectedCard, 'Player 2');

    // Process DoT (damage over time) effects at the start of the round
    const p1DotDamage = processDoTDamage(player1SelectedCard, addLog);
    const p2DotDamage = processDoTDamage(player2SelectedCard, addLog);
    
    // Track DoT damage for visual effects
    const dotDamageEvents = [];
    if (p1DotDamage > 0) {
      dotDamageEvents.push({ damage: p1DotDamage, type: 'damage', cardName: player1SelectedCard.name, side: 'p1' });
    }
    if (p2DotDamage > 0) {
      dotDamageEvents.push({ damage: p2DotDamage, type: 'damage', cardName: player2SelectedCard.name, side: 'p2' });
    }
    
    // Show DoT damage visuals
    if (dotDamageEvents.length > 0) {
      const p1DotEvents = dotDamageEvents.filter(e => e.side === 'p1');
      const p2DotEvents = dotDamageEvents.filter(e => e.side === 'p2');
      setPlayer1DamageEvents(p1DotEvents);
      setPlayer2DamageEvents(p2DotEvents);
      
      // Clear DoT damage events after animation
      setTimeout(() => {
        setPlayer1DamageEvents([]);
        setPlayer2DamageEvents([]);
      }, 1500);
    }

    // Clear stun status at the start of the round (BEFORE combat)
    // If a creature was stunned in the previous round, they will skip their turn in THIS round
    // Then the stun is cleared here, so they can act in the NEXT round
    const wasPlayer1Stunned = player1SelectedCard && player1SelectedCard.isStunned;
    const wasPlayer2Stunned = player2SelectedCard && player2SelectedCard.isStunned;
    
    if (wasPlayer1Stunned) {
      addLog(`${player1SelectedCard.name} is recovering from stun...`);
    }
    if (wasPlayer2Stunned) {
      addLog(`${player2SelectedCard.name} is recovering from stun...`);
    }
    
    // Clear status effects at the start of each round (they last one round)
    if (player1SelectedCard && player1SelectedCard.statusEffects) {
      player1SelectedCard.statusEffects = [];
    }
    if (player2SelectedCard && player2SelectedCard.statusEffects) {
      player2SelectedCard.statusEffects = [];
    }

    const outcome = handleCombatRound(
      player1SelectedCard,
      player2SelectedCard,
      player1Choice,
      player2Choice,
      addLog
    );
    
    // Clear stun AFTER combat (so the stunned creature skipped their turn this round)
    if (wasPlayer1Stunned) {
      player1SelectedCard.isStunned = false;
    }
    if (wasPlayer2Stunned) {
      player2SelectedCard.isStunned = false;
    }

    if (outcome.haveWinner) {
      const winnerPlayer = outcome.winner === player1SelectedCard ? 'Player 1' : 'Player 2';
      setModalMessage(`${outcome.winner.name} (${winnerPlayer}) wins the round!`);
      setIsModalOpen(true);
      addLog(`${outcome.winner.name} (${winnerPlayer}) wins the round!`);
    }
    
    const p1DamageEvents = [];
    const p2DamageEvents = [];

    // Trigger damage events for flying text immediately (no delay)
    // Only show damage if the card is still alive
    if (outcome.player1Damage > 0 && player1SelectedCard.currentHealth > 0) {
      p1DamageEvents.push({ damage: outcome.player1Damage, type: 'damage', cardName: player1SelectedCard.name });
    }
    if (outcome.player2Damage > 0 && player2SelectedCard.currentHealth > 0) {
      p2DamageEvents.push({ damage: outcome.player2Damage, type: 'damage', cardName: player2SelectedCard.name });
    }
    if (outcome.player1Heal > 0) {
      p1DamageEvents.push({ damage: outcome.player1Heal, type: 'heal', cardName: player1SelectedCard.name });
    }
    if (outcome.player2Heal > 0) {
      p2DamageEvents.push({ damage: outcome.player2Heal, type: 'heal', cardName: player2SelectedCard.name });
    }

    setPlayer1DamageEvents(p1DamageEvents);
    setPlayer2DamageEvents(p2DamageEvents);
    
    // Set ability used for icon animation
    if (outcome.abilityUsed) {
      setAbilityUsed(outcome.abilityUsed);
    }

    // Update hands with new health and status (including isStunned from combat)
    setPlayer1Hand(prevHand => prevHand.map(card => card.name === outcome.player1card.name ? outcome.player1card : card));
    setPlayer2Hand(prevHand => prevHand.map(card => card.name === outcome.player2card.name ? outcome.player2card : card));
    
    // Note: Stun status will persist until the next round starts
    // It will be cleared at the END of the next round's combat (after the stunned creature skips their turn)

    // Clear events after a delay
    setTimeout(() => {
      setPlayer1DamageEvents([]);
      setPlayer2DamageEvents([]);
      setAbilityUsed(null);
    }, 2000);

    // Remove cards on zero HP (with death animation)
    const deadCards = [];
    if (player1SelectedCard.currentHealth <= 0) {
      setPlayer1DamageEvents([]);
      deadCards.push(player1SelectedCard.name);
      addLog(`${player1SelectedCard.name} (Player 1) has been killed.`);
      setTimeout(() => {
        setPlayer1Hand(prevHand =>
          prevHand.filter(card => card.name !== player1SelectedCard.name)
        );
        setDyingCards(prev => prev.filter(n => n !== player1SelectedCard.name));
      }, 600);
      setPlayer1SelectedCard(null);
      setPlayer1Choice('');
    }
    if (player2SelectedCard.currentHealth <= 0) {
      setPlayer2DamageEvents([]);
      deadCards.push(player2SelectedCard.name);
      addLog(`${player2SelectedCard.name} (Player 2) has been killed.`);
      setTimeout(() => {
        setPlayer2Hand(prevHand =>
          prevHand.filter(card => card.name !== player2SelectedCard.name)
        );
        setDyingCards(prev => prev.filter(n => n !== player2SelectedCard.name));
      }, 600);
      setPlayer2SelectedCard(null);
      setPlayer2Choice('');
    }
    if (deadCards.length > 0) {
      setDyingCards(prev => [...prev, ...deadCards]);
    }

    setRound(prev => prev + 1);
  } // ends Fight function


  // Combat button should only be enabled if both players have selected a stat
  const isCombatReady =
    player1SelectedCard &&
    player2SelectedCard &&
    player1Choice &&
    player2Choice &&
    player1SelectedCard.currentHealth > 0 &&
    player2SelectedCard.currentHealth > 0;

  // Determine tint color for Fight CTA based on chosen style
  const styleColorMap = { Melee: '#22c55e', Ranged: '#3b82f6', Magic: '#ef4444' };
  const fightTint = styleColorMap[player1Choice] || styleColorMap[player2Choice] || undefined;
  const glowClass = singlePlayer ? 'glow-ai' : 'glow-player';

  // Overall game over when a player's hand is empty
  const isGameOver = player1Hand.length === 0 || player2Hand.length === 0;

  // Full reset: refresh the app (simple, reliable)
  const resetGame = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Reset current round selections (helper for UX)
  const resetSelections = () => {
    setPlayer1SelectedCard(null);
    setPlayer2SelectedCard(null);
    setPlayer1Choice('');
    setPlayer2Choice('');
  };

  // <h1>Fantasy Card Combat Game</h1>
  
  return (
    <>
    
    <div className="app-wrapper">
      <div className="game-container">
        <div className="game-main">

          <div className="players-container">
            {/* Player 1 Area */}
            <div className="player-area">
              <div className="player-info">
                <h2>Player 1</h2>
                <div className="combat-buttons">
                  <button
                    className={`btn-choice is-melee ${player1Choice === 'Melee' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Melee')}
                    aria-pressed={player1Choice === 'Melee'}
                  >
                    🗡️ Melee
                  </button>
                  <button
                    className={`btn-choice is-ranged ${player1Choice === 'Ranged' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Ranged')}
                    aria-pressed={player1Choice === 'Ranged'}
                  >
                    🏹 Ranged
                  </button>
                  <button
                    className={`btn-choice is-magic ${player1Choice === 'Magic' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Magic')}
                    aria-pressed={player1Choice === 'Magic'}
                  >
                    🪄 Magic
                  </button>
                </div>
              </div>
              <div className="player-hand">
                {player1Hand.map((card, index) => (
                  <Card
                    key={index}
                    creature={card}
                    onCardSelect={() => handlePlayer1CardSelect(card)}
                    isSelected={player1SelectedCard === card}
                    isDying={dyingCards.includes(card.name)}
                    side="p1"
                    damageEvents={player1DamageEvents}
                    abilityUsed={abilityUsed}
                  />
                ))}
              </div>
            </div>

            {/* Player 2 Area */}
            <div className="player-area">
              <div className="player-info">
                <h2>Player 2</h2>
                <div className="combat-buttons">
                  <button
                    className={`btn-choice is-melee ${player2Choice === 'Melee' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Melee')}
                    aria-pressed={player2Choice === 'Melee'}
                    disabled={singlePlayer}
                  >
                    🗡️ Melee
                  </button>
                  <button
                    className={`btn-choice is-ranged ${player2Choice === 'Ranged' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Ranged')}
                    aria-pressed={player2Choice === 'Ranged'}
                    disabled={singlePlayer}
                  >
                    🏹 Ranged
                  </button>
                  <button
                    className={`btn-choice is-magic ${player2Choice === 'Magic' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Magic')}
                    aria-pressed={player2Choice === 'Magic'}
                    disabled={singlePlayer}
                  >
                    🪄 Magic
                  </button>
                </div>
              </div>
              <div className="player-hand">
                {player2Hand.map((card, index) => (
                  <Card
                    key={index}
                    creature={card}
                    onCardSelect={() => handlePlayer2CardSelect(card)}
                    isSelected={player2SelectedCard === card}
                    isDying={dyingCards.includes(card.name)}
                    disabled={singlePlayer}
                    side="p2"
                    damageEvents={player2DamageEvents}
                    abilityUsed={abilityUsed}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fight button */}
          <div className="fight-cta">
            <button
              className={`btn btn-primary btn-lg ${fightTint ? 'tinted' : ''} ${isCombatReady ? `btn-glow ${glowClass}` : ''}`}
              style={fightTint ? { '--choice': fightTint } : undefined}
              onClick={Fight}
              disabled={!isCombatReady}
              aria-label="Start combat"
            >
              ⚔️ Fight!
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={resetSelections}
              aria-label="Reset selections"
            >
              Reset selections
            </button>
          </div>

          {/* New Game / Reset, only after game ends */}
          {isGameOver && (
            <div className="fight-cta" style={{ marginTop: 16 }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={resetGame}
                aria-label="Start a new game"
              >
                🔁 New Game
              </button>
            </div>
          )}

        </div>
      </div>

      <div className={`combat-log${isCombatLogOpen ? ' open' : ''}`}>
        <h3>Combat Log</h3>
        {logMessages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <button
        className="combat-log-toggle"
        onClick={() => setIsCombatLogOpen(!isCombatLogOpen)}
        title="Toggle combat log"
      >
        {isCombatLogOpen ? '✕' : '📜'}
      </button>
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <h2>{modalMessage}</h2>
    </Modal>
    <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)}>
      <h2>How to Play</h2>
      <Tabs>
        <div label="Game Flow">
          <p><strong>Objective:</strong> Defeat all of your opponent's creatures to win the game!</p>
          <br/>
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
                      <li>Creatures attack one by one, with the faster creature (based on Agility and Intelligence) striking first.</li>
                      <li>Damage is calculated based on your chosen combat style vs. the opponent's defense.</li>
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
          <br/>
          <h4>Initiative:</h4>
          <p>The creature with the higher initiative attacks first. Initiative is calculated based on a creature's Agility and Intelligence stats.</p>
        </div>
        <div label="Abilities">
          <h4>Abilities:</h4>
          <p>Creatures have a 50% chance to use a special ability during combat. Abilities can deal extra damage, heal, provide defense, or apply status effects.</p>
          <ul>
              <li><strong>Damage Abilities:</strong> Deal bonus damage (e.g., Fire Breath, Berserk, Backstab).</li>
              <li><strong>Heal Abilities:</strong> Restore health to the creature (e.g., Heal, Rally).</li>
              <li><strong>Defense Abilities:</strong> Reduce incoming damage (e.g., Shield Wall, Evasion).</li>
              <li><strong>Stun:</strong> Causes the opponent to skip their next turn (e.g., Stun, Constrict).</li>
          </ul>
          <br/>
          <h4>Status Effects:</h4>
          <p>Status effects appear as colored badges on creature cards and last for one round.</p>
          <ul>
              <li><strong>🔥 Burning:</strong> Takes 5 damage per round for 2 rounds (Fire Breath, Burn).</li>
              <li><strong>☠️ Poisoned:</strong> Takes 4 damage per round for 3 rounds (Poison Bite).</li>
              <li><strong>🩸 Bleeding:</strong> Takes 3 damage per round for 3 rounds (Backstab).</li>
              <li><strong>❄️ Frozen:</strong> Stuns the target for 1 round and deals 2 damage per round for 2 rounds (Water Blast, Tidal Wave).</li>
              <li><strong>🦑 Constricted:</strong> Takes 3 damage per round for 2 rounds (Crushing Grip).</li>
              <li><strong>✨ Blessed:</strong> Indicates a buff is active (Heal, Shield Wall).</li>
              <li><strong>🌙 Cursed:</strong> Dark magic effect (Curse, Soul Reap).</li>
              <li><strong>⭐ Stunned:</strong> Creature skips its next turn completely.</li>
          </ul>
          <br/>
          <h4>Damage Over Time (DoT):</h4>
          <p>Some abilities apply DoT effects that deal damage at the start of each round. DoT damage is applied before combat begins and is shown in the combat log.</p>
        </div>
        <div label="Visual Effects">
          <h4>Visual Feedback:</h4>
          <ul>
              <li><strong>Flying Numbers:</strong> Damage and healing amounts fly up from cards.</li>
              <li><strong>Ability Icons:</strong> Emoji icons pop up when abilities are used (🔥💚⚡🗡️ etc).</li>
              <li><strong>Status Badges:</strong> Colored badges show active status effects in the center of cards.</li>
              <li><strong>Card Glow:</strong> Cards glow green when buffed, red when debuffed.</li>
              <li><strong>Shake Animation:</strong> Cards shake when taking damage.</li>
          </ul>
        </div>
      </Tabs>
    </Modal>
    <button className="help-button" onClick={() => setIsHelpModalOpen(true)}>?</button>
    </>
  );
}

export default Game;
