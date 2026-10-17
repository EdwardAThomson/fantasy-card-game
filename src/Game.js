import React, { useEffect, useMemo, useState } from 'react';
import creatures from './creatures';
import Card from './Card';
import Modal from './Modal';
import BattleResult from './BattleResult';
import CombatLog from './CombatLog';
import Tabs from './Tabs';
import ElementChart from './ElementChart';
import MatchupHint from './MatchupHint';
import AttackPicker from './AttackPicker';
import { HomeIcon, HelpIcon, ScrollIcon, CrossedSwordsIcon } from './GameIcons';
import './GameScreen.css';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { DECK_SIZE } from './constants';
import { getRandomUniqueCards, makeAIDecision } from './gameEngine';
import useLocalMatch from './hooks/useLocalMatch';


// The game screen. Rounds are resolved by the shared match engine (via
// useLocalMatch); this component only draws the match and animates events.
function Game({ player1Deck, player2Deck, singlePlayer = false, tutorial = null, onTutorialFinish, onHome }) {

  // Tutorial mode plays a fixed, seeded match (see tutorial/tutorialScript.js)
  const decks = useMemo(() => {
    if (tutorial) {
      const { player, opponent } = tutorial.buildDecks();
      return { p1Deck: player, p2Deck: opponent, seed: tutorial.seed };
    }
    const fromProp = deck => (deck && deck.length === DECK_SIZE ? deck : getRandomUniqueCards(creatures, DECK_SIZE));
    return { p1Deck: fromProp(player1Deck), p2Deck: fromProp(player2Deck) };
    // Decks are fixed for the life of the screen; App remounts for a new game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const match = useLocalMatch(decks);
  const { hands, selection, state } = match;
  const player1Hand = hands.p1;
  const player2Hand = hands.p2;
  const player1SelectedCard = player1Hand.find(c => c.uid === selection.p1.uid) || null;
  const player2SelectedCard = player2Hand.find(c => c.uid === selection.p2.uid) || null;
  const player1Choice = selection.p1.style;
  const player2Choice = selection.p2.style;
  const round = match.round;
  const isGameOver = match.isOver;

  // Tutorial overlay events
  const [tutorialEvents, setTutorialEvents] = useState([]);
  const emitTutorial = (type, payload) => {
    if (tutorial) setTutorialEvents(prev => [...prev, { type, payload }]);
  };
  useEffect(() => {
    if (!tutorial || !match.lastRound) return;
    const { resolved, gameOver } = match.lastRound;
    if (resolved) {
      const { type, ...payload } = resolved;
      emitTutorial('roundResolved', payload);
    }
    if (gameOver) emitTutorial('gameOver', { winner: gameOver.winnerSide });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.lastRound]);

  // Modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(false);
  // The tutorial explains results with its own tips instead of the dialog
  const result = tutorial ? null : match.result;

  const liveHand = side => state.sides[side].hand;

  // AI picks once the player has committed to a card and a style
  useEffect(() => {
    if (!singlePlayer || tutorial || isGameOver) return;
    if (!selection.p1.uid || !selection.p1.style) return;
    const best = makeAIDecision(liveHand('p2'));
    if (best) {
      match.select('p2', best.card.uid);
      match.choose('p2', best.choice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singlePlayer, tutorial, isGameOver, selection.p1.uid, selection.p1.style, state]);

  // Tutorial opponent commits first, following its script, so the player can counter-pick
  useEffect(() => {
    if (!tutorial || selection.p2.uid || isGameOver) return;
    const next = liveHand('p2')[0];
    if (!next) return;
    match.select('p2', next.uid);
    match.choose('p2', tutorial.opponentPlan[next.name] || makeAIDecision([next]).choice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial, selection.p2.uid, isGameOver, state]);

  // Auto-select the last creature standing on each side
  useEffect(() => {
    const p1 = liveHand('p1');
    if (p1.length === 1 && !selection.p1.uid) match.select('p1', p1[0].uid);
    const p2 = liveHand('p2');
    if (!singlePlayer && p2.length === 1 && !selection.p2.uid) match.select('p2', p2[0].uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, selection.p1.uid, selection.p2.uid, singlePlayer]);

  const handlePlayer1CardSelect = (card) => {
    match.select('p1', card.uid);
    emitTutorial('cardSelected', { side: 'p1', name: card.name });
  };
  const handlePlayer1ChoiceSelect = (choice) => {
    match.choose('p1', choice);
    emitTutorial('styleSelected', { side: 'p1', choice });
  };
  const handlePlayer2CardSelect = (card) => match.select('p2', card.uid);
  const handlePlayer2ChoiceSelect = (choice) => match.choose('p2', choice);

  const Fight = match.fight;
  const isCombatReady = match.canFight;

  // Determine tint color for Fight CTA based on chosen style
  const styleColorMap = { Melee: '#22c55e', Ranged: '#3b82f6', Magic: '#ef4444' };
  const fightTint = styleColorMap[player1Choice] || styleColorMap[player2Choice] || undefined;
  const glowClass = singlePlayer ? 'glow-ai' : 'glow-player';

  // Full reset: refresh the app (simple, reliable)
  const resetGame = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const resetSelections = match.clearSelections;

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
            choice={choice}
            onSelect={onChoiceSelect}
            card={selectedCard}
            readOnly={isAI}
            label={`${name} attack style`}
            tutorialId={`${side}-style`}
          />
        </div>
        <div className="player-hand" data-tutorial={`${side}-hand`}>
          {hand.map((card) => (
            <Card
              key={card.uid}
              creature={card}
              onCardSelect={() => onCardSelect(card)}
              isSelected={selectedCard?.uid === card.uid}
              isDying={match.dying.includes(card.name)}
              disabled={isAI}
              side={side}
              damageEvents={match.damageEvents[side]}
              abilityUsed={match.abilityUsed}
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
              p2Card={player2SelectedCard}
              p1Hand={player1Hand}
              p2Hand={player2Hand}
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
                    onClick={Fight}
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
        messages={match.log}
        isOpen={isCombatLogOpen}
        onClose={() => setIsCombatLogOpen(false)}
      />
    </div>

    <Modal isOpen={!!result} onClose={match.dismissResult} size="sm" label={result?.kind === 'game' ? 'Battle result' : 'Round result'}>
      {result && (
        <BattleResult
          result={result}
          singlePlayer={singlePlayer}
          onContinue={match.dismissResult}
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
