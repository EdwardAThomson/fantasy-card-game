import React, { useState, useEffect } from 'react';
import FlyingText from './FlyingText';

function Card({ creature, onCardSelect, isSelected, disabled, side, damageEvents = [] }) {
  const healthPercent = (creature.currentHealth / creature.maxHealth) * 100;
  const barColor = `hsl(${healthPercent * 1.2}, 70%, 50%)`;
  
  const [activeDamageTexts, setActiveDamageTexts] = useState([]);
  
  useEffect(() => {
    if (damageEvents.length > 0) {
      const newTexts = damageEvents.map(event => ({
        id: Date.now() + Math.random(),
        ...event
      }));
      setActiveDamageTexts(prev => [...prev, ...newTexts]);
    }
  }, [damageEvents]);
  
  const handleTextComplete = (id) => {
    setActiveDamageTexts(prev => prev.filter(text => text.id !== id));
  };

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
      
      {activeDamageTexts.map(textEvent => (
        <FlyingText
          key={textEvent.id}
          damage={textEvent.damage}
          type={textEvent.type}
          onComplete={() => handleTextComplete(textEvent.id)}
        />
      ))}

    </div>
  );
}

export default Card;
