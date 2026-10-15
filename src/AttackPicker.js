import React from 'react';
import { SwordIcon, BowIcon, StaffIcon } from './GameIcons';
import { getCombatStat } from './gameEngine';

export const ATTACKS = [
  { choice: 'Melee', stat: 'STR', Icon: SwordIcon, className: 'is-melee' },
  { choice: 'Ranged', stat: 'AGI', Icon: BowIcon, className: 'is-ranged' },
  { choice: 'Magic', stat: 'MAG', Icon: StaffIcon, className: 'is-magic' },
];

// Melee / Ranged / Magic selector. Shows the selected creature's stat for each
// style so the player can see which attack suits it. `readOnly` is used for
// the AI side in single player: it shows the AI's pick without being clickable.
function AttackPicker({ choice, onSelect, card, readOnly = false, label, tutorialId }) {
  return (
    <div
      className={`attack-picker${readOnly ? ' is-readonly' : ''}`}
      role="radiogroup"
      aria-label={label}
    >
      {ATTACKS.map(({ choice: c, stat, Icon, className }) => {
        const selected = choice === c;
        const value = card ? getCombatStat(card, c) : null;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={readOnly || undefined}
            tabIndex={readOnly ? -1 : undefined}
            className={`attack-option ${className}${selected ? ' selected' : ''}`}
            data-tutorial={tutorialId ? `${tutorialId}-${c}` : undefined}
            onClick={readOnly ? undefined : () => onSelect(c)}
          >
            <span className="attack-option-icon"><Icon size={22} /></span>
            <span className="attack-option-name">{c}</span>
            <span className="attack-option-stat" aria-label={value != null ? `${stat} ${value}` : undefined}>
              <span className="attack-option-stat-label">{stat}</span>
              <span className="attack-option-stat-value">{value != null ? value : '–'}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default AttackPicker;
