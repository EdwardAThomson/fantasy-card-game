import React, { useState, useEffect } from 'react';
import FlyingText from './FlyingText';
import AbilityIcon from './AbilityIcon';

function Card({ creature, onCardSelect, isSelected, disabled, side, damageEvents = [], abilityUsed = null }) {
  const [displayHealth, setDisplayHealth] = useState(creature.currentHealth);
  const [activeDamageTexts, setActiveDamageTexts] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [activeAbilityIcon, setActiveAbilityIcon] = useState(null);
  
  const healthPercent = (displayHealth / creature.maxHealth) * 100;
  const barColor = `hsl(${healthPercent * 1.2}, 70%, 50%)`;
  
  useEffect(() => {
    const relevantEvents = damageEvents.filter(event => event.cardName === creature.name);
    if (relevantEvents.length > 0) {
      const newTexts = relevantEvents.map(event => ({
        id: Date.now() + Math.random(),
        ...event
      }));
      setActiveDamageTexts(prev => [...prev, ...newTexts]);
      
      // Trigger shake animation for damage
      if (relevantEvents.some(event => event.type === 'damage')) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600); // Match CSS animation duration
        
        // Delay HP bar update by 300ms to sync with damage animation
        setTimeout(() => {
          setDisplayHealth(creature.currentHealth);
        }, 300);
      }
    }
  }, [damageEvents, creature.name, creature.currentHealth]);
  
  // Update display health when creature health changes (for non-damage updates)
  useEffect(() => {
    if (damageEvents.length === 0) {
      setDisplayHealth(creature.currentHealth);
    }
  }, [creature.currentHealth, damageEvents.length]);
  
  const handleTextComplete = (id) => {
    setActiveDamageTexts(prev => prev.filter(text => text.id !== id));
  };

  const handleAbilityIconComplete = () => {
    setActiveAbilityIcon(null);
  };

  // Show ability icon when ability is used (with delay to avoid overlap with damage numbers)
  useEffect(() => {
    if (abilityUsed && abilityUsed.cardName === creature.name && abilityUsed.side === side) {
      // Delay the ability icon so it appears after damage numbers start
      const timer = setTimeout(() => {
        setActiveAbilityIcon(abilityUsed.ability);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [abilityUsed, creature.name, side]);

  // Determine card class modifiers based on status effects
  const getCardClasses = () => {
    const classes = ['card'];
    if (isSelected) classes.push('selected');
    if (disabled) classes.push('disabled');
    if (side === 'p1') classes.push('card-p1');
    if (side === 'p2') classes.push('card-p2');
    if (isShaking) classes.push('shake');
    
    // Add buff/debuff glow effects
    if (creature.statusEffects && creature.statusEffects.length > 0) {
      const hasDebuff = creature.statusEffects.some(e => ['burning', 'poisoned', 'cursed', 'frozen', 'bleeding'].includes(e));
      const hasBuff = creature.statusEffects.some(e => ['blessed', 'shielded'].includes(e));
      if (hasDebuff) classes.push('debuffed');
      if (hasBuff) classes.push('buffed');
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={getCardClasses()}
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
      
      {activeDamageTexts.map((textEvent, index) => (
        <FlyingText
          key={textEvent.id}
          damage={textEvent.damage}
          type={textEvent.type}
          onComplete={() => handleTextComplete(textEvent.id)}
          delay={textEvent.type === 'heal' && activeDamageTexts.some(e => e.type === 'damage') ? 500 : 0}
        />
      ))}

      {creature.isStunned && (
        <div className="stunned-overlay">
          <span>Stunned</span>
        </div>
      )}

      {/* Status effect badges */}
      {creature.statusEffects && creature.statusEffects.length > 0 && (
        <div className="status-badges">
          {creature.statusEffects.map((effect, index) => (
            <div key={index} className={`status-badge ${effect}`}>
              <span>{effect.charAt(0).toUpperCase() + effect.slice(1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ability icon pop-up */}
      {activeAbilityIcon && (
        <AbilityIcon ability={activeAbilityIcon} onComplete={handleAbilityIconComplete} />
      )}
    </div>
  );
}

export default Card;
