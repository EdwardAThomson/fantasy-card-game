import React from 'react';

function Card({ creature, onCardSelect, isSelected, disabled, side }) {
  const healthPercent = (creature.currentHealth / creature.maxHealth) * 100;
  const barColor = `hsl(${healthPercent * 1.2}, 70%, 50%)`;

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${side === 'p1' ? 'card-p1' : side === 'p2' ? 'card-p2' : ''}`}
      onClick={disabled ? undefined : onCardSelect}
    >
      <div className="health-bar">
        <div
          className="health-bar-fill"
          style={{ width: `${healthPercent}%`, backgroundColor: barColor }}
        ></div>
        <span className="health-bar-text">
          {creature.currentHealth} / {creature.maxHealth}
        </span>
      </div>
      <h2>{creature.name}</h2>
      <img src={creature.image} alt={creature.name} className="creature-image" />

      <ul>
        {Object.keys(creature.stats).map(stat => (
          <li key={stat}>
            {stat}: {creature.stats[stat]}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Card;
