import React from 'react';
import { ELEMENTS } from './constants';
import { CrossedSwordsIcon, TrophyIcon, BrokenShieldIcon } from './GameIcons';

// Snapshot the bits of a creature the result screen shows, so later state
// changes (removal from the hand, healing) don't alter a result on screen.
export const snapshotCreature = (card) => card && {
  name: card.name,
  image: card.image,
  element: card.element,
  currentHealth: Math.max(0, card.currentHealth),
  maxHealth: card.maxHealth,
};

const sideName = (side) => (side === 'p1' ? 'Player 1' : 'Player 2');

function Portrait({ creature, fallen = false }) {
  const color = ELEMENTS[creature.element]?.color;
  const hp = Math.round((creature.currentHealth / creature.maxHealth) * 100);
  return (
    <figure className={`result-portrait${fallen ? ' is-fallen' : ''}`} style={color ? { '--el': color } : undefined}>
      <div className="result-portrait-frame">
        <img src={creature.image} alt="" />
      </div>
      <figcaption>
        <span className="result-portrait-name">{creature.name}</span>
        {fallen ? (
          <span className="result-portrait-hp is-fallen">Fallen</span>
        ) : (
          <span className="result-portrait-hp">
            <span className="result-hp-bar" aria-hidden="true"><span style={{ width: `${hp}%` }} /></span>
            {creature.currentHealth} / {creature.maxHealth} HP
          </span>
        )}
      </figcaption>
    </figure>
  );
}

// Content for the round and battle result dialog.
function BattleResult({ result, singlePlayer, onContinue, onNewGame, onHome }) {
  const isGame = result.kind === 'game';
  const playerWon = result.winnerSide === 'p1';
  // Single player reads from your side; two players get a neutral gold result
  const tone = singlePlayer ? (playerWon ? 'is-win' : 'is-loss') : 'is-neutral';

  let title;
  let line = null; // round results let the duel row say who beat whom
  if (isGame) {
    title = singlePlayer ? (playerWon ? 'Victory' : 'Defeat') : `${sideName(result.winnerSide)} wins`;
    line = singlePlayer
      ? (playerWon ? 'Every enemy creature has fallen.' : 'All of your creatures have fallen.')
      : `${sideName(result.winnerSide === 'p1' ? 'p2' : 'p1')} has no creatures left.`;
  } else {
    title = singlePlayer ? (playerWon ? 'Round won' : 'Round lost') : `${sideName(result.winnerSide)} takes the round`;
  }

  const Crest = isGame ? (singlePlayer && !playerWon ? BrokenShieldIcon : TrophyIcon) : CrossedSwordsIcon;

  return (
    <div className={`battle-result ${tone}${isGame ? ' is-game' : ''}`}>
      <div className="result-crest" aria-hidden="true"><Crest size={30} /></div>
      <p className="result-kicker">{isGame ? 'Battle over' : `Round ${result.round}`}</p>
      <h2 className="result-title">{title}</h2>
      <div className="result-rule" aria-hidden="true" />
      {line && <p className="result-line">{line}</p>}

      {isGame ? (
        result.survivors.length > 0 && (
          <div className="result-survivors">
            <p className="result-label">{singlePlayer && !playerWon ? 'Enemy survivors' : 'Survivors'}</p>
            <div className="result-portraits">
              {result.survivors.map((c) => <Portrait key={c.name} creature={c} />)}
            </div>
          </div>
        )
      ) : (
        <div className="result-portraits is-duel">
          <Portrait creature={result.winner} />
          <span className="result-versus" aria-hidden="true">defeats</span>
          <Portrait creature={result.loser} fallen />
        </div>
      )}

      <div className="result-actions">
        {isGame ? (
          <>
            {onHome && (
              <button type="button" className="btn btn-ghost" onClick={onHome}>Home</button>
            )}
            <button type="button" className="btn btn-primary modal-continue" onClick={onNewGame}>New Game</button>
          </>
        ) : (
          <button type="button" className="btn btn-primary modal-continue" onClick={onContinue}>Continue</button>
        )}
      </div>
    </div>
  );
}

export default BattleResult;
