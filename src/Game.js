import React, { useState, useEffect } from 'react';
import creatures, { ABILITIES } from './creatures';  // Import the creatures data and ability IDs
import Card from './Card';  // Import the Card component
import Modal from './Modal'; // Import the Modal component
import { DECK_SIZE } from './constants';


// Deck Creation
// - draw a number of unique cards
const getRandomUniqueCards = (creaturesList, count) => {
  const selectedIndices = new Set();  // Use a set to store unique indices
  const selectedCards = [];

  // Continue generating indices until we have the desired number of unique ones
  while (selectedIndices.size < count) {
    const randomIndex = Math.floor(Math.random() * creaturesList.length);

    // If this index has not been selected yet, add it to the set and push the creature
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);

      // Create a deep copy of the selected creature
      const creatureCopy = JSON.parse(JSON.stringify(creaturesList[randomIndex]));
      selectedCards.push(creatureCopy);
    }
  }

  return selectedCards;
};

// Function to get the combat stat based on style choice
function getCombatStat (attacker, choice) {
    switch (choice) {
      case 'Melee':
        return attacker.stats.strength;
      case 'Ranged':
        return attacker.stats.agility;
      case 'Magic':
        return attacker.stats.magic;
      default:
        return 0; // Default to 0 if no valid choice
    }
}

// Ability configuration
const abilityEffects = {
  [ABILITIES.FIRE_BREATH]: { type: 'damage', value: 10 },
  [ABILITIES.HEAL]: { type: 'heal', value: 10 },
  [ABILITIES.BERSERK]: { type: 'damage', value: 5 },
  [ABILITIES.SHIELD_WALL]: { type: 'defense', value: 5 },
  [ABILITIES.STUN]: { type: 'stun', value: 0 },
  [ABILITIES.FLY]: { type: 'defense', value: 5 },
  [ABILITIES.CAST_SPELL]: { type: 'damage', value: 10 },
  [ABILITIES.TELEPORT]: { type: 'defense', value: 5 },
  [ABILITIES.PRECISION_SHOT]: { type: 'damage', value: 10 },
  [ABILITIES.EVASION]: { type: 'defense', value: 5 },
  [ABILITIES.SOUL_REAP]: { type: 'damage', value: 10 },
  [ABILITIES.MANA_BOLT]: { type: 'damage', value: 10 },
  [ABILITIES.CURSE]: { type: 'damage', value: 5 },
  [ABILITIES.LIGHT_BEAM]: { type: 'damage', value: 10 },
  [ABILITIES.SUMMON_UNDEAD]: { type: 'heal', value: 10 },
  [ABILITIES.DARK_SPELL]: { type: 'damage', value: 10 },
  [ABILITIES.BACKSTAB]: { type: 'damage', value: 15 },
  [ABILITIES.SHADOW_STEP]: { type: 'defense', value: 5 },
  [ABILITIES.POISON_BITE]: { type: 'damage', value: 10 },
  [ABILITIES.RAISE_DEAD]: { type: 'heal', value: 15 },
  [ABILITIES.NECROTIC_BLAST]: { type: 'damage', value: 10 },
  [ABILITIES.DARK_BLAST]: { type: 'damage', value: 10 },
  [ABILITIES.SUMMON_MINION]: { type: 'heal', value: 10 },
  [ABILITIES.SPEAR_THRUST]: { type: 'damage', value: 10 },
  [ABILITIES.COMMAND]: { type: 'defense', value: 5 },
  [ABILITIES.RALLY]: { type: 'heal', value: 10 },
  [ABILITIES.RANGED_ATTACK]: { type: 'damage', value: 10 },
  [ABILITIES.CAMOUFLAGE]: { type: 'defense', value: 5 },
  [ABILITIES.BURN]: { type: 'damage', value: 10 },
  [ABILITIES.WATER_BLAST]: { type: 'damage', value: 10 },
  [ABILITIES.ROCK_THROW]: { type: 'damage', value: 10 },
  [ABILITIES.GUST_OF_WIND]: { type: 'damage', value: 10 },
};

const formatAbility = ability => ability.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Ability resolution helper
function resolveAbility(attacker, defender, ability, damage, logFn) {
  if (!ability) return damage;
  const effect = abilityEffects[ability];
  if (!effect) {
    logFn(`${attacker.name} uses ${formatAbility(ability)}!`);
    return damage;
  }

  switch (effect.type) {
    case 'damage':
      logFn(`${attacker.name} uses ${formatAbility(ability)} (+${effect.value} damage)!`);
      return damage + effect.value;
    case 'heal': {
      attacker.currentHealth = Math.min(attacker.maxHealth, attacker.currentHealth + effect.value);
      logFn(`${attacker.name} uses ${formatAbility(ability)} and restores ${effect.value} HP!`);
      return damage;
    }
    case 'defense':
      logFn(`${attacker.name} uses ${formatAbility(ability)} (-${effect.value} damage)!`);
      return Math.max(0, damage - effect.value);
    case 'stun':
      defender.isStunned = true;
      logFn(`${attacker.name} uses ${formatAbility(ability)}! ${defender.name} is stunned.`);
      return damage;
    default:
      return damage;
  }
}


// Victory Check
// TODO: Check if this is now redundant that cards on zero HP are removed.
const victoryCheck = (player1card, player2card) => {
  if (player1card.currentHealth <= 0) {
    return {haveWinner: true, winner: player2card}; // Player 2 wins
  } else if (player2card.currentHealth <= 0) {
    return {haveWinner: true, winner: player1card}; // Player 1 wins
  } else {
    return {haveWinner: false, winner: null}; // No winner yet
  }
}

// Combat preparation
const handleCombatRound = (player1card, player2card, player1Choice, player2Choice, logFn) => {
  logFn('Starting combat round');

  // Calculate who strikes first based on agility and intelligence, plus a little randomness
  const player1Initiative = player1card.stats.agility * 0.4 + player1card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21);
  const player2Initiative = player2card.stats.agility * 0.4 + player2card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21);

  logFn(`${player1card.name} initiative: ${player1Initiative}`);
  logFn(`${player2card.name} initiative: ${player2Initiative}`);

  let firstAttacker, secondAttacker;
  let firstChoice, secondChoice;

  if (player1Initiative > player2Initiative) {
    firstAttacker = player1card;
    firstChoice = player1Choice;
    secondAttacker = player2card;
    secondChoice = player2Choice;
  } else {
    firstAttacker = player2card;
    firstChoice = player2Choice;
    secondAttacker = player1card;
    secondChoice = player1Choice;
  }

  const firstAttackerPlayer = firstAttacker === player1card ? 'Player 1' : 'Player 2';
  logFn(`${firstAttacker.name} (${firstAttackerPlayer}) goes first`);
  logFn(' ');

  // First Attacker Round (higher initiative)
  let outcome1 = combatRound(firstAttacker, secondAttacker, firstChoice, logFn);

  logFn(' ');

  // Check for a winner after first attack
  const result1 = victoryCheck(player1card, player2card);
  if (result1.haveWinner) {
    return result1; // Return early if there's a winner
  }

  // Second Attacker Round (if no winner yet)
  let outcome2 = combatRound(secondAttacker, firstAttacker, secondChoice, logFn);
  logFn('');
  logFn('');

  // Check again for a winner after the second attack
  const result2 = victoryCheck(player1card, player2card);
  if (result2.haveWinner) {
    return result2; // Return the final winner if there's one after the second attack
  }

  // If no one won, return the current state of the fight
  return {
    haveWinner: false,
  };
};


// Combat calculation function
function combatRound(attacker, defender, combatChoice, logFn) {
  if (attacker.isStunned) {
    logFn(`${attacker.name} is stunned and cannot act!`);
    attacker.isStunned = false;
    return {
      player1Health: attacker.currentHealth,
      player2Health: defender.currentHealth,
      playerAttack: 0,
      opponentDamageTaken: 0,
    };
  }

  // Calculate damage based on the chosen combat stat plus randomness.
  const playerAttack = Math.max(0, getCombatStat(attacker, combatChoice) + Math.floor(Math.random() * 21));
  const defenseMod = defender.stats.defense / 2;
  let damage = Math.max(0, playerAttack - defenseMod);
  const ability =
    attacker.selectedAbility ||
    (attacker.abilities &&
      attacker.abilities[Math.floor(Math.random() * attacker.abilities.length)]);
  damage = resolveAbility(attacker, defender, ability, damage, logFn);

  logFn(`Attacker: ${attacker.name} (${combatChoice})`);
  logFn(`Attack value: ${playerAttack}`);
  if (defenseMod > 0) {
    logFn(`Defense modifier: -${defenseMod}`);
  }
  logFn(`Damage dealt: ${damage}`);

  defender.currentHealth -= damage;

  const player1Health = attacker.currentHealth;
  const player2Health = defender.currentHealth;
  logFn(`${attacker.name} HP: ${player1Health}`);
  logFn(`${defender.name} HP: ${player2Health}`);

  // TODO: Check if we even need this.
  return {
    player1Health,
    player2Health,
    playerAttack,
    opponentDamageTaken: damage,
  };
}


// Main Game function
function Game({ player1Deck, player2Deck }) {

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

  const addLog = (message) => {
    setLogMessages(prev => [...prev, message]);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // variables used in combat
  const [result, setResult] = useState(''); // combat result
  const [round, setRound] = useState(1); // Track the number of rounds

  // Setting the winner
  const [haveWinner, setHaveWinner] = useState(false);
  const [winner, setWinner] = useState(null);

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

    const outcome = handleCombatRound(
      player1SelectedCard,
      player2SelectedCard,
      player1Choice,
      player2Choice,
      addLog
    );

    if (outcome.haveWinner) {
      setHaveWinner(true);
      setWinner(outcome.winner);
      const winnerPlayer = outcome.winner === player1SelectedCard ? 'Player 1' : 'Player 2';
      setModalMessage(`${outcome.winner.name} (${winnerPlayer}) wins the round!`);
      setIsModalOpen(true);
      addLog(`${outcome.winner.name} (${winnerPlayer}) wins the round!`);
    }

    // Remove cards on zero HP
    if (player1SelectedCard.currentHealth <= 0) {
      setPlayer1Hand(prevHand =>
        prevHand.filter(card => card !== player1SelectedCard)
      );
      setPlayer1SelectedCard(null);
      setPlayer1Choice('');
      addLog(`${player1SelectedCard.name} (Player 1) has been killed.`);
    }
    if (player2SelectedCard.currentHealth <= 0) {
      setPlayer2Hand(prevHand =>
        prevHand.filter(card => card !== player2SelectedCard)
      );
      setPlayer2SelectedCard(null);
      setPlayer2Choice('');
      addLog(`${player2SelectedCard.name} (Player 2) has been killed.`);
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

  return (
    <>
    <h1>Fantasy Card Combat Game</h1>
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
                    className={`combat-button melee ${player1Choice === 'Melee' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Melee')}
                  >
                    Melee
                  </button>
                  <button
                    className={`combat-button ranged ${player1Choice === 'Ranged' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Ranged')}
                  >
                    Ranged
                  </button>
                  <button
                    className={`combat-button magic ${player1Choice === 'Magic' ? 'selected' : ''}`}
                    onClick={() => handlePlayer1ChoiceSelect('Magic')}
                  >
                    Magic
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
                    className={`combat-button melee ${player2Choice === 'Melee' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Melee')}
                  >
                    Melee
                  </button>
                  <button
                    className={`combat-button ranged ${player2Choice === 'Ranged' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Ranged')}
                  >
                    Ranged
                  </button>
                  <button
                    className={`combat-button magic ${player2Choice === 'Magic' ? 'selected' : ''}`}
                    onClick={() => handlePlayer2ChoiceSelect('Magic')}
                  >
                    Magic
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
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fight button */}
          <div>
            <button
              onClick={Fight}
              disabled={!isCombatReady}
            >
            Fight!
            </button>
          </div>

        </div>
      </div>

      <div className="combat-log">
        <h3>Combat Log</h3>
        {logMessages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <h2>{modalMessage}</h2>
    </Modal>
    <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)}>
      <h2>How to Play</h2>
      <div style={{textAlign: 'left', marginTop: '20px'}}>
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
    </Modal>
    <button className="help-button" onClick={() => setIsHelpModalOpen(true)}>?</button>
    </>
  );
}

export default Game;
export { getRandomUniqueCards, combatRound, resolveAbility, abilityEffects };
