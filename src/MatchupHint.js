import React from 'react';
import { ELEMENTS } from './constants';
import { getElementMultiplier } from './gameEngine';
import './Elements.css';

const describe = mult => {
  if (mult > 1) return { cls: 'up', text: `Strong · ${Math.round(mult * 100)}%` };
  if (mult < 1) return { cls: 'down', text: `Weak · ${Math.round(mult * 100)}%` };
  return { cls: 'even', text: 'Neutral' };
};

function Matchup({ attacker, defender, label }) {
  const { cls, text } = describe(getElementMultiplier(attacker, defender));
  const icon = c => ELEMENTS[c.element]?.icon;
  return (
    <li className={`matchup-row matchup-${cls}`}>
      {label && <span className="matchup-label">{label}</span>}
      <span className="matchup-names">
        <span aria-hidden="true">{icon(attacker)}</span> {attacker.name}
        <span className="matchup-arrow" aria-label="attacking"> → </span>
        <span aria-hidden="true">{icon(defender)}</span> {defender.name}
      </span>
      <span className="matchup-tag">{text}</span>
    </li>
  );
}

// Shows element advantage before a fight. With both creatures chosen it shows
// each direction; with one chosen it previews that creature against the
// opposing hand so the player can pick a good target or attacker.
function MatchupHint({ p1Card, p2Card, p1Hand, p2Hand }) {
  const live = card => card && card.currentHealth > 0;
  let rows = [];
  let title = 'Element matchup';

  if (live(p1Card) && live(p2Card)) {
    rows = [
      <Matchup key="p1" attacker={p1Card} defender={p2Card} label="P1" />,
      <Matchup key="p2" attacker={p2Card} defender={p1Card} label="P2" />,
    ];
  } else if (live(p1Card) || live(p2Card)) {
    const [mine, theirs] = live(p1Card) ? [p1Card, p2Hand] : [p2Card, p1Hand];
    title = `${mine.name} vs opponents`;
    rows = theirs
      .filter(live)
      .map(card => <Matchup key={card.name} attacker={mine} defender={card} />);
  }

  if (rows.length === 0) return null;

  return (
    <div className="matchup-hint" aria-live="polite">
      <div className="matchup-title">{title}</div>
      <ul>{rows}</ul>
    </div>
  );
}

export default MatchupHint;
