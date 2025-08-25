import React, { useState, useEffect } from 'react';
import FlyingText from './FlyingText';

function Card({ creature, onCardSelect, isSelected, disabled, side, damageEvents = [] }) {
  const [displayHealth, setDisplayHealth] = useState(creature.currentHealth);
  const [activeDamageTexts, setActiveDamageTexts] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  
  const healthPercent = (displayHealth / creature.maxHealth) * 100;
  const barColor = `hsl(${healthPercent * 1.2}, 70%, 50%)`;
  
  useEffect(() => {
    if (damageEvents.length > 0) {
      const newTexts = damageEvents.map(event => ({
        id: Date.now() + Math.random(),
        ...event
      }));
      setActiveDamageTexts(prev => [...prev, ...newTexts]);
      
      // Trigger shake animation for damage
      if (damageEvents.some(event => event.type === 'damage')) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600); // Match CSS animation duration
        
        // Delay HP bar update by 300ms to sync with damage animation
        setTimeout(() => {
          setDisplayHealth(creature.currentHealth);
        }, 300);
      }
    }
  }, [damageEvents, creature.currentHealth]);
  
  // Update display health when creature health changes (for non-damage updates)
  useEffect(() => {
    if (damageEvents.length === 0) {
      setDisplayHealth(creature.currentHealth);
    }
  }, [creature.currentHealth, damageEvents.length]);
  
  const handleTextComplete = (id) => {
    setActiveDamageTexts(prev => prev.filter(text => text.id !== id));
  };

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${side === 'p1' ? 'card-p1' : side === 'p2' ? 'card-p2' : ''} ${isShaking ? 'shake' : ''}`}
      onClick={disabled ? undefined : onCardSelect}
    >
      <div className="health-bar">
        <div
          className="health-bar-fill"
          style={{ width: `${healthPercent}%`, backgroundColor: barColor }}
        ></div>
        <span className="health-bar-text">
          {displayHealth} / {creature.maxHealth}
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
