import React, { useState } from 'react';

function Card({ creature, onChoiceSelect, selectedChoice, isSelected }) {

  return (
    <div className={`card ${isSelected ? 'selected' : ''}`}>
      <h2>{creature.name}</h2>
      <img src={creature.image} alt={creature.name} className="creature-image" />

      {/* Render the combat buttons */}
      <div className="combat-buttons">
        <button
          className={`combat-button melee ${selectedChoice === 'Melee' ? 'selected' : ''}`}
          onClick={() => onChoiceSelect('Melee')}
        >
          Melee
        </button>
        <button
          className={`combat-button ranged ${selectedChoice === 'Ranged' ? 'selected' : ''}`}
          onClick={() => onChoiceSelect('Ranged')}
        >
          Ranged
        </button>
        <button
          className={`combat-button magic ${selectedChoice === 'Magic' ? 'selected' : ''}`}
          onClick={() => onChoiceSelect('Magic')}
        >
          Magic
        </button>
      </div>

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
