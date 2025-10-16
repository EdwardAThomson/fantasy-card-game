import React, { useEffect, useState } from 'react';

function AbilityIcon({ ability, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000); // Duration for ability icon to be visible

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  // Map abilities to emoji icons
  const abilityIcons = {
    fire_breath: '🔥',
    heal: '💚',
    berserk: '💢',
    shield_wall: '🛡️',
    stun: '⭐',
    fly: '🦅',
    cast_spell: '✨',
    teleport: '🌀',
    precision_shot: '🎯',
    evasion: '💨',
    soul_reap: '💀',
    mana_bolt: '⚡',
    curse: '🌙',
    light_beam: '☀️',
    summon_undead: '👻',
    dark_spell: '🌑',
    backstab: '🩸',
    shadow_step: '👤',
    poison_bite: '☠️',
    raise_dead: '⚰️',
    necrotic_blast: '💜',
    dark_blast: '🖤',
    summon_minion: '👹',
    spear_thrust: '🔱',
    command: '👑',
    rally: '📯',
    ranged_attack: '🏹',
    camouflage: '🍃',
    burn: '🔥',
    water_blast: '💧',
    rock_throw: '🪨',
    gust_of_wind: '🌪️',
  };

  const icon = abilityIcons[ability] || '✨';

  return <div className="ability-icon">{icon}</div>;
}

export default AbilityIcon;
