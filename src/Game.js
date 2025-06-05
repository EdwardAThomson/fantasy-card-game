import React, { useState, useEffect } from 'react';
import creatures from './creatures';  // Import the creatures data
import Card from './Card';  // Import the Card component


// Deck Creation
// - draw 3 unique cards
const getThreeUniqueCards = (creatures) => {
  const selectedIndices = new Set();  // Use a set to store unique indices
  const selectedCards = [];

  // Continue generating indices until we have 3 unique ones
  while (selectedIndices.size < 3) {
    const randomIndex = Math.floor(Math.random() * creatures.length);
    console.log('randomIndex', randomIndex);

    // If this index has not been selected yet, add it to the set and push the creature
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);

      // Create a deep copy of the selected creature
      const creatureCopy = JSON.parse(JSON.stringify(creatures[randomIndex]));
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
const handleCombatRound = (player1card, player2card, player1Choice, player2Choice) => {
  console.log('Starting combat round');

  // Calculate who strikes first based on agility and intelligence, plus a little randomness
  const player1Initiative = player1card.stats.agility * 0.4 + player1card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21);
  const player2Initiative = player2card.stats.agility * 0.4 + player2card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21);

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

  // First Attacker Round (higher initiative)
  let outcome1 = combatRound(firstAttacker, secondAttacker, firstChoice);

  // Check for a winner after first attack
  const result1 = victoryCheck(player1card, player2card);
  if (result1.haveWinner) {
    return result1; // Return early if there's a winner
  }

  // Second Attacker Round (if no winner yet)
  let outcome2 = combatRound(secondAttacker, firstAttacker, secondChoice);

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
function combatRound(attacker, defender, combatChoice) {

  // Calculate damage based on the chosen combat stat plus randomness.
  const playerAttack = Math.max(0, getCombatStat(attacker, combatChoice)  + Math.floor(Math.random() * 21) );
  const opponentDamageTaken = Math.max(0, playerAttack - (defender.stats.defense / 2));

  console.log('Attacker Card: ', attacker.name, '- Defender Card:', defender.name);
  console.log('Player Attack value:', playerAttack);
  console.log('Opponent Damage Taken: ', opponentDamageTaken);

  defender.currentHealth -= opponentDamageTaken;

  const player1Health = attacker.currentHealth;
  const player2Health = defender.currentHealth;
  console.log('Attacker Health: ', attacker.name,  player1Health);
  console.log('Defender Health: ', defender.name , player2Health);

  // TODO: Check if we even need this.
  return {
    player1Health,
    player2Health,
    playerAttack,
    opponentDamageTaken,
  };
}


// Main Game function
function Game() {

  // Initialize player hands using useState
  const [player1Hand, setPlayer1Hand] = useState(() => getThreeUniqueCards(creatures));
  const [player2Hand, setPlayer2Hand] = useState(() => getThreeUniqueCards(creatures));

  // Selected card in each hand
  const [player1SelectedCard, setPlayer1SelectedCard] = useState(null);
  const [player2SelectedCard, setPlayer2SelectedCard] = useState(null);

  // Store the combat choice for both players
  const [player1Choice, setPlayer1Choice] = useState('');
  const [player2Choice, setPlayer2Choice] = useState('');

  // variables used in combat
  const [result, setResult] = useState(''); // combat result
  const [round, setRound] = useState(1); // Track the number of rounds

  // Setting the winner
  const [haveWinner, setHaveWinner] = useState(false);
  const [winner, setWinner] = useState(null);

 // Handle combat choice and implicit card selection for Player 1
  const handlePlayer1Choice = (card, choice) => {
    setPlayer1SelectedCard(card); // Set the card as selected
    setPlayer1Choice(choice);     // Set the chosen action
  };

  // Handle combat choice and implicit card selection for Player 2
  const handlePlayer2Choice = (card, choice) => {
    setPlayer2SelectedCard(card); // Set the card as selected
    setPlayer2Choice(choice);     // Set the chosen action
  };


  // Check for victory (overall) when hands change
  useEffect(() => {
    if (player1Hand.length === 0) {
      setResult('Player 2 is the winner!');
    } else if (player2Hand.length === 0) {
      setResult('Player 1 is the winner!');
    }
  }, [player1Hand, player2Hand]);  // This will trigger when player1Hand or player2Hand changes

  // Fight logic
  // - Call combat functions
  // - Victory conditions (for a combat round) check
  const Fight = () => {
    console.log('round: ', round);

    const outcome = handleCombatRound(player1SelectedCard, player2SelectedCard, player1Choice, player2Choice);

    // Remove cards on zero HP
    if (player1SelectedCard.currentHealth <= 0) {
      setPlayer1Hand(prevHand => prevHand.filter(card => card !== player1SelectedCard));
      console.log(player1SelectedCard.name , '(Player 1) has been killed.');
    }
    if (player2SelectedCard.currentHealth <= 0) {
      setPlayer2Hand(prevHand => prevHand.filter(card => card !== player2SelectedCard));
      console.log(player2SelectedCard.name , '(Player 2) has been killed.');
    }

    // Increment round count
    setRound(prev => prev + 1);
  } // ends Fight function


  // Combat button should only be enabled if both players have selected a stat
  const isCombatReady = player1Choice && player2Choice && player1SelectedCard.currentHealth > 0 && player2SelectedCard.currentHealth > 0;

  return (
    <div>
      <h2>Combat Screen</h2>

      <div className="player-hand">
        <h2>Player 1's Hand</h2>
        {player1Hand.map((card, index) => (
          <Card
            key={index}
            creature={card}
            onChoiceSelect={(choice) => handlePlayer1Choice(card, choice)}
            selectedChoice={player1SelectedCard === card ? player1Choice : ''}
          />
        ))}
      </div>

      <div className="player-hand">
        <h2>Player 2's Hand</h2>
        {player2Hand.map((card, index) => (
          <Card
            key={index}
            creature={card}
            onChoiceSelect={(choice) => handlePlayer2Choice(card, choice)}
            selectedChoice={player2SelectedCard === card ? player2Choice : ''}
          />

        ))}
      </div>

      {/* Display selected choices */}
      <div>
         <h3>
          Player 1 selected:
          {player1SelectedCard ? ` ${player1SelectedCard.name} - ${player1Choice}` : ' No card selected'}
        </h3>
        <h3>
          Player 2 selected:
          {player2SelectedCard ? ` ${player2SelectedCard.name} - ${player2Choice}` : ' No card selected'}
        </h3>
      </div>

      {/* Fight button */}
      <div>
        <button
          onClick={Fight}
          disabled={!isCombatReady}
        >
        Fight!
        </button>
        <h2>{result}</h2>
      </div>

    </div>
  );
}

export default Game;