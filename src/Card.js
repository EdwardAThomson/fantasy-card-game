import React, { useState, useEffect } from 'react';
import FlyingText from './FlyingText';
import AbilityIcon from './AbilityIcon';
import { ELEMENTS } from './constants';

function Card({ creature, onCardSelect, isSelected, isDying, disabled, side, damageEvents = [], abilityUsed = null, compact = false }) {
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
    if (compact) classes.push('compact');
    if (isSelected) classes.push('selected');
    if (disabled) classes.push('disabled');
    if (side === 'p1') classes.push('card-p1');
    if (side === 'p2') classes.push('card-p2');
    if (isShaking) classes.push('shake');
    if (isDying) classes.push('dying');

    // Add buff/debuff glow effects
    if (creature.statusEffects && creature.statusEffects.length > 0) {
      const hasDebuff = creature.statusEffects.some(e => ['burning', 'poisoned', 'cursed', 'frozen', 'bleeding', 'constricted'].includes(e));
      const hasBuff = creature.statusEffects.some(e => ['blessed', 'shielded'].includes(e));
      if (hasDebuff) classes.push('debuffed');
      if (hasBuff) classes.push('buffed');
    }
    
    return classes.join(' ');
  };

  if (compact) {
    return (
      <div
        className={getCardClasses()}
        onClick={disabled ? undefined : onCardSelect}
        style={{ '--element-color': ELEMENTS[creature.element]?.color }}
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
        <div className="card-title-row">
          {creature.element && ELEMENTS[creature.element] && (
            <div className="element-badge" aria-label={`${creature.element} element`}>
              <span>{ELEMENTS[creature.element].icon}</span>
            </div>
          )}
          <h2>{creature.name}</h2>
        </div>
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

  return (
    <div
      className={getCardClasses()}
      onClick={disabled ? undefined : onCardSelect}
      style={{ '--element-color': ELEMENTS[creature.element]?.color }}
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
      <div className="card-title-row">
        {creature.element && ELEMENTS[creature.element] && (
          <div className="element-badge" tabIndex={0} aria-label={`${creature.element} element`}>
            <span>{ELEMENTS[creature.element].icon}</span>
            <span className="element-badge-tooltip">
              {creature.element.charAt(0).toUpperCase() + creature.element.slice(1)}
            </span>
          </div>
        )}
        <h2>{creature.name}</h2>
        {(Array.isArray(creature.immunities) && creature.immunities.length > 0) || (creature.resistances && Object.keys(creature.resistances).length > 0) ? (
          <div className="defense-tooltip" aria-label="Defensive traits" role="button" tabIndex={0}>
            🛡️
            <div className="defense-tooltip-content">
              <p>
                <strong>Immunities:</strong>{' '}
                {Array.isArray(creature.immunities) && creature.immunities.length > 0
                  ? creature.immunities.join(', ')
                  : 'None'}
              </p>
              <p>
                <strong>Resistances:</strong>{' '}
                {creature.resistances && Object.keys(creature.resistances).length > 0
                  ? Object.entries(creature.resistances)
                      .map(([effect, multiplier]) => `${effect} (${Math.round(multiplier * 100)}%)`)
                      .join(', ')
                  : 'None'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
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
