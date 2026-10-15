import React from 'react';
import { ELEMENTS, ADVANTAGE_MULTIPLIER, DISADVANTAGE_MULTIPLIER } from './constants';
import { getElementMatchups } from './gameEngine';
import './Elements.css';

export const elementLabel = element =>
  element ? element.charAt(0).toUpperCase() + element.slice(1) : '';

export function ElementChip({ element }) {
  const el = ELEMENTS[element];
  if (!el) return null;
  return (
    <span className="element-chip" style={{ '--element-color': el.color }}>
      <span aria-hidden="true">{el.icon}</span> {elementLabel(element)}
    </span>
  );
}

function ElementChart() {
  const strongPct = Math.round(ADVANTAGE_MULTIPLIER * 100);
  const weakPct = Math.round(DISADVANTAGE_MULTIPLIER * 100);

  return (
    <div className="element-chart">
      <p>
        Every creature belongs to one of eight elements. When you attack an element you are
        strong against, you deal <strong className="mult-up">{strongPct}% damage</strong>. When you
        attack an element that is strong against yours, you deal <strong className="mult-down">{weakPct}% damage</strong>.
        All other pairings, including same-element fights, are neutral.
      </p>
      <table className="element-table">
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Strong vs <span className="mult-up">({strongPct}%)</span></th>
            <th scope="col">Weak vs <span className="mult-down">({weakPct}%)</span></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(ELEMENTS).map(element => {
            const { strong, weak } = getElementMatchups(element);
            return (
              <tr key={element}>
                <th scope="row"><ElementChip element={element} /></th>
                <td>{strong.map(e => <ElementChip key={e} element={e} />)}</td>
                <td>
                  {weak.length > 0
                    ? weak.map(e => <ElementChip key={e} element={e} />)
                    : <span className="element-none">None</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="element-tip">
        Tip: hover or tap the element icon on a card to see its matchups. Once you pick a
        creature, the panel by the Fight button shows how it fares against the enemy.
      </p>
    </div>
  );
}

export default ElementChart;
