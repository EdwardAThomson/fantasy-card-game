import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import FlyingText from './FlyingText';
import AbilityEffect from './AbilityEffect';
import { ELEMENTS } from './constants';
import { formatAbility, getElementMatchups } from './gameEngine';
import './Card.css';

const STAT_ORDER = ['strength', 'agility', 'intelligence', 'defense', 'magic'];

const STAT_META = {
  strength: { abbr: 'STR', label: 'Strength' },
  agility: { abbr: 'AGI', label: 'Agility' },
  intelligence: { abbr: 'INT', label: 'Intelligence' },
  defense: { abbr: 'DEF', label: 'Defense' },
  magic: { abbr: 'MAG', label: 'Magic' },
};

const STAT_PATHS = {
  strength: 'M19 3h2v2l-9.5 9.5-2-2z M9 13l2 2-1.5 1.5 1 1-1.4 1.4-1-1L5.5 20.5 3.5 18.5l2.6-2.6-1-1L6.5 13.5l1 1z',
  agility: 'M20 4C12 4 6 9 5 17l-2 3h2l1.5-2.2C13 17 18 12 20 4zM8.5 15c1-3 3.5-6 7-8-2.5 2.5-4.5 5-6 8z',
  intelligence: 'M12 5C7 5 3.5 8.5 2 12c1.5 3.5 5 7 10 7s8.5-3.5 10-7c-1.5-3.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2.2a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z',
  defense: 'M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z',
  magic: 'M12 2l2.2 6.3L20.5 9l-5 4 1.7 6.5L12 16l-5.2 3.5L8.5 13l-5-4 6.3-.7z',
};

const StatIcon = ({ stat }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={STAT_PATHS[stat]} fill="currentColor" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Long names shrink to fit one line instead of wrapping and pushing the art down.
// Sizes are in em, so the result holds at every card scale.
const NAME_SIZE_EM = 1.05;
const MIN_NAME_SCALE = 0.55;

function Card({ creature, onCardSelect, isSelected, isDying, disabled, side, damageEvents = [], abilityUsed = null, compact = false }) {
  const [displayHealth, setDisplayHealth] = useState(creature.currentHealth);
  const [activeDamageTexts, setActiveDamageTexts] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [activeAbilityIcon, setActiveAbilityIcon] = useState(null);
  
  const nameRef = useRef(null);

  const healthPercent = (displayHealth / creature.maxHealth) * 100;

  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return undefined;
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      el.style.fontSize = '';
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth) {
        const scale = Math.max(MIN_NAME_SCALE, (el.clientWidth / el.scrollWidth) * 0.98);
        el.style.fontSize = `${(NAME_SIZE_EM * scale).toFixed(3)}em`;
      }
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return () => { cancelled = true; };
  }, [creature.name]);
  
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

  // Play the ability effect on this card (the target for attacks, the user for heals/defence)
  useEffect(() => {
    if (abilityUsed && abilityUsed.cardName === creature.name && abilityUsed.side === side) {
      // Short delay so the effect lands with the hit rather than before it
      const timer = setTimeout(() => {
        setActiveAbilityIcon(abilityUsed.ability);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [abilityUsed, creature.name, side]);

  // Determine card class modifiers based on status effects
  const getCardClasses = () => {
    const classes = ['card', 'foil'];
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

  const element = ELEMENTS[creature.element];
  const elementLabel = creature.element
    ? creature.element.charAt(0).toUpperCase() + creature.element.slice(1)
    : '';
  const hasDefenses =
    (Array.isArray(creature.immunities) && creature.immunities.length > 0) ||
    (creature.resistances && Object.keys(creature.resistances).length > 0);
  const hpClass = healthPercent < 30 ? 'low' : healthPercent < 60 ? 'mid' : '';

  return (
    <div
      className={getCardClasses()}
      data-tutorial={`card-${creature.name}`}
      onClick={disabled ? undefined : onCardSelect}
      style={{ '--element-color': element?.color }}
    >
      <div className="card-inner">
        <div className="card-head">
          {element ? (
            <div className="element-badge" data-tutorial="card-element" tabIndex={compact ? undefined : 0} aria-label={`${creature.element} element`}>
              <span aria-hidden="true">{element.icon}</span>
              {!compact && (
                <span className="element-badge-tooltip">
                  {elementLabel}
                  <span className="tooltip-matchups">
                    Strong vs {getElementMatchups(creature.element).strong.map(e => ELEMENTS[e].icon).join(' ') || '–'}
                  </span>
                  <span className="tooltip-matchups">
                    Weak vs {getElementMatchups(creature.element).weak.map(e => ELEMENTS[e].icon).join(' ') || '–'}
                  </span>
                </span>
              )}
            </div>
          ) : <span />}
          <h2 ref={nameRef} className="card-name">{creature.name}</h2>
          {hasDefenses && !compact ? (
            <div className="defense-tooltip" aria-label="Defensive traits" role="button" tabIndex={0}>
              <ShieldIcon />
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
          ) : <span />}
        </div>

        <div className="card-art">
          <img src={creature.image} alt={creature.name} className="creature-image" />
          <div className={`health-bar ${hpClass}`} data-tutorial="card-health">
            <div className="health-bar-fill" style={{ width: `${healthPercent}%` }}></div>
            <span className="health-bar-text">
              {displayHealth} / {creature.maxHealth}
            </span>
          </div>
        </div>

        <ul className="card-stats" data-tutorial="card-stats">
          {STAT_ORDER.filter(stat => creature.stats[stat] !== undefined).map(stat => (
            <li key={stat} title={`${STAT_META[stat].label}: ${creature.stats[stat]}`}>
              <StatIcon stat={stat} />
              <b>{creature.stats[stat]}</b>
              <small>{STAT_META[stat].abbr}</small>
            </li>
          ))}
        </ul>

        {!compact && Array.isArray(creature.abilities) && creature.abilities.length > 0 && (
          <div className="card-abilities">
            {creature.abilities.map(ability => (
              <span key={ability}>{formatAbility(ability)}</span>
            ))}
          </div>
        )}
      </div>

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

      {/* Ability special effect */}
      {activeAbilityIcon && (
        <AbilityEffect ability={activeAbilityIcon} onComplete={handleAbilityIconComplete} />
      )}
    </div>
  );
}

export default Card;
