import React, { useEffect, useMemo, useRef } from 'react';
import { formatAbility } from './gameEngine';
import './AbilityEffect.css';

const DURATION = 1600;

// Each ability plays one of these visual families.
const FAMILY = {
  fire_breath: 'fire', burn: 'fire', flame_surge: 'fire',
  water_blast: 'frost', tidal_wave: 'frost',
  thunder_strike: 'lightning', chain_lightning: 'lightning', overcharge: 'lightning',
  poison_bite: 'nature', natures_wrath: 'nature', entangle: 'nature', ensnare: 'nature', camouflage: 'nature',
  rock_throw: 'earth',
  gust_of_wind: 'wind', fly: 'wind', evasion: 'wind', divebomb: 'wind',
  heal: 'heal', regenerate: 'heal', rally: 'heal',
  shield_wall: 'shield', fortify: 'shield', command: 'shield',
  stun: 'stun', constrict: 'stun', screech: 'stun',
  soul_reap: 'dark', curse: 'dark', dark_spell: 'dark', necrotic_blast: 'dark', dark_blast: 'dark',
  summon_undead: 'dark', raise_dead: 'dark', summon_minion: 'dark', lifesteal: 'dark', siphon: 'dark',
  shadow_step: 'dark',
  cast_spell: 'arcane', mana_bolt: 'arcane', teleport: 'arcane',
  light_beam: 'light', holy_smite: 'light',
  berserk: 'slash', backstab: 'slash', spear_thrust: 'slash', mortal_strike: 'slash',
  ambush: 'slash', crushing_grip: 'slash',
  precision_shot: 'shot', ranged_attack: 'shot', marked_shot: 'shot', double_shot: 'shot',
};

const PARTICLES = {
  fire: 18, frost: 14, lightning: 10, nature: 14, earth: 12, wind: 6, heal: 14,
  shield: 8, stun: 5, dark: 12, arcane: 14, light: 12, slash: 10, shot: 8,
};

export const getAbilityFamily = ability => FAMILY[ability] || 'arcane';

const rand = (min, max) => min + Math.random() * (max - min);

// Random particle paths: each family's CSS decides how --x/--y/--r are used
// (rising embers, radial bursts, orbits...), so one generator serves all.
function makeParticles(family) {
  const count = PARTICLES[family] || 12;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
    const dist = rand(45, 95);
    return {
      '--x': `${Math.cos(angle) * dist}px`,
      '--y': `${Math.sin(angle) * dist}px`,
      '--sx': `${rand(-50, 50)}px`,
      '--r': `${rand(-200, 200)}deg`,
      '--a': `${(i / count) * 360}deg`,
      '--s': rand(0.6, 1.3).toFixed(2),
      '--delay': `${Math.round(rand(0, 260))}ms`,
    };
  });
}

function AbilityEffect({ ability, onComplete }) {
  const family = getAbilityFamily(ability);
  const particles = useMemo(() => makeParticles(family), [family]);

  // Keep the latest callback without restarting the timer on parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current && onCompleteRef.current(), DURATION);
    return () => clearTimeout(timer);
  }, [ability]);

  return (
    <div className={`fx fx-${family}`} aria-hidden="true">
      <div className="fx-flash" />
      <div className="fx-feature">
        {family === 'lightning' && (
          <svg className="fx-bolt" viewBox="0 0 60 160" preserveAspectRatio="none">
            <polygon points="38,0 10,78 28,80 16,160 52,62 33,60 50,0" />
          </svg>
        )}
        {family === 'slash' && [0, 1, 2].map(i => <span key={i} className="fx-cut" />)}
        {family === 'light' && <span className="fx-beam" />}
        {['shield', 'arcane', 'shot'].includes(family) && <span className="fx-ring" />}
      </div>
      <div className="fx-particles">
        {particles.map((style, i) => <span key={i} className="fx-p" style={style} />)}
      </div>
      <div className="fx-label">{formatAbility(ability)}</div>
    </div>
  );
}

export default AbilityEffect;
