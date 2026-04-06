import { ABILITIES } from './creatures';
import { ELEMENT_ADVANTAGES, ADVANTAGE_MULTIPLIER, DISADVANTAGE_MULTIPLIER } from './constants';

// Ability configuration — maps ability IDs to their effects
export const abilityEffects = {
  // Damage — with DoT/status
  [ABILITIES.FIRE_BREATH]: { type: 'damage', value: 15, statusEffect: 'burning', dot: { damage: 5, duration: 2 } },
  [ABILITIES.BURN]: { type: 'damage', value: 15, statusEffect: 'burning', dot: { damage: 5, duration: 2 } },
  [ABILITIES.POISON_BITE]: { type: 'damage', value: 15, statusEffect: 'poisoned', dot: { damage: 4, duration: 3 } },
  [ABILITIES.WATER_BLAST]: { type: 'damage', value: 15, statusEffect: 'frozen', stuns: true, dot: { damage: 2, duration: 2 } },
  [ABILITIES.TIDAL_WAVE]: { type: 'damage', value: 15, statusEffect: 'frozen', stuns: true, dot: { damage: 2, duration: 2 } },
  [ABILITIES.CRUSHING_GRIP]: { type: 'damage', value: 15, statusEffect: 'constricted', dot: { damage: 3, duration: 2 } },
  [ABILITIES.SOUL_REAP]: { type: 'damage', value: 15, statusEffect: 'cursed' },
  [ABILITIES.DARK_SPELL]: { type: 'damage', value: 15, statusEffect: 'cursed' },
  [ABILITIES.NECROTIC_BLAST]: { type: 'damage', value: 15, statusEffect: 'cursed' },
  [ABILITIES.DARK_BLAST]: { type: 'damage', value: 15, statusEffect: 'cursed' },
  [ABILITIES.LIGHT_BEAM]: { type: 'damage', value: 15, statusEffect: 'blessed' },
  [ABILITIES.NATURES_WRATH]: { type: 'damage', value: 18, statusEffect: 'poisoned', dot: { damage: 5, duration: 3 } },
  [ABILITIES.BACKSTAB]: { type: 'damage', value: 25, statusEffect: 'bleeding', dot: { damage: 3, duration: 3 } },
  // Damage — pure
  [ABILITIES.MANA_BOLT]: { type: 'damage', value: 20 },
  [ABILITIES.PRECISION_SHOT]: { type: 'damage', value: 20 },
  [ABILITIES.SPEAR_THRUST]: { type: 'damage', value: 20 },
  [ABILITIES.RANGED_ATTACK]: { type: 'damage', value: 20 },
  [ABILITIES.ROCK_THROW]: { type: 'damage', value: 20 },
  [ABILITIES.GUST_OF_WIND]: { type: 'damage', value: 20 },
  [ABILITIES.CHAIN_LIGHTNING]: { type: 'damage', value: 18 },
  [ABILITIES.THUNDER_STRIKE]: { type: 'damage', value: 22 },
  [ABILITIES.CURSE]: { type: 'damage', value: 10, statusEffect: 'cursed' },
  // Damage — heavy hitters
  [ABILITIES.BERSERK]: { type: 'damage', value: 25 },
  [ABILITIES.CAST_SPELL]: { type: 'damage', value: 30 },
  // Damage — new abilities
  [ABILITIES.LIFESTEAL]: { type: 'damage', value: 15, lifesteal: 0.4 },
  [ABILITIES.MORTAL_STRIKE]: { type: 'damage', value: 20, statusEffect: 'wounded' },
  [ABILITIES.AMBUSH]: { type: 'damage', value: 30 },
  [ABILITIES.OVERCHARGE]: { type: 'damage', value: 40 },
  [ABILITIES.SIPHON]: { type: 'damage', value: 15, lifesteal: 0.3 },
  [ABILITIES.MARKED_SHOT]: { type: 'damage', value: 25, statusEffect: 'cursed' },
  [ABILITIES.DOUBLE_SHOT]: { type: 'damage', value: 30 },
  [ABILITIES.FLAME_SURGE]: { type: 'damage', value: 25, statusEffect: 'burning', dot: { damage: 5, duration: 2 } },
  [ABILITIES.DIVEBOMB]: { type: 'damage', value: 35 },
  [ABILITIES.HOLY_SMITE]: { type: 'damage', value: 25, selfBless: true },
  // Heal
  [ABILITIES.HEAL]: { type: 'heal', value: 28, statusEffect: 'blessed' },
  [ABILITIES.REGENERATE]: { type: 'heal', value: 22, statusEffect: 'blessed', dot: { damage: -5, duration: 3 } },
  [ABILITIES.RAISE_DEAD]: { type: 'heal', value: 20 },
  [ABILITIES.RALLY]: { type: 'heal', value: 15, statusEffect: 'blessed' },
  [ABILITIES.SUMMON_UNDEAD]: { type: 'heal', value: 15 },
  [ABILITIES.SUMMON_MINION]: { type: 'heal', value: 15 },
  // Defense
  [ABILITIES.SHIELD_WALL]: { type: 'defense', value: 20, statusEffect: 'blessed' },
  [ABILITIES.FORTIFY]: { type: 'defense', value: 18, statusEffect: 'blessed' },
  [ABILITIES.CAMOUFLAGE]: { type: 'defense', value: 15 },
  [ABILITIES.FLY]: { type: 'defense', value: 12 },
  [ABILITIES.EVASION]: { type: 'defense', value: 12 },
  [ABILITIES.TELEPORT]: { type: 'defense', value: 12 },
  [ABILITIES.SHADOW_STEP]: { type: 'defense', value: 12 },
  [ABILITIES.COMMAND]: { type: 'defense', value: 12, statusEffect: 'blessed' },
  [ABILITIES.ENSNARE]: { type: 'defense', value: 10, statusEffect: 'poisoned', dot: { damage: 4, duration: 2 } },
  // Stun
  [ABILITIES.STUN]: { type: 'stun', value: 0 },
  [ABILITIES.CONSTRICT]: { type: 'stun', value: 0 },
  [ABILITIES.ENTANGLE]: { type: 'stun', value: 0, statusEffect: 'poisoned', dot: { damage: 3, duration: 3 } },
  [ABILITIES.SCREECH]: { type: 'stun', value: 0, statusEffect: 'cursed' },
};

// --- Element advantage ---

export function getElementMultiplier(attacker, defender) {
  if (!attacker?.element || !defender?.element) return 1;
  if (attacker.element === defender.element) return 1;
  if (ELEMENT_ADVANTAGES[attacker.element]?.includes(defender.element)) return ADVANTAGE_MULTIPLIER;
  if (ELEMENT_ADVANTAGES[defender.element]?.includes(attacker.element)) return DISADVANTAGE_MULTIPLIER;
  return 1;
}

// --- Utility functions ---

export const formatAbility = ability =>
  ability.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const hasImmunity = (creature, effect) => {
  if (!effect) return false;
  return Array.isArray(creature?.immunities) && creature.immunities.includes(effect);
};

export const getResistanceMultiplier = (creature, effect) => {
  if (!effect) return 1;
  return creature?.resistances?.[effect] ?? 1;
};

// --- Deck creation ---

export const getRandomUniqueCards = (creaturesList, count) => {
  const selectedIndices = new Set();
  const selectedCards = [];

  while (selectedIndices.size < count) {
    const randomIndex = Math.floor(Math.random() * creaturesList.length);
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);
      const creatureCopy = JSON.parse(JSON.stringify(creaturesList[randomIndex]));
      selectedCards.push(creatureCopy);
    }
  }

  return selectedCards;
};

// --- Combat stat lookup ---

export function getCombatStat(attacker, choice) {
  switch (choice) {
    case 'Melee':
      return attacker.stats.strength;
    case 'Ranged':
      return attacker.stats.agility;
    case 'Magic':
      return attacker.stats.magic;
    default:
      return 0;
  }
}

// --- Status effects ---

export function applyStatusEffect(target, statusEffect, logFn) {
  if (!statusEffect) return;
  if (hasImmunity(target, statusEffect)) {
    const effectName = statusEffect.charAt(0).toUpperCase() + statusEffect.slice(1);
    logFn(`${target.name} shrugs off ${effectName}!`, 'status');
    return;
  }
  if (!target.statusEffects) target.statusEffects = [];
  if (!target.statusEffects.includes(statusEffect)) {
    target.statusEffects.push(statusEffect);
    const effectName = statusEffect.charAt(0).toUpperCase() + statusEffect.slice(1);
    logFn(`${target.name} is now ${effectName}!`, 'status');
  }
}

export function applyDoT(target, dotConfig, statusEffect, logFn) {
  if (!dotConfig) return;
  if (statusEffect && hasImmunity(target, statusEffect)) {
    const effectName = statusEffect.charAt(0).toUpperCase() + statusEffect.slice(1);
    logFn(`${target.name} is immune to ${effectName}! Ongoing effect fails.`, 'status');
    return;
  }
  if (!target.dotEffects) target.dotEffects = [];

  target.dotEffects.push({
    damage: dotConfig.damage,
    remainingDuration: dotConfig.duration,
    type: statusEffect
  });
}

export function processDoTDamage(card, logFn) {
  if (!card.dotEffects || card.dotEffects.length === 0) return 0;

  let totalDotDamage = 0;
  const remainingDots = [];

  card.dotEffects.forEach(dot => {
    const effectType = dot.type;
    if (effectType && hasImmunity(card, effectType)) {
      const effectName = effectType.charAt(0).toUpperCase() + effectType.slice(1);
      logFn(`${card.name} is immune to ${effectName}! The effect fades.`, 'status');
      return;
    }

    const resistance = effectType ? getResistanceMultiplier(card, effectType) : 1;
    let appliedDamage = dot.damage;
    if (resistance !== 1 && appliedDamage > 0) {
      appliedDamage = Math.max(0, Math.round(dot.damage * resistance));
      if (appliedDamage === 0) {
        const effectName = effectType ? effectType.charAt(0).toUpperCase() + effectType.slice(1) : 'effect';
        logFn(`${card.name} completely resists ${effectName}!`, 'status');
      } else if (resistance < 1) {
        const effectName = effectType ? effectType.charAt(0).toUpperCase() + effectType.slice(1) : 'effect';
        logFn(`${card.name} resists some of ${effectName}, taking ${appliedDamage} damage.`, 'status');
      }
    }

    totalDotDamage += appliedDamage;
    dot.remainingDuration -= 1;

    if (dot.remainingDuration > 0) {
      remainingDots.push(dot);
    }
  });

  card.dotEffects = remainingDots;

  if (totalDotDamage > 0) {
    card.currentHealth -= totalDotDamage;
    logFn(`${card.name} takes ${totalDotDamage} damage from ongoing effects!`, 'damage');
  } else if (totalDotDamage < 0) {
    const healAmount = Math.min(-totalDotDamage, card.maxHealth - card.currentHealth);
    card.currentHealth += healAmount;
    if (healAmount > 0) {
      logFn(`${card.name} regenerates ${healAmount} health!`, 'heal');
    }
  }

  return totalDotDamage;
}

// --- Ability resolution ---

export function resolveAbility(attacker, defender, ability, damage, logFn) {
  if (!ability) return { damage, heal: 0, abilityUsed: null };
  const effect = abilityEffects[ability];
  if (!effect) {
    logFn(`${attacker.name} uses ${formatAbility(ability)}!`, 'ability');
    return { damage, heal: 0, abilityUsed: ability };
  }

  switch (effect.type) {
    case 'damage':
      logFn(`${attacker.name} uses ${formatAbility(ability)} (+${effect.value} damage)!`, 'ability');
      if (effect.statusEffect) {
        applyStatusEffect(defender, effect.statusEffect, logFn);
      }
      if (effect.dot) {
        applyDoT(defender, effect.dot, effect.statusEffect, logFn);
      }
      if (effect.stuns) {
        if (!hasImmunity(defender, 'stun')) {
          const resistance = getResistanceMultiplier(defender, 'stun');
          if (resistance < 1 && Math.random() > resistance) {
            logFn(`${defender.name} resists being frozen in place!`, 'status');
          } else {
            defender.isStunned = true;
            logFn(`${defender.name} is frozen solid and cannot act next round!`, 'status');
          }
        } else {
          logFn(`${defender.name} is immune to being frozen in place!`, 'status');
        }
      }
      return { damage: damage + effect.value, heal: 0, abilityUsed: ability };
    case 'heal': {
      const healAmount = effect.value;
      attacker.currentHealth = Math.min(attacker.maxHealth, attacker.currentHealth + healAmount);
      logFn(`${attacker.name} uses ${formatAbility(ability)} and restores ${healAmount} HP!`, 'ability');
      if (effect.statusEffect) {
        applyStatusEffect(attacker, effect.statusEffect, logFn);
      }
      return { damage, heal: healAmount, abilityUsed: ability };
    }
    case 'defense':
      logFn(`${attacker.name} uses ${formatAbility(ability)} (-${effect.value} damage)!`, 'ability');
      if (effect.statusEffect) {
        applyStatusEffect(attacker, effect.statusEffect, logFn);
      }
      return { damage: Math.max(0, damage - effect.value), heal: 0, abilityUsed: ability };
    case 'stun': {
      const effectName = 'stun';
      if (hasImmunity(defender, effectName)) {
        logFn(`${attacker.name} uses ${formatAbility(ability)}! ${defender.name} is immune to stun.`, 'ability');
        return { damage, heal: 0, abilityUsed: ability };
      }
      const resistance = getResistanceMultiplier(defender, effectName);
      if (resistance < 1) {
        if (Math.random() > resistance) {
          logFn(`${attacker.name} tries ${formatAbility(ability)}, but ${defender.name} resists the stun!`, 'ability');
          return { damage, heal: 0, abilityUsed: ability };
        }
        logFn(`${attacker.name} uses ${formatAbility(ability)}! ${defender.name}'s resistance falters.`, 'ability');
      } else {
        logFn(`${attacker.name} uses ${formatAbility(ability)}! ${defender.name} is stunned.`, 'ability');
      }
      defender.isStunned = true;
      return { damage, heal: 0, abilityUsed: ability };
    }
    default:
      logFn(`${attacker.name} uses ${formatAbility(ability)}!`, 'ability');
      return { damage, heal: 0, abilityUsed: ability };
  }
}

// --- Combat ---

export function combatRound(attacker, defender, combatChoice, logFn) {
  if (attacker.isStunned) {
    logFn(`${attacker.name} is stunned and cannot act!`, 'status');
    return {
      player1Health: attacker.currentHealth,
      player2Health: defender.currentHealth,
      playerAttack: 0,
      opponentDamageTaken: 0,
      damageDealt: 0,
      heal: 0,
      attacker,
      defender
    };
  }

  const playerAttack = Math.max(0, getCombatStat(attacker, combatChoice) + Math.floor(Math.random() * 21));
  const defenseMod = defender.stats.defense / 2;
  let damage = Math.max(0, playerAttack - defenseMod);
  const elementMult = getElementMultiplier(attacker, defender);
  damage = Math.round(damage * elementMult);
  if (elementMult > 1) {
    logFn(`${attacker.element} is strong against ${defender.element}! (${Math.round(elementMult * 100)}% damage)`, 'advantage');
  } else if (elementMult < 1) {
    logFn(`${attacker.element} is weak against ${defender.element}. (${Math.round(elementMult * 100)}% damage)`, 'disadvantage');
  }
  let ability = null;
  let heal = 0;

  const triggerRate = combatChoice === 'Ranged' ? 0.6 : 0.5;
  if (!attacker.isStunned && Math.random() < triggerRate) {
    ability =
      attacker.selectedAbility ||
      (attacker.abilities &&
        attacker.abilities[Math.floor(Math.random() * attacker.abilities.length)]);
  }
  const abilityResult = resolveAbility(attacker, defender, ability, damage, logFn);
  damage = abilityResult.damage;
  heal = abilityResult.heal;
  const abilityUsed = abilityResult.abilityUsed;

  logFn(`Attacker: ${attacker.name} (${combatChoice})`, 'info');
  logFn(`Attack value: ${playerAttack}`, 'info');
  if (defenseMod > 0) {
    logFn(`Defense modifier: -${defenseMod}`, 'info');
  }
  const damageType = abilityResult?.abilityUsed ? abilityEffects[abilityResult.abilityUsed]?.statusEffect : null;
  if (damageType && hasImmunity(defender, damageType)) {
    logFn(`${defender.name} is immune to ${damageType}! Damage is negated.`, 'status');
    damage = 0;
  }

  const resistance = damageType ? getResistanceMultiplier(defender, damageType) : 1;
  if (resistance < 1 && damage > 0) {
    const reduced = Math.max(0, Math.round(damage * resistance));
    if (reduced < damage) {
      logFn(`${defender.name} resists some of the ${damageType || 'attack'}, taking ${reduced} damage.`, 'status');
      damage = reduced;
    }
  }

  if (damage > 0 && defender.statusEffects?.includes('blessed')) {
    const reduced = Math.round(damage * 0.9);
    logFn(`${defender.name}'s blessing absorbs ${damage - reduced} damage!`, 'status');
    damage = reduced;
  }

  if (damage > 0 && defender.statusEffects?.includes('cursed')) {
    const increased = Math.round(damage * 1.1);
    logFn(`${defender.name}'s curse amplifies the damage by ${increased - damage}!`, 'status');
    damage = increased;
  }

  logFn(`Damage dealt: ${damage}`, 'damage', combatChoice);

  const actualDamage = Math.min(damage, defender.currentHealth);
  defender.currentHealth -= damage;

  // Lifesteal: heal attacker based on damage dealt
  if (abilityUsed && abilityEffects[abilityUsed]?.lifesteal && actualDamage > 0) {
    const lsHeal = Math.round(actualDamage * abilityEffects[abilityUsed].lifesteal);
    const actualHeal = Math.min(lsHeal, attacker.maxHealth - attacker.currentHealth);
    if (actualHeal > 0) {
      attacker.currentHealth += actualHeal;
      heal += actualHeal;
      logFn(`${attacker.name} drains ${actualHeal} HP!`, 'heal');
    }
  }

  // Self-bless: apply blessed to attacker
  if (abilityUsed && abilityEffects[abilityUsed]?.selfBless) {
    if (!attacker.statusEffects) attacker.statusEffects = [];
    if (!attacker.statusEffects.includes('blessed')) {
      attacker.statusEffects.push('blessed');
    }
  }

  const player1Health = attacker.currentHealth;
  const player2Health = defender.currentHealth;
  logFn(`${attacker.name} HP: ${player1Health}`, 'info');
  logFn(`${defender.name} HP: ${player2Health}`, 'info');

  return {
    player1Health,
    player2Health,
    playerAttack,
    opponentDamageTaken: damage,
    damageDealt: actualDamage,
    heal,
    attacker,
    defender,
    abilityUsed
  };
}

// --- Victory check ---

export const victoryCheck = (player1card, player2card) => {
  if (player1card.currentHealth <= 0) {
    return { haveWinner: true, winner: player2card };
  } else if (player2card.currentHealth <= 0) {
    return { haveWinner: true, winner: player1card };
  } else {
    return { haveWinner: false, winner: null };
  }
};

// --- Full combat round (initiative + both attacks) ---

export const handleCombatRound = (player1card, player2card, player1Choice, player2Choice, logFn) => {
  logFn('Starting combat round', 'info');

  const rangedBonus1 = player1Choice === 'Ranged' ? 10 : 0;
  const rangedBonus2 = player2Choice === 'Ranged' ? 10 : 0;
  const player1Initiative = player1card.stats.agility * 0.4 + player1card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21) + rangedBonus1;
  const player2Initiative = player2card.stats.agility * 0.4 + player2card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21) + rangedBonus2;

  logFn(`${player1card.name} initiative: ${player1Initiative}`, 'info');
  logFn(`${player2card.name} initiative: ${player2Initiative}`, 'info');

  let firstAttacker, secondAttacker;
  let firstChoice, secondChoice;

  if (player1Initiative > player2Initiative) {
    firstAttacker = player1card;
    firstChoice = player1Choice;
    secondAttacker = player2card;
    secondChoice = player2Choice;
  } else {
    firstAttacker = player2card;
    firstChoice = player2Choice;
    secondAttacker = player1card;
    secondChoice = player1Choice;
  }

  const firstAttackerPlayer = firstAttacker === player1card ? 'Player 1' : 'Player 2';
  logFn(`${firstAttacker.name} (${firstAttackerPlayer}) goes first`, 'info');
  logFn(' ', 'separator');

  let outcome1 = combatRound(firstAttacker, secondAttacker, firstChoice, logFn);

  logFn(' ', 'separator');

  const result1 = victoryCheck(player1card, player2card);
  if (result1.haveWinner) {
    return {
      ...result1,
      player1Damage: outcome1.defender === player1card ? outcome1.damageDealt : 0,
      player2Damage: outcome1.defender === player2card ? outcome1.damageDealt : 0,
      player1Heal: outcome1.attacker === player1card ? outcome1.heal : 0,
      player2Heal: outcome1.attacker === player2card ? outcome1.heal : 0,
      player1card: player1card,
      player2card: player2card,
      abilityUsed: outcome1.abilityUsed ? { ability: outcome1.abilityUsed, cardName: outcome1.attacker.name, side: outcome1.attacker === player1card ? 'p1' : 'p2' } : null
    };
  }

  let outcome2 = combatRound(secondAttacker, firstAttacker, secondChoice, logFn);
  logFn('', 'separator');
  logFn('', 'separator');

  const result2 = victoryCheck(player1card, player2card);
  if (result2.haveWinner) {
    return {
      ...result2,
      player1Damage: (outcome1.defender === player1card ? outcome1.damageDealt : 0) + (outcome2.defender === player1card ? outcome2.damageDealt : 0),
      player2Damage: (outcome1.defender === player2card ? outcome1.damageDealt : 0) + (outcome2.defender === player2card ? outcome2.damageDealt : 0),
      player1Heal: (outcome1.attacker === player1card ? outcome1.heal : 0) + (outcome2.attacker === player1card ? outcome2.heal : 0),
      player2Heal: (outcome1.attacker === player2card ? outcome1.heal : 0) + (outcome2.attacker === player2card ? outcome2.heal : 0),
      player1card: player1card,
      player2card: player2card,
      abilityUsed: outcome2.abilityUsed ? { ability: outcome2.abilityUsed, cardName: outcome2.attacker.name, side: outcome2.attacker === player1card ? 'p1' : 'p2' } : (outcome1.abilityUsed ? { ability: outcome1.abilityUsed, cardName: outcome1.attacker.name, side: outcome1.attacker === player1card ? 'p1' : 'p2' } : null)
    };
  }

  return {
    haveWinner: false,
    player1Damage: (outcome1.defender === player1card ? outcome1.damageDealt : 0) + (outcome2.defender === player1card ? outcome2.damageDealt : 0),
    player2Damage: (outcome1.defender === player2card ? outcome1.damageDealt : 0) + (outcome2.defender === player2card ? outcome2.damageDealt : 0),
    player1Heal: (outcome1.attacker === player1card ? outcome1.heal : 0) + (outcome2.attacker === player1card ? outcome2.heal : 0),
    player2Heal: (outcome1.attacker === player2card ? outcome1.heal : 0) + (outcome2.attacker === player2card ? outcome2.heal : 0),
    player1card: player1card,
    player2card: player2card,
    abilityUsed: outcome2.abilityUsed ? { ability: outcome2.abilityUsed, cardName: outcome2.attacker.name, side: outcome2.attacker === player1card ? 'p1' : 'p2' } : (outcome1.abilityUsed ? { ability: outcome1.abilityUsed, cardName: outcome1.attacker.name, side: outcome1.attacker === player1card ? 'p1' : 'p2' } : null)
  };
};

// --- AI decision logic ---

export function makeAIDecision(hand) {
  if (hand.length === 0) return null;

  const best = hand.reduce((acc, card) => {
    if (card.currentHealth <= 0) return acc;
    const stats = [
      { choice: 'Melee', value: card.stats.strength },
      { choice: 'Ranged', value: card.stats.agility },
      { choice: 'Magic', value: card.stats.magic },
    ];
    const top = stats.reduce((p, c) => (c.value > p.value ? c : p));
    if (!acc || top.value > acc.value) {
      return { card, choice: top.choice, value: top.value };
    }
    return acc;
  }, null);

  return best;
}
