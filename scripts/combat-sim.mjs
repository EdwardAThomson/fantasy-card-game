#!/usr/bin/env node
/**
 * Combat Simulator — runs every 1v1 creature pair many times and reports stats.
 *
 * Usage:
 *   node scripts/combat-sim.mjs              # first 5 creatures, 200 iterations
 *   node scripts/combat-sim.mjs --all        # all creatures
 *   node scripts/combat-sim.mjs -n 10        # first 10 creatures
 *   node scripts/combat-sim.mjs -i 500       # 500 iterations per pair
 *   node scripts/combat-sim.mjs --out baseline  # save to scripts/results/baseline.txt + .json
 *   node scripts/combat-sim.mjs --elements      # enable element advantages (default 1.25/0.75)
 *   node scripts/combat-sim.mjs --elements --mult 1.15  # custom multiplier (1.15 strong / 0.85 weak)
 *   node scripts/combat-sim.mjs --tuned        # apply rebalanced ability values
 *   node scripts/combat-sim.mjs --rework       # apply ability reworks for bottom-tier creatures
 */

// ---------- import game logic (ESM) ----------

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '..', 'src');

// We can't directly import .js files that live inside a CRA project (no
// "type":"module" in package.json), so we evaluate them in a small sandbox.

function loadModule(file) {
  const code = readFileSync(resolve(srcDir, file), 'utf-8');
  return code;
}

// --- Step 1: Load ABILITIES constant and creatures array from creatures.js ---

const creaturesSource = loadModule('creatures.js');

// Extract ABILITIES object
const abilitiesMatch = creaturesSource.match(
  /export\s+const\s+ABILITIES\s*=\s*(\{[\s\S]*?\n\});/
);
if (!abilitiesMatch) throw new Error('Could not parse ABILITIES from creatures.js');
const ABILITIES = new Function(`return ${abilitiesMatch[1]}`)();

// Extract the creatures array
const creaturesArrayMatch = creaturesSource.match(
  /const\s+creatures\s*=\s*(\[[\s\S]*\]);\s*\n\s*export\s+default/
);
if (!creaturesArrayMatch) throw new Error('Could not parse creatures array');
const creatures = new Function('ABILITIES', `return ${creaturesArrayMatch[1]}`)(ABILITIES);

// --- Step 2: Load gameEngine functions ---

const engineSource = loadModule('gameEngine.js');

// Rewrite imports so we can eval it
let engineClean = engineSource
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '')
  .replace(/export\s+/g, '');

// Provide ABILITIES + element multiplier in scope and collect the exports we need
// Note: engineClean may be patched below (after CLI args are parsed) to inject element logic
function buildEngine(code) {
  const fn = new Function('ABILITIES', 'getElementMultiplier', 'ELEMENT_ADVANTAGES', 'ADVANTAGE_MULTIPLIER', 'DISADVANTAGE_MULTIPLIER', `
    ${code}
    return {
      abilityEffects, combatRound, handleCombatRound, processDoTDamage,
      victoryCheck, getCombatStat, formatAbility, hasImmunity,
      getResistanceMultiplier, resolveAbility, applyStatusEffect, applyDoT,
    };
  `);
  return fn(ABILITIES, getElementMultiplier, ELEMENT_ADVANTAGES, ADVANTAGE_MULT, DISADVANTAGE_MULT);
}

// --- Element advantage system ---

const ELEMENT_ADVANTAGES = {
  fire:      ['nature', 'air'],
  water:     ['fire', 'lightning'],
  nature:    ['water', 'earth'],
  earth:     ['lightning', 'fire'],
  air:       ['earth', 'nature'],
  lightning: ['water', 'air'],
  light:     ['dark', 'fire'],
  dark:      ['lightning', 'nature'],
};

let ADVANTAGE_MULT = 1.25;
let DISADVANTAGE_MULT = 0.75;

function getElementMultiplier(attacker, defender) {
  if (!attacker?.element || !defender?.element) return 1;
  if (attacker.element === defender.element) return 1;
  if (ELEMENT_ADVANTAGES[attacker.element]?.includes(defender.element)) return ADVANTAGE_MULT;
  if (ELEMENT_ADVANTAGES[defender.element]?.includes(attacker.element)) return DISADVANTAGE_MULT;
  return 1;
}

// engine is built after CLI args are parsed (may need element patching)
let engine, handleCombatRound, processDoTDamage;

// ---------- helpers ----------

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function bestChoice(card) {
  const stats = [
    { choice: 'Melee', value: card.stats.strength },
    { choice: 'Ranged', value: card.stats.agility },
    { choice: 'Magic', value: card.stats.magic },
  ];
  return stats.reduce((a, b) => (b.value > a.value ? b : a)).choice;
}

const noop = () => {};

// ---------- simulation ----------

function simulateFight(creatureA, creatureB, iterations) {
  let aWins = 0;
  let bWins = 0;
  let totalRounds = 0;
  let totalDamageByA = 0;
  let totalDamageByB = 0;
  let totalAbilityProcsA = 0;
  let totalAbilityProcsB = 0;
  let totalHealA = 0;
  let totalHealB = 0;

  for (let i = 0; i < iterations; i++) {
    const a = deepClone(creatureA);
    const b = deepClone(creatureB);
    const choiceA = bestChoice(a);
    const choiceB = bestChoice(b);

    let rounds = 0;
    const MAX_ROUNDS = 50;

    while (a.currentHealth > 0 && b.currentHealth > 0 && rounds < MAX_ROUNDS) {
      rounds++;

      // Process DoT at start of round
      const dotA = processDoTDamage(a, noop);
      const dotB = processDoTDamage(b, noop);

      if (dotA > 0) totalDamageByB += dotA; // DoT on A was caused by B
      if (dotB > 0) totalDamageByA += dotB; // DoT on B was caused by A
      if (dotA < 0) totalHealA += Math.min(-dotA, a.maxHealth - a.currentHealth + (-dotA));
      if (dotB < 0) totalHealB += Math.min(-dotB, b.maxHealth - b.currentHealth + (-dotB));

      if (a.currentHealth <= 0 || b.currentHealth <= 0) break;

      // Clear status effects (they last one round)
      const wasAStunned = a.isStunned;
      const wasBStunned = b.isStunned;
      if (a.statusEffects) a.statusEffects = [];
      if (b.statusEffects) b.statusEffects = [];

      const outcome = handleCombatRound(a, b, choiceA, choiceB, noop);

      totalDamageByA += outcome.player2Damage || 0;
      totalDamageByB += outcome.player1Damage || 0;
      totalHealA += outcome.player1Heal || 0;
      totalHealB += outcome.player2Heal || 0;

      if (outcome.abilityUsed) {
        if (outcome.abilityUsed.side === 'p1') totalAbilityProcsA++;
        else totalAbilityProcsB++;
      }

      // Clear stun after the round (same as Game.js logic)
      if (wasAStunned) a.isStunned = false;
      if (wasBStunned) b.isStunned = false;

      if (outcome.haveWinner) break;
    }

    totalRounds += rounds;
    if (a.currentHealth > b.currentHealth) aWins++;
    else bWins++;
  }

  return {
    aWins,
    bWins,
    avgRounds: totalRounds / iterations,
    avgDmgPerRoundA: totalDamageByA / totalRounds,
    avgDmgPerRoundB: totalDamageByB / totalRounds,
    avgHealPerFightA: totalHealA / iterations,
    avgHealPerFightB: totalHealB / iterations,
    abilityProcRateA: totalAbilityProcsA / totalRounds,
    abilityProcRateB: totalAbilityProcsB / totalRounds,
  };
}

// ---------- CLI args ----------

const args = process.argv.slice(2);
let creatureCount = 5;
let iterations = 200;

let outName = null;
let useElements = false;
let useTuned = false;
let useRework = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--all') creatureCount = creatures.length;
  else if (args[i] === '-n' && args[i + 1]) creatureCount = parseInt(args[++i], 10);
  else if (args[i] === '-i' && args[i + 1]) iterations = parseInt(args[++i], 10);
  else if (args[i] === '--out' && args[i + 1]) outName = args[++i];
  else if (args[i] === '--elements') useElements = true;
  else if (args[i] === '--mult' && args[i + 1]) { ADVANTAGE_MULT = parseFloat(args[++i]); DISADVANTAGE_MULT = Math.round((2 - ADVANTAGE_MULT) * 100) / 100; }
  else if (args[i] === '--tuned') useTuned = true;
  else if (args[i] === '--rework') useRework = true;
}

creatureCount = Math.min(creatureCount, creatures.length);
const roster = creatures.slice(0, creatureCount);

// ---------- build engine (with optional element patching) ----------

if (useElements) {
  // Inject element multiplier after base damage calculation in combatRound
  engineClean = engineClean.replace(
    'let damage = Math.max(0, playerAttack - defenseMod);',
    `let damage = Math.max(0, playerAttack - defenseMod);
    damage = Math.round(damage * getElementMultiplier(attacker, defender));`
  );
}

// Inject Ranged boosts when rework is active: initiative bonus (+10), ability trigger 60%
if (useRework) {
  engineClean = engineClean.replace(
    "player1card.stats.agility * 0.4 + player1card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21)",
    "(player1card.stats.agility * 0.4 + player1card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21) + (player1Choice === 'Ranged' ? 10 : 0))"
  );
  engineClean = engineClean.replace(
    "player2card.stats.agility * 0.4 + player2card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21)",
    "(player2card.stats.agility * 0.4 + player2card.stats.intelligence * 0.6 + Math.floor(Math.random() * 21) + (player2Choice === 'Ranged' ? 10 : 0))"
  );
  engineClean = engineClean.replace(
    '!attacker.isStunned && Math.random() < 0.5',
    '!attacker.isStunned && Math.random() < (combatChoice === "Ranged" ? 0.6 : 0.5)'
  );
}

// Inject lifesteal handling after damage is applied in combatRound
engineClean = engineClean.replace(
  'const actualDamage = Math.min(damage, defender.currentHealth);\n  defender.currentHealth -= damage;',
  `const actualDamage = Math.min(damage, defender.currentHealth);
  defender.currentHealth -= damage;

  // Lifesteal: heal attacker based on damage dealt
  if (abilityUsed && abilityEffects[abilityUsed]?.lifesteal && actualDamage > 0) {
    const lsHeal = Math.round(actualDamage * abilityEffects[abilityUsed].lifesteal);
    const actualHeal = Math.min(lsHeal, attacker.maxHealth - attacker.currentHealth);
    if (actualHeal > 0) {
      attacker.currentHealth += actualHeal;
      heal += actualHeal;
      logFn(attacker.name + ' drains ' + actualHeal + ' HP!', 'heal');
    }
  }
  // Self-bless: apply blessed to attacker
  if (abilityUsed && abilityEffects[abilityUsed]?.selfBless) {
    if (!attacker.statusEffects) attacker.statusEffects = [];
    if (!attacker.statusEffects.includes('blessed')) {
      attacker.statusEffects.push('blessed');
    }
  }`
);

engine = buildEngine(engineClean);
handleCombatRound = engine.handleCombatRound;
processDoTDamage = engine.processDoTDamage;

// ---------- ability tuning ----------

if (useTuned) {
  const ae = engine.abilityEffects;

  // --- Damage abilities ---
  // Tier 1: has DoT/status attached — moderate base bump
  ae[ABILITIES.FIRE_BREATH].value  = 15;   // was 10 (has burning DoT)
  ae[ABILITIES.BURN].value         = 15;   // was 10 (has burning DoT)
  ae[ABILITIES.POISON_BITE].value  = 15;   // was 10 (has poisoned DoT)
  ae[ABILITIES.WATER_BLAST].value  = 15;   // was 10 (has freeze + stun)
  ae[ABILITIES.TIDAL_WAVE].value   = 15;   // was 10 (has freeze + stun)
  ae[ABILITIES.CRUSHING_GRIP].value = 15;  // was 10 (has constricted DoT)
  ae[ABILITIES.SOUL_REAP].value    = 15;   // was 10 (applies cursed)
  ae[ABILITIES.DARK_SPELL].value   = 15;   // was 10 (applies cursed)
  ae[ABILITIES.NECROTIC_BLAST].value = 15; // was 10 (applies cursed)
  ae[ABILITIES.DARK_BLAST].value   = 15;   // was 10 (applies cursed)
  ae[ABILITIES.LIGHT_BEAM].value   = 15;   // was 10 (applies blessed)
  ae[ABILITIES.NATURES_WRATH].value = 18;  // was 12 (has poisoned DoT)

  // Tier 2: pure damage, no DoT — bigger bump so they compete
  ae[ABILITIES.MANA_BOLT].value      = 20; // was 10
  ae[ABILITIES.PRECISION_SHOT].value = 20; // was 10
  ae[ABILITIES.SPEAR_THRUST].value   = 20; // was 10
  ae[ABILITIES.RANGED_ATTACK].value  = 20; // was 10
  ae[ABILITIES.ROCK_THROW].value     = 20; // was 10
  ae[ABILITIES.GUST_OF_WIND].value   = 20; // was 10
  ae[ABILITIES.CHAIN_LIGHTNING].value = 18; // was 8
  ae[ABILITIES.THUNDER_STRIKE].value  = 22; // was 12

  // Tier 3: heavy hitters
  ae[ABILITIES.BERSERK].value    = 25;  // was 15
  ae[ABILITIES.BACKSTAB].value   = 25;  // was 15 (also has bleed DoT)
  ae[ABILITIES.CAST_SPELL].value = 30;  // was 20

  // Tier 4: weak cursed flavour ability
  ae[ABILITIES.CURSE].value = 10;       // was 5

  // --- Heal abilities (nerfed ~15-20% from previous tuned values) ---
  ae[ABILITIES.HEAL].value          = 28;  // was 35 tuned / 30 original
  ae[ABILITIES.REGENERATE].value    = 22;  // was 30 tuned / 25 original
  ae[ABILITIES.RAISE_DEAD].value    = 20;  // was 25 tuned / 15 original
  ae[ABILITIES.RALLY].value         = 15;  // was 20 tuned / 10 original
  ae[ABILITIES.SUMMON_UNDEAD].value = 15;  // was 20 tuned / 10 original
  ae[ABILITIES.SUMMON_MINION].value = 15;  // was 20 tuned / 10 original

  // --- Defense abilities ---
  ae[ABILITIES.SHIELD_WALL].value = 20;  // was 15
  ae[ABILITIES.FORTIFY].value     = 18;  // was 12
  ae[ABILITIES.CAMOUFLAGE].value  = 15;  // was 8
  ae[ABILITIES.FLY].value         = 12;  // was 5
  ae[ABILITIES.EVASION].value     = 12;  // was 5
  ae[ABILITIES.TELEPORT].value    = 12;  // was 5
  ae[ABILITIES.SHADOW_STEP].value = 12;  // was 5
  ae[ABILITIES.COMMAND].value     = 12;  // was 5

  console.log('(Tuned ability values active)');
}

// ---------- ability reworks for bottom-tier ----------

if (useRework) {
  const ae = engine.abilityEffects;

  // --- New ability types ---
  // Lifesteal: damage ability that heals attacker for a portion of damage dealt
  // Implemented as damage + heal combo
  ae['lifesteal'] = { type: 'damage', value: 15, lifesteal: 0.4 };

  // Anti-heal: damage + removes blessed and suppresses healing for 1 round
  ae['mortal_strike'] = { type: 'damage', value: 20, statusEffect: 'wounded' };

  // Anti-stun: high burst that ignores defense modifiers partially
  ae['ambush'] = { type: 'damage', value: 30 };

  // First Strike: massive single hit (glass cannon payoff)
  ae['overcharge'] = { type: 'damage', value: 40 };

  // Screech: stun + damage (weaker than pure stun to compensate)
  ae['screech'] = { type: 'stun', value: 0, statusEffect: 'cursed' };

  // Siphon: damage + heal self
  ae['siphon'] = { type: 'damage', value: 15, lifesteal: 0.3 };

  // Ensnare: defensive + applies poisoned DoT
  ae['ensnare'] = { type: 'defense', value: 10, statusEffect: 'poisoned', dot: { damage: 4, duration: 2 } };

  // Marked Shot: precision hit that curses the target (they take +10% after)
  ae['marked_shot'] = { type: 'damage', value: 25, statusEffect: 'cursed' };

  // Double Shot: two rapid arrows — pure burst
  ae['double_shot'] = { type: 'damage', value: 30 };

  // Flame Surge: fire burst + burn DoT
  ae['flame_surge'] = { type: 'damage', value: 25, statusEffect: 'burning', dot: { damage: 5, duration: 2 } };

  // Divebomb: massive aerial strike
  ae['divebomb'] = { type: 'damage', value: 35 };

  // Holy Smite: paladin offensive + blessed self-buff
  // (implemented as damage — blessed applied to attacker via special handling below)
  ae['holy_smite'] = { type: 'damage', value: 25, selfBless: true };

  // --- Creature reworks ---
  // Each rework: swap a weak/redundant ability for something impactful

  const byName = Object.fromEntries(creatures.map(c => [c.name, c]));

  // Harpy (9.3%): Poison Bite doesn't fit air. Replace with Screech (stun+cursed) — harassing flier
  byName['Harpy'].abilities = ['screech', ABILITIES.FLY];

  // Human Ranger (16.5%): Good burst abilities but too fragile. HP bump + keep marked_shot + ambush
  byName['Human Ranger'].abilities = ['marked_shot', 'ambush'];
  byName['Human Ranger'].currentHealth = 340;
  byName['Human Ranger'].maxHealth = 340;

  // Ball Lightning (10.3%): Teleport wastes its glass cannon identity. Replace with Overcharge — go big or go home
  byName['Ball Lightning'].abilities = ['overcharge', ABILITIES.THUNDER_STRIKE];

  // High Elf Spearman (13.4%): Lifesteal + Shield Wall = no damage output. Holy Smite + Lifesteal — offensive sustain
  byName['High Elf Spearman'].abilities = ['holy_smite', 'lifesteal'];
  byName['High Elf Spearman'].currentHealth = 340;
  byName['High Elf Spearman'].maxHealth = 340;

  // Salamander (11.9%): Redundant fire DoTs + no sustain. Flame Surge + Siphon — burst with drain
  byName['Salamander'].abilities = ['flame_surge', 'siphon'];
  byName['Salamander'].currentHealth = 330;
  byName['Salamander'].maxHealth = 330;

  // Elf Archer (12.9%): Needs burst to justify low HP. Double Shot — rapid fire
  byName['Elf Archer'].abilities = [ABILITIES.PRECISION_SHOT, 'double_shot'];

  // Shadow Assassin (18%): Needs bigger burst payoff. Replace Shadow Step with Ambush
  byName['Shadow Assassin'].abilities = [ABILITIES.BACKSTAB, 'ambush'];

  // Wind Dancer (18.9%): Pure evasion doesn't work. Add Siphon — hit and drain
  byName['Wind Dancer'].abilities = ['siphon', ABILITIES.EVASION];

  // Sylph (19%): Too weak offensively. Replace Gust of Wind with Siphon
  byName['Sylph'].abilities = [ABILITIES.HEAL, 'siphon'];

  // Siren (21.4%): Cast Spell is good, Evasion is useless. Replace Evasion with Screech — mesmerising voice
  byName['Siren'].abilities = [ABILITIES.CAST_SPELL, 'screech'];

  // Dire Wolf (22.3%): Camouflage is weak. Replace with Lifesteal — savage predator
  byName['Dire Wolf'].abilities = [ABILITIES.BERSERK, 'lifesteal'];

  // Noble Lord (26.3%): Command + Rally are both weak. Replace Command with Mortal Strike — battlefield commander
  byName['Noble Lord'].abilities = ['mortal_strike', ABILITIES.RALLY];

  // Volt Serpent (30.3%): Chain Lightning is weak. Replace with Siphon — constrict and drain
  byName['Volt Serpent'].abilities = [ABILITIES.CONSTRICT, 'siphon'];

  // Storm Griffin (33.3%): Precision Shot + Fly are generic. Replace Fly with Ambush — diving striker
  byName['Storm Griffin'].abilities = [ABILITIES.PRECISION_SHOT, 'ambush'];

  // Wizard (34.6%): Cast Spell good, Teleport bad. Replace Teleport with Siphon
  byName['Wizard'].abilities = [ABILITIES.CAST_SPELL, 'siphon'];

  // Paladin (36.8%): 400 HP tank that can't kill. Replace Fortify with Lifesteal — holy warrior sustain
  byName['Paladin'].abilities = ['lifesteal', ABILITIES.LIGHT_BEAM];

  // Thunderbird (36.1%): Fly + Chain Lightning = boring. Replace Fly with Divebomb — aerial predator
  byName['Thunderbird'].abilities = ['divebomb', ABILITIES.CHAIN_LIGHTNING];

  // --- HP and stat adjustments ---
  // Celestial Dragon: nerf HP 550→500, defense 90→80, magic 110→100
  byName['Celestial Dragon'].currentHealth = 500;
  byName['Celestial Dragon'].maxHealth = 500;
  byName['Celestial Dragon'].stats.defense = 80;
  byName['Celestial Dragon'].stats.magic = 100;

  // Noble Lord: stats too mediocre for Melee. Buff to a proper commander
  byName['Noble Lord'].stats.strength = 88;
  byName['Noble Lord'].stats.defense = 78;
  byName['Noble Lord'].stats.intelligence = 82;
  byName['Noble Lord'].currentHealth = 370;
  byName['Noble Lord'].maxHealth = 370;

  // Sylph (260 → 310): too fragile for any ability to matter
  byName['Sylph'].currentHealth = 310;
  byName['Sylph'].maxHealth = 310;

  // Wind Dancer (270 → 325): same problem
  byName['Wind Dancer'].currentHealth = 325;
  byName['Wind Dancer'].maxHealth = 325;

  // Ball Lightning (220 → 270): needs to survive one more round for Overcharge to land
  byName['Ball Lightning'].currentHealth = 270;
  byName['Ball Lightning'].maxHealth = 270;

  // --- Single-ability creatures: give them a second ability ---
  // Dwarf Berserker: pure damage, add Rock Throw as a secondary
  byName['Dwarf Berserker'].abilities = [ABILITIES.BERSERK, ABILITIES.ROCK_THROW];

  // Lightning Elemental: swap agi/magic so it becomes Magic user, add Chain Lightning
  byName['Lightning Elemental'].stats.agility = 85;
  byName['Lightning Elemental'].stats.magic = 90;
  byName['Lightning Elemental'].abilities = [ABILITIES.STUN, ABILITIES.CHAIN_LIGHTNING];

  // --- Ranged defense bump (+10) ---
  // Ranged creatures have avg 49 defense vs Melee's 79 — too wide a gap
  for (const c of creatures) {
    const bestStat = Math.max(c.stats.strength, c.stats.agility, c.stats.magic);
    if (bestStat === c.stats.agility) {
      c.stats.defense += 10;
    }
  }

  console.log('(Ability reworks active)');
}

// ---------- run ----------

console.log(`\nCombat Simulator`);
console.log(`Creatures: ${creatureCount} | Pairs: ${creatureCount * (creatureCount - 1) / 2} | Iterations/pair: ${iterations} | Elements: ${useElements ? ADVANTAGE_MULT + '/' + DISADVANTAGE_MULT : 'OFF'} | Tuned: ${useTuned ? 'ON' : 'OFF'} | Rework: ${useRework ? 'ON' : 'OFF'}\n`);

// Per-creature aggregate stats
const creatureStats = {};
for (const c of roster) {
  creatureStats[c.name] = {
    wins: 0, losses: 0, fights: 0,
    totalDmgDealt: 0, totalDmgTaken: 0,
    totalRounds: 0, totalHeal: 0,
  };
}

// Matchup table
const matchups = [];

for (let i = 0; i < roster.length; i++) {
  for (let j = i + 1; j < roster.length; j++) {
    const a = roster[i];
    const b = roster[j];
    const result = simulateFight(a, b, iterations);

    matchups.push({
      a: a.name,
      b: b.name,
      aHP: a.maxHealth,
      bHP: b.maxHealth,
      aWinRate: (result.aWins / iterations * 100).toFixed(1),
      bWinRate: (result.bWins / iterations * 100).toFixed(1),
      avgRounds: result.avgRounds.toFixed(1),
      avgDmgA: result.avgDmgPerRoundA.toFixed(1),
      avgDmgB: result.avgDmgPerRoundB.toFixed(1),
    });

    // Aggregate
    const sa = creatureStats[a.name];
    const sb = creatureStats[b.name];
    sa.wins += result.aWins; sa.losses += result.bWins; sa.fights += iterations;
    sb.wins += result.bWins; sb.losses += result.aWins; sb.fights += iterations;
    sa.totalDmgDealt += result.avgDmgPerRoundA * result.avgRounds * iterations;
    sb.totalDmgDealt += result.avgDmgPerRoundB * result.avgRounds * iterations;
    sa.totalDmgTaken += result.avgDmgPerRoundB * result.avgRounds * iterations;
    sb.totalDmgTaken += result.avgDmgPerRoundA * result.avgRounds * iterations;
    sa.totalRounds += result.avgRounds * iterations;
    sb.totalRounds += result.avgRounds * iterations;
    sa.totalHeal += result.avgHealPerFightA * iterations;
    sb.totalHeal += result.avgHealPerFightB * iterations;
  }
}

// ---------- output ----------

const lines = [];
const log = (msg = '') => { lines.push(msg); console.log(msg); };

// Matchup details
log('=== MATCHUP DETAILS ===');
log('');
log(
  'Creature A'.padEnd(20) +
  'Creature B'.padEnd(20) +
  'A Win%'.padEnd(9) +
  'B Win%'.padEnd(9) +
  'Avg Rnd'.padEnd(9) +
  'A Dmg/Rnd'.padEnd(11) +
  'B Dmg/Rnd'.padEnd(11)
);
log('-'.repeat(89));

for (const m of matchups) {
  log(
    m.a.padEnd(20) +
    m.b.padEnd(20) +
    `${m.aWinRate}%`.padEnd(9) +
    `${m.bWinRate}%`.padEnd(9) +
    m.avgRounds.padEnd(9) +
    m.avgDmgA.padEnd(11) +
    m.avgDmgB.padEnd(11)
  );
}

// Creature leaderboard
log('');
log('=== CREATURE LEADERBOARD ===');
log('');
log(
  'Creature'.padEnd(20) +
  'HP'.padEnd(6) +
  'Win%'.padEnd(9) +
  'Avg Dmg/Rnd'.padEnd(13) +
  'Avg Taken/Rnd'.padEnd(15) +
  'Avg Heal/Fight'.padEnd(16) +
  'Best Style'.padEnd(12)
);
log('-'.repeat(91));

const leaderboard = Object.entries(creatureStats)
  .map(([name, s]) => ({
    name,
    hp: roster.find(c => c.name === name).maxHealth,
    winRate: (s.wins / s.fights * 100).toFixed(1),
    avgDmg: (s.totalDmgDealt / s.totalRounds).toFixed(1),
    avgTaken: (s.totalDmgTaken / s.totalRounds).toFixed(1),
    avgHeal: (s.totalHeal / s.fights).toFixed(1),
    bestStyle: bestChoice(roster.find(c => c.name === name)),
  }))
  .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

for (const c of leaderboard) {
  log(
    c.name.padEnd(20) +
    String(c.hp).padEnd(6) +
    `${c.winRate}%`.padEnd(9) +
    c.avgDmg.padEnd(13) +
    c.avgTaken.padEnd(15) +
    c.avgHeal.padEnd(16) +
    c.bestStyle.padEnd(12)
  );
}

// Summary stats
const allDmgPerRound = matchups.map(m => (parseFloat(m.avgDmgA) + parseFloat(m.avgDmgB)) / 2);
const avgDmg = (allDmgPerRound.reduce((a, b) => a + b, 0) / allDmgPerRound.length).toFixed(1);
const avgRounds = (matchups.reduce((a, m) => a + parseFloat(m.avgRounds), 0) / matchups.length).toFixed(1);
const avgHP = (roster.reduce((a, c) => a + c.maxHealth, 0) / roster.length).toFixed(0);

log('');
log('=== SUMMARY ===');
log('');
log(`Average creature HP:        ${avgHP}`);
log(`Average damage/round:       ${avgDmg}`);
log(`Average rounds per fight:   ${avgRounds}`);
log(`Damage as % of avg HP:      ${(parseFloat(avgDmg) / parseFloat(avgHP) * 100).toFixed(1)}%`);
log('');

// ---------- save to file ----------

if (outName) {
  const resultsDir = resolve(__dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });

  // Human-readable report
  const txtPath = resolve(resultsDir, `${outName}.txt`);
  writeFileSync(txtPath, lines.join('\n'), 'utf-8');

  // Machine-readable JSON
  const jsonPath = resolve(resultsDir, `${outName}.json`);
  const jsonData = {
    meta: { creatureCount, iterations, date: new Date().toISOString() },
    summary: {
      avgHP: parseFloat(avgHP),
      avgDmgPerRound: parseFloat(avgDmg),
      avgRoundsPerFight: parseFloat(avgRounds),
      dmgAsPercentHP: parseFloat((parseFloat(avgDmg) / parseFloat(avgHP) * 100).toFixed(1)),
    },
    leaderboard: leaderboard.map(c => ({
      name: c.name, hp: c.hp,
      winRate: parseFloat(c.winRate),
      avgDmgPerRound: parseFloat(c.avgDmg),
      avgTakenPerRound: parseFloat(c.avgTaken),
      avgHealPerFight: parseFloat(c.avgHeal),
      bestStyle: c.bestStyle,
    })),
    matchups,
  };
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

  log(`Saved: ${txtPath}`);
  log(`Saved: ${jsonPath}`);
}
