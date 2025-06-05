import React from 'react';

function Card({ creature, onCardSelect, isSelected }) {

  return (
    <div className={`card ${isSelected ? 'selected' : ''}`} onClick={onCardSelect}>
      <h2>{creature.name}</h2>
      <img src={creature.image} alt={creature.name} className="creature-image" />

      <ul>
        {Object.keys(creature.stats).map(stat => (
          <li key={stat}>
                {stat}: {creature.stats[stat]}
          </li>
        ))}
          <li>
              HP: {creature.maxHealth}
          </li>
      </ul>

    </div>
  );
}

export default Card;
