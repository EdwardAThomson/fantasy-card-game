import React, { useState, useEffect, useCallback } from 'react';
import creatures from './creatures';
import Card, { CardBack } from './Card';
import Modal from './Modal';
import BattleResult, { snapshotCreature } from './BattleResult';
import CombatLog from './CombatLog';
import Tabs from './Tabs';
import ElementChart from './ElementChart';
import MatchupHint from './MatchupHint';
import AttackPicker from './AttackPicker';
import { HomeIcon, HelpIcon, ScrollIcon, CrossedSwordsIcon } from './GameIcons';
import './GameScreen.css';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { DECK_SIZE } from './constants';
import { setRandomSource, seededRandom } from './rng';
import {
  abilityEffects,
  getRandomUniqueCards,
  getElementMultiplier,
  handleCombatRound,
  processDoTDamage,
  makeAIDecision,
} from './gameEngine';


// Main Game function
function Game({ player1Deck, player2Deck, singlePlayer = false, tutorial = null, onTutorialFinish, onHome }) {

  // Tutorial mode plays a fixed, seeded match (see tutorial/tutorialScript.js)
  const [tutorialDecks] = useState(() => (tutorial ? tutorial.buildDecks() : null));
  const [tutorialEvents, setTutorialEvents] = useState([]);
  const emitTutorial = (type, payload) => {
    if (tutorial) setTutorialEvents(prev => [...prev, { type, payload }]);
  };

  useEffect(() => {
    if (!tutorial) return undefined;
    setRandomSource(seededRandom(tutorial.seed));
    return () => setRandomSource(null);
  }, [tutorial]);

  // Initialize player hands using useState
  const [player1Hand, setPlayer1Hand] = useState(() => {
    if (tutorialDecks) return tutorialDecks.player;
    if (player1Deck && player1Deck.length === DECK_SIZE) {
      return player1Deck.map(card => JSON.parse(JSON.stringify(card)));
    }
    return getRandomUniqueCards(creatures, DECK_SIZE);
  });
  const [player2Hand, setPlayer2Hand] = useState(() => {
    if (tutorialDecks) return tutorialDecks.opponent;
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

  const addLog = (message, type = 'info', style = null) => {
    setLogMessages(prev => [...prev, { text: message, type, style }]);
  };

  // Modal state
  const [result, setResult] = useState(null); // round or battle result shown in a dialog
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(false);
  const [dyingCards, setDyingCards] = useState([]);

  // variables used in combat
  const [round, setRound] = useState(1); // Track the number of rounds

  // Against the AI its hand stays face down; each card turns face up the first
  // time it fights. The tutorial keeps everything visible so it can teach
  // counter-picking, and hot-seat players share one screen anyway.
  const hideOpponent = singlePlayer && !tutorial;
  const [revealedP2, setRevealedP2] = useState([]);
  const [revealingP2, setRevealingP2] = useState(null); // card mid-flip before a fight
  const isHiddenP2 = card => hideOpponent && !!card && !revealedP2.includes(card.name);

  // AI decision logic
  const runAIDecision = useCallback(() => {
    if (!singlePlayer || tutorial) return;
    if (!player1SelectedCard || !player1Choice) return;
    if (player2Hand.length === 0) return;

    const best = makeAIDecision(player2Hand);
    if (best) {
      setPlayer2SelectedCard(best.card);
      setPlayer2Choice(best.choice);
    }
  }, [singlePlayer, tutorial, player1SelectedCard, player1Choice, player2Hand]);

  useEffect(() => {
    runAIDecision();
  }, [runAIDecision]);

  // Tutorial opponent commits first, following its script, so the player can counter-pick
  useEffect(() => {
    if (!tutorial || player2SelectedCard) return;
    const next = player2Hand.find(card => card.currentHealth > 0);
    if (!next) return;
    setPlayer2SelectedCard(next);
    setPlayer2Choice(tutorial.opponentPlan[next.name] || makeAIDecision([next]).choice);
  }, [tutorial, player2Hand, player2SelectedCard]);

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
    if (revealingP2) return;
    setPlayer1SelectedCard(card); // Set the card as selected
    emitTutorial('cardSelected', { side: 'p1', name: card.name });
  };

  // Handle combat choice for Player 1
  const handlePlayer1ChoiceSelect = (choice) => {
    if (revealingP2) return;
    setPlayer1Choice(choice);     // Set the chosen action
    emitTutorial('styleSelected', { side: 'p1', choice });
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
      addLog('Player 2 is the winner!', 'victory');
      if (tutorial) return emitTutorial('gameOver', { winner: 'p2' });
      setResult({ kind: 'game', winnerSide: 'p2', survivors: player2Hand.filter(c => c.currentHealth > 0).map(snapshotCreature) });
    } else if (player2Hand.length === 0) {
      addLog('Player 1 is the winner!', 'victory');
      if (tutorial) return emitTutorial('gameOver', { winner: 'p1' });
      setResult({ kind: 'game', winnerSide: 'p1', survivors: player1Hand.filter(c => c.currentHealth > 0).map(snapshotCreature) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1Hand, player2Hand]);  // This will trigger when player1Hand or player2Hand changes

  // Fight logic
  // - Call combat functions
  // - Victory conditions (for a combat round) check
  const Fight = () => {
    setRevealingP2(null);
    addLog(`Round ${round}`, 'round-header');

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
      addLog(`${sideLabel} ${card.name} defenses → Immunities: ${immunities}; Resistances: ${resistances}`, 'info');
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
      addLog(`${player1SelectedCard.name} is recovering from stun...`, 'status');
    }
    if (wasPlayer2Stunned) {
      addLog(`${player2SelectedCard.name} is recovering from stun...`, 'status');
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
      // The tutorial explains defeats with its own tips instead
      if (!tutorial) {
        const p1Won = outcome.winner === player1SelectedCard;
        setResult({
          kind: 'round',
          round,
          winnerSide: p1Won ? 'p1' : 'p2',
          winner: snapshotCreature(outcome.winner),
          loser: snapshotCreature(p1Won ? player2SelectedCard : player1SelectedCard),
        });
      }
      addLog(`${outcome.winner.name} (${winnerPlayer}) wins the round!`, 'victory');
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
    
    // Set ability used for its special effect. Attacks and stuns play on the
    // target; heals and defensive abilities play on the creature using them.
    if (outcome.abilityUsed) {
      const { ability, side } = outcome.abilityUsed;
      const hitsTarget = ['damage', 'stun'].includes(abilityEffects[ability]?.type);
      if (hitsTarget) {
        const targetSide = side === 'p1' ? 'p2' : 'p1';
        const target = side === 'p1' ? player2SelectedCard : player1SelectedCard;
        setAbilityUsed({ ability, cardName: target.name, side: targetSide });
      } else {
        setAbilityUsed(outcome.abilityUsed);
      }
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
      addLog(`${player1SelectedCard.name} (Player 1) has been killed.`, 'death');
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
      addLog(`${player2SelectedCard.name} (Player 2) has been killed.`, 'death');
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

    emitTutorial('roundResolved', {
      round,
      p1Multiplier: getElementMultiplier(player1SelectedCard, player2SelectedCard),
      p2Multiplier: getElementMultiplier(player2SelectedCard, player1SelectedCard),
      abilityUsed: outcome.abilityUsed,
      newStatuses: [...(player1SelectedCard.statusEffects || []), ...(player2SelectedCard.statusEffects || [])],
      stunned: !!(player1SelectedCard.isStunned || player2SelectedCard.isStunned),
      deaths: deadCards,
    });

    setRound(prev => prev + 1);
  } // ends Fight function

  // Turn the AI's card face up first so the player sees what they're facing
  const REVEAL_MS = 550;
  const handleFight = () => {
    if (revealingP2) return;
    if (!isHiddenP2(player2SelectedCard)) return Fight();
    const { name } = player2SelectedCard;
    setRevealedP2(prev => [...prev, name]);
    setRevealingP2(name);
    setTimeout(Fight, REVEAL_MS);
  };


  // Combat button should only be enabled if both players have selected a stat
  const isCombatReady =
    player1SelectedCard &&
    player2SelectedCard &&
    player1Choice &&
    player2Choice &&
    player1SelectedCard.currentHealth > 0 &&
    player2SelectedCard.currentHealth > 0 &&
    !revealingP2;

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

  // Short prompt under each player's name saying what they still need to do
  const getPlayerStatus = (card, choice, isAI) => {
    if (isGameOver) return '';
    if (card && choice) return 'Ready';
    if (isAI) return 'Waiting for your move';
    if (!card) return 'Choose a creature';
    return 'Choose an attack';
  };

  const renderPlayerArea = (side) => {
    const isP1 = side === 'p1';
    const isAI = !isP1 && singlePlayer;
    const hand = isP1 ? player1Hand : player2Hand;
    const selectedCard = isP1 ? player1SelectedCard : player2SelectedCard;
    const choice = isP1 ? player1Choice : player2Choice;
    const onCardSelect = isP1 ? handlePlayer1CardSelect : handlePlayer2CardSelect;
    const onChoiceSelect = isP1 ? handlePlayer1ChoiceSelect : handlePlayer2ChoiceSelect;
    const name = isP1 ? 'Player 1' : 'Player 2';
    const status = getPlayerStatus(selectedCard, choice, isAI);
    const pickHidden = !isP1 && isHiddenP2(selectedCard);

    return (
      <section className={`player-area${isAI ? ' is-ai' : ''}`} aria-label={name} data-tutorial={`${side}-area`}>
        <div className="player-info">
          <div className="player-nameplate">
            <h2>{name}</h2>
            {singlePlayer && <span className="player-tag">{isAI ? 'AI' : 'You'}</span>}
          </div>
          {status && (
            <p className={`player-status${status === 'Ready' ? ' is-ready' : ''}`}>{status}</p>
          )}
          <AttackPicker
            choice={pickHidden ? '' : choice}
            onSelect={onChoiceSelect}
            card={pickHidden ? null : selectedCard}
            readOnly={isAI}
            label={`${name} attack style`}
            tutorialId={`${side}-style`}
          />
        </div>
        <div className="player-hand" data-tutorial={`${side}-hand`}>
          {hand.map((card, index) => (!isP1 && isHiddenP2(card)) ? (
            <CardBack key={`back-${card.name}`} isSelected={selectedCard === card} side={side} />
          ) : (
            <Card
              key={hideOpponent && !isP1 ? card.name : index}
              creature={card}
              onCardSelect={() => onCardSelect(card)}
              isSelected={selectedCard === card}
              isDying={dyingCards.includes(card.name)}
              disabled={isAI}
              side={side}
              damageEvents={isP1 ? player1DamageEvents : player2DamageEvents}
              abilityUsed={abilityUsed}
              isRevealing={!isP1 && revealingP2 === card.name}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <>

    <header className="game-hud">
      <div className="game-hud-side">
        {onHome && (
          <button type="button" className="hud-btn" onClick={onHome} aria-label="Home" data-tutorial="home">
            <HomeIcon />
            <span className="hud-btn-label">Home</span>
          </button>
        )}
      </div>
      <div className="game-hud-round" aria-live="polite">
        {isGameOver ? 'Battle over' : `Round ${round}`}
      </div>
      <div className="game-hud-side is-end">
        <button
          type="button"
          className="hud-btn hud-btn-log"
          onClick={() => setIsCombatLogOpen(!isCombatLogOpen)}
          aria-label="Combat log"
          aria-expanded={isCombatLogOpen}
          data-tutorial="combat-log-toggle"
        >
          <ScrollIcon />
          <span className="hud-btn-label">Log</span>
        </button>
        <button type="button" className="hud-btn" onClick={() => setIsHelpModalOpen(true)} aria-label="How to play">
          <HelpIcon />
          <span className="hud-btn-label">Help</span>
        </button>
      </div>
    </header>

    <div className="app-wrapper">
      <div className="game-container">
        <div className="game-main">

          <div className="players-container">
            {renderPlayerArea('p1')}

            <MatchupHint
              p1Card={player1SelectedCard}
              p2Card={isHiddenP2(player2SelectedCard) ? null : player2SelectedCard}
              p1Hand={player1Hand}
              p2Hand={player2Hand.filter(card => !isHiddenP2(card))}
            />

            <div className="battle-strip">
              {isGameOver ? (!tutorial && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={resetGame}
                  aria-label="Start a new game"
                >
                  New Game
                </button>
              )) : (
                <>
                  <button
                    className={`btn btn-primary btn-lg btn-fight ${fightTint ? 'tinted' : ''} ${isCombatReady ? `btn-glow ${glowClass}` : ''}`}
                    style={fightTint ? { '--choice': fightTint } : undefined}
                    onClick={handleFight}
                    disabled={!isCombatReady}
                    data-tutorial="fight"
                    aria-label="Start combat"
                  >
                    <CrossedSwordsIcon size={22} />
                    Fight!
                  </button>
                  <button
                    className="btn btn-ghost btn-reset"
                    type="button"
                    onClick={resetSelections}
                    aria-label="Reset selections"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>

            {renderPlayerArea('p2')}
          </div>

        </div>
      </div>

      <CombatLog
        messages={logMessages}
        isOpen={isCombatLogOpen}
        onClose={() => setIsCombatLogOpen(false)}
      />
    </div>

    <Modal isOpen={!!result} onClose={() => setResult(null)} size="sm" label={result?.kind === 'game' ? 'Battle result' : 'Round result'}>
      {result && (
        <BattleResult
          result={result}
          singlePlayer={singlePlayer}
          onContinue={() => setResult(null)}
          onNewGame={resetGame}
          onHome={onHome}
        />
      )}
    </Modal>
    <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} label="How to play">
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
        <div label="Elements">
          <ElementChart />
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
          <p>Many creatures have immunities that make them completely immune to certain status effects (e.g., a Fire creature immune to Burning). Some creatures also have resistances that reduce the effectiveness of specific effects.</p>
        </div>
        <div label="Status Effects">
          <h4>Damage Over Time (DoT):</h4>
          <p>DoT effects deal damage at the start of each round, before combat. Multiple DoTs can stack.</p>
          <ul>
              <li><strong>🔥 Burning:</strong> 5 damage/round for 2 rounds (Fire Breath, Burn).</li>
              <li><strong>☠️ Poisoned:</strong> 4 damage/round for 3 rounds (Poison Bite, Nature's Wrath, Entangle).</li>
              <li><strong>🩸 Bleeding:</strong> 3 damage/round for 3 rounds (Backstab).</li>
              <li><strong>❄️ Frozen:</strong> Stuns for 1 round + 2 damage/round for 2 rounds (Water Blast, Tidal Wave).</li>
              <li><strong>🦑 Constricted:</strong> 3 damage/round for 2 rounds (Crushing Grip).</li>
          </ul>
          <h4>Buffs &amp; Debuffs:</h4>
          <ul>
              <li><strong>✨ Blessed:</strong> Reduces incoming damage by 10% (Heal, Shield Wall, Fortify, Regenerate, Rally, Command).</li>
              <li><strong>🌙 Cursed:</strong> Amplifies incoming damage by 10% (Curse, Soul Reap, Dark Spell, Necrotic Blast).</li>
              <li><strong>⭐ Stunned:</strong> Creature skips its next turn completely.</li>
          </ul>
        </div>
        <div label="Visual Guide">
          <h4>Visual Feedback:</h4>
          <ul>
              <li><strong>Flying Numbers:</strong> Damage (red) and healing (green) amounts fly up from cards.</li>
              <li><strong>Ability Effects:</strong> When an ability triggers, a themed effect plays with the ability's name: flames, frost shards, lightning, leaves, rocks, wind, healing motes, a shield dome, stun stars, dark wisps, arcane runes, holy light, blade slashes or arrow impacts. Attacks play on the target; heals and defensive abilities play on the user.</li>
              <li><strong>Element Matchups:</strong> The panel by the Fight button shows whether your creature deals bonus (115%) or reduced (85%) damage to its opponent.</li>
              <li><strong>Status Badges:</strong> Colored badges show active status effects on cards.</li>
              <li><strong>Card Glow:</strong> Green when Blessed, red when Cursed.</li>
              <li><strong>Shake Animation:</strong> Cards shake when taking damage.</li>
              <li><strong>Combat Log:</strong> Detailed text log of all combat actions, scrollable history.</li>
          </ul>
        </div>
      </Tabs>
    </Modal>
    {tutorial && (
      <TutorialOverlay script={tutorial} events={tutorialEvents} onFinish={onTutorialFinish} />
    )}
    </>
  );
}

export default Game;
