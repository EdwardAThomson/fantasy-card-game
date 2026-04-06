export const ABILITIES = {
  FIRE_BREATH: 'fire_breath',
  HEAL: 'heal',
  BERSERK: 'berserk',
  SHIELD_WALL: 'shield_wall',
  STUN: 'stun',
  FLY: 'fly',
  CAST_SPELL: 'cast_spell',
  TELEPORT: 'teleport',
  PRECISION_SHOT: 'precision_shot',
  EVASION: 'evasion',
  SOUL_REAP: 'soul_reap',
  MANA_BOLT: 'mana_bolt',
  CURSE: 'curse',
  LIGHT_BEAM: 'light_beam',
  SUMMON_UNDEAD: 'summon_undead',
  DARK_SPELL: 'dark_spell',
  BACKSTAB: 'backstab',
  SHADOW_STEP: 'shadow_step',
  POISON_BITE: 'poison_bite',
  RAISE_DEAD: 'raise_dead',
  NECROTIC_BLAST: 'necrotic_blast',
  DARK_BLAST: 'dark_blast',
  SUMMON_MINION: 'summon_minion',
  SPEAR_THRUST: 'spear_thrust',
  COMMAND: 'command',
  RALLY: 'rally',
  RANGED_ATTACK: 'ranged_attack',
  CAMOUFLAGE: 'camouflage',
  BURN: 'burn',
  WATER_BLAST: 'water_blast',
  ROCK_THROW: 'rock_throw',
  GUST_OF_WIND: 'gust_of_wind',
  CONSTRICT: 'constrict',
  TIDAL_WAVE: 'tidal_wave',
  THUNDER_STRIKE: 'thunder_strike',
  CHAIN_LIGHTNING: 'chain_lightning',
  REGENERATE: 'regenerate',
  NATURES_WRATH: 'natures_wrath',
  FORTIFY: 'fortify',
  CRUSHING_GRIP: 'crushing_grip',
  ENTANGLE: 'entangle',
  LIFESTEAL: 'lifesteal',
  MORTAL_STRIKE: 'mortal_strike',
  AMBUSH: 'ambush',
  OVERCHARGE: 'overcharge',
  SIPHON: 'siphon',
  MARKED_SHOT: 'marked_shot',
  DOUBLE_SHOT: 'double_shot',
  FLAME_SURGE: 'flame_surge',
  DIVEBOMB: 'divebomb',
  HOLY_SMITE: 'holy_smite',
  SCREECH: 'screech',
  ENSNARE: 'ensnare',
};

const creatures = [
  {
    name: 'Dragon',
    element: 'fire',
    image: 'dragon.webp',
    stats: {
      strength: 95,
      agility: 70,
      intelligence: 60,
      defense: 85,
      magic: 80
    },
    abilities: [ABILITIES.FIRE_BREATH, ABILITIES.FLY],
    currentHealth: 500,
    maxHealth: 500,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Orc',
    element: 'dark',
    image: 'orc.webp',
    stats: {
      strength: 85,
      agility: 55,
      intelligence: 40,
      defense: 75,
      magic: 30
    },
    abilities: [ABILITIES.BERSERK, ABILITIES.SHIELD_WALL],
    currentHealth: 400,
    maxHealth: 400,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Wizard',
    element: 'air',
    image: 'wizard.webp',
    stats: {
      strength: 50,
      agility: 65,
      intelligence: 90,
      defense: 45,
      magic: 95
    },
    abilities: [ABILITIES.CAST_SPELL, ABILITIES.SIPHON],
    currentHealth: 300,
    maxHealth: 300,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Elf Archer',
    element: 'nature',
    image: 'elf_archer.webp',
    stats: {
      strength: 60,
      agility: 90,
      intelligence: 70,
      defense: 60,
      magic: 60
    },
    abilities: [ABILITIES.PRECISION_SHOT, ABILITIES.DOUBLE_SHOT],
    currentHealth: 280,
    maxHealth: 280,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Undead Knight',
    element: 'dark',
    image: 'undead_knight.webp',
    stats: {
      strength: 80,
      agility: 50,
      intelligence: 45,
      defense: 70,
      magic: 55
    },
    abilities: [ABILITIES.SOUL_REAP, ABILITIES.STUN],
    currentHealth: 450,
    maxHealth: 450,
    immunities: ['bleeding', 'poisoned'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Forest Spirit',
    element: 'nature',
    image: 'forest_spirit.webp',
    stats: {
      strength: 40,
      agility: 75,
      intelligence: 85,
      defense: 65,
      magic: 95
    },
    abilities: [ABILITIES.HEAL, ABILITIES.ENTANGLE],
    currentHealth: 360,
    maxHealth: 360,
    immunities: ['poisoned'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Dwarf Berserker',
    element: 'earth',
    image: 'dwarf_berserker.webp',
    stats: {
      strength: 90,
      agility: 40,
      intelligence: 50,
      defense: 80,
      magic: 30
    },
    abilities: [ABILITIES.BERSERK, ABILITIES.ROCK_THROW],
    currentHealth: 420,
    maxHealth: 420,
    immunities: ['bleeding'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Phoenix',
    element: 'fire',
    image: 'phoenix.webp',
    stats: {
      strength: 70,
      agility: 85,
      intelligence: 80,
      defense: 65,
      magic: 100
    },
    abilities: [ABILITIES.HEAL, ABILITIES.FIRE_BREATH],
    currentHealth: 380,
    maxHealth: 380,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Troll',
    element: 'earth',
    image: 'troll.webp',
    stats: {
      strength: 85,
      agility: 45,
      intelligence: 30,
      defense: 75,
      magic: 25
    },
    abilities: [ABILITIES.HEAL, ABILITIES.STUN],
    currentHealth: 430,
    maxHealth: 430,
    immunities: ['bleeding'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Sorceress',
    element: 'lightning',
    image: 'sorceress.webp',
    stats: {
      strength: 55,
      agility: 60,
      intelligence: 95,
      defense: 50,
      magic: 100
    },
    abilities: [ABILITIES.MANA_BOLT, ABILITIES.CURSE],
    currentHealth: 320,
    maxHealth: 320,
    immunities: ['cursed'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Minotaur',
    element: 'earth',
    image: 'minotaur.webp',
    stats: {
      strength: 88,
      agility: 55,
      intelligence: 40,
      defense: 80,
      magic: 35
    },
    abilities: [ABILITIES.BERSERK, ABILITIES.STUN],
    currentHealth: 410,
    maxHealth: 410,
    immunities: ['bleeding'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Elemental Guardian',
    element: 'light',
    image: 'elemental_guardian.webp',
    stats: {
      strength: 75,
      agility: 70,
      intelligence: 80,
      defense: 85,
      magic: 90
    },
    abilities: [ABILITIES.SHIELD_WALL, ABILITIES.LIGHT_BEAM],
    currentHealth: 400,
    maxHealth: 400,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Necromancer',
    element: 'dark',
    image: 'necromancer.webp',
    stats: {
      strength: 40,
      agility: 50,
      intelligence: 95,
      defense: 45,
      magic: 100
    },
    abilities: [ABILITIES.SUMMON_UNDEAD, ABILITIES.DARK_SPELL],
    currentHealth: 290,
    maxHealth: 290,
    immunities: ['cursed'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Shadow Assassin',
    element: 'dark',
    image: 'shadow_assassin.webp',
    stats: {
      strength: 65,
      agility: 95,
      intelligence: 60,
      defense: 50,
      magic: 50
    },
    abilities: [ABILITIES.BACKSTAB, ABILITIES.AMBUSH],
    currentHealth: 250,
    maxHealth: 250,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Giant Spider',
    element: 'dark',
    image: 'giant_spider.webp',
    stats: {
      strength: 78,
      agility: 80,
      intelligence: 35,
      defense: 75,
      magic: 30
    },
    abilities: [ABILITIES.POISON_BITE, ABILITIES.ENTANGLE],
    currentHealth: 320,
    maxHealth: 320,
    resistances: { poisoned: 0.5 },
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Celestial Dragon',
    element: 'light',
    image: 'celestial_dragon.webp',
    stats: {
      strength: 100,
      agility: 80,
      intelligence: 85,
      defense: 80,
      magic: 100
    },
    abilities: [ABILITIES.FIRE_BREATH, ABILITIES.FLY],
    currentHealth: 500,
    maxHealth: 500,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Lich King',
    element: 'dark',
    image: 'lich_king.webp',
    stats: {
      strength: 60,
      agility: 50,
      intelligence: 100,
      defense: 70,
      magic: 110
    },
    abilities: [ABILITIES.RAISE_DEAD, ABILITIES.NECROTIC_BLAST],
    currentHealth: 350,
    maxHealth: 350,
    immunities: ['cursed'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Warlock',
    element: 'dark',
    image: 'warlock.webp',
    stats: {
      strength: 40,
      agility: 55,
      intelligence: 85,
      defense: 50,
      magic: 100
    },
    abilities: [ABILITIES.DARK_BLAST, ABILITIES.SUMMON_MINION],
    currentHealth: 280,
    maxHealth: 280,
    immunities: ['cursed'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'High Elf Spearman',
    element: 'light',
    image: 'high_elf_spearman.webp',
    stats: {
      strength: 70,
      agility: 75,
      intelligence: 65,
      defense: 70,
      magic: 50
    },
    abilities: [ABILITIES.HOLY_SMITE, ABILITIES.LIFESTEAL],
    currentHealth: 340,
    maxHealth: 340,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Noble Lord',
    element: 'earth',
    image: 'noble_lord.webp',
    stats: {
      strength: 88,
      agility: 55,
      intelligence: 82,
      defense: 78,
      magic: 65
    },
    abilities: [ABILITIES.MORTAL_STRIKE, ABILITIES.RALLY],
    currentHealth: 370,
    maxHealth: 370,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Human Ranger',
    element: 'earth',
    image: 'human_ranger.webp',
    stats: {
      strength: 65,
      agility: 80,
      intelligence: 60,
      defense: 65,
      magic: 45
    },
    abilities: [ABILITIES.MARKED_SHOT, ABILITIES.AMBUSH],
    currentHealth: 340,
    maxHealth: 340,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Fire Elemental',
    element: 'fire',
    image: 'fire_elemental.webp',
    stats: {
      strength: 70,
      agility: 60,
      intelligence: 80,
      defense: 40,
      magic: 95
    },
    abilities: [ABILITIES.FIRE_BREATH, ABILITIES.BURN],
    currentHealth: 320,
    maxHealth: 320,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Water Elemental',
    element: 'water',
    image: 'water_elemental.webp',
    stats: {
      strength: 60,
      agility: 65,
      intelligence: 85,
      defense: 50,
      magic: 90
  },
    abilities: [ABILITIES.WATER_BLAST, ABILITIES.HEAL],
    currentHealth: 300,
    maxHealth: 300,
    immunities: ['burning', 'frozen'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Earth Elemental',
    element: 'earth',
    image: 'earth_elemental.webp',
    stats: {
      strength: 85,
      agility: 40,
      intelligence: 50,
      defense: 90,
      magic: 70
    },
    abilities: [ABILITIES.ROCK_THROW, ABILITIES.SHIELD_WALL],
    currentHealth: 380,
    maxHealth: 380,
    immunities: ['bleeding'],
    resistances: { stun: 0.5 },
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Air Elemental',
    element: 'air',
    image: 'air_elemental.webp',
    stats: {
      strength: 50,
      agility: 95,
      intelligence: 75,
      defense: 50,
      magic: 80
    },
    abilities: [ABILITIES.GUST_OF_WIND, ABILITIES.STUN],
    currentHealth: 290,
    maxHealth: 290,
    immunities: ['bleeding'],
    resistances: { stun: 0.7 },
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Lightning Elemental',
    element: 'lightning',
    image: 'lightning_elemental.webp',
    stats: {
      strength: 65,
      agility: 85,
      intelligence: 80,
      defense: 45,
      magic: 90
    },
    abilities: [ABILITIES.STUN, ABILITIES.CHAIN_LIGHTNING],
    currentHealth: 310,
    maxHealth: 310,
    statusEffects: [],
    isStunned: false
  },

  // --- Water creatures ---
  {
    name: 'Kraken',
    element: 'water',
    image: 'kraken.webp',
    stats: {
      strength: 85,
      agility: 45,
      intelligence: 55,
      defense: 80,
      magic: 60
    },
    abilities: [ABILITIES.CONSTRICT, ABILITIES.CRUSHING_GRIP],
    currentHealth: 460,
    maxHealth: 460,
    immunities: ['constricted'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Sea Serpent',
    element: 'water',
    image: 'sea_serpent.webp',
    stats: {
      strength: 60,
      agility: 85,
      intelligence: 50,
      defense: 55,
      magic: 75
    },
    abilities: [ABILITIES.POISON_BITE, ABILITIES.TIDAL_WAVE],
    currentHealth: 320,
    maxHealth: 320,
    immunities: ['poisoned'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Tide Priestess',
    element: 'water',
    image: 'tide_priestess.webp',
    stats: {
      strength: 40,
      agility: 60,
      intelligence: 85,
      defense: 50,
      magic: 90
    },
    abilities: [ABILITIES.HEAL, ABILITIES.TIDAL_WAVE],
    currentHealth: 300,
    maxHealth: 300,
    immunities: ['frozen'],
    statusEffects: [],
    isStunned: false
  },
  // --- Lightning creatures ---
  {
    name: 'Thunder Mage',
    element: 'lightning',
    image: 'thunder_mage.webp',
    stats: {
      strength: 45,
      agility: 60,
      intelligence: 90,
      defense: 45,
      magic: 95
    },
    abilities: [ABILITIES.CHAIN_LIGHTNING, ABILITIES.STUN],
    currentHealth: 300,
    maxHealth: 300,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Storm Elemental',
    element: 'lightning',
    image: 'storm_elemental.webp',
    stats: {
      strength: 60,
      agility: 85,
      intelligence: 75,
      defense: 60,
      magic: 80
    },
    abilities: [ABILITIES.THUNDER_STRIKE, ABILITIES.GUST_OF_WIND],
    currentHealth: 330,
    maxHealth: 330,
    immunities: ['stun'],
    statusEffects: [],
    isStunned: false
  },
  // --- Air creatures ---
  {
    name: 'Storm Griffin',
    element: 'air',
    image: 'storm_griffin.webp',
    stats: {
      strength: 75,
      agility: 85,
      intelligence: 55,
      defense: 70,
      magic: 50
    },
    abilities: [ABILITIES.PRECISION_SHOT, ABILITIES.AMBUSH],
    currentHealth: 350,
    maxHealth: 350,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Wind Dancer',
    element: 'air',
    image: 'wind_dancer.webp',
    stats: {
      strength: 45,
      agility: 95,
      intelligence: 70,
      defense: 45,
      magic: 65
    },
    abilities: [ABILITIES.SIPHON, ABILITIES.EVASION],
    currentHealth: 325,
    maxHealth: 325,
    statusEffects: [],
    isStunned: false
  },
  // --- Nature creatures ---
  {
    name: 'Treant',
    element: 'nature',
    image: 'treant.webp',
    stats: {
      strength: 80,
      agility: 30,
      intelligence: 60,
      defense: 90,
      magic: 75
    },
    abilities: [ABILITIES.SHIELD_WALL, ABILITIES.REGENERATE],
    currentHealth: 460,
    maxHealth: 460,
    immunities: ['bleeding'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Druid',
    element: 'nature',
    image: 'druid.webp',
    stats: {
      strength: 45,
      agility: 55,
      intelligence: 90,
      defense: 60,
      magic: 90
    },
    abilities: [ABILITIES.HEAL, ABILITIES.NATURES_WRATH],
    currentHealth: 330,
    maxHealth: 330,
    immunities: ['poisoned'],
    statusEffects: [],
    isStunned: false
  },
  // --- Light creature ---
  {
    name: 'Paladin',
    element: 'light',
    image: 'paladin.webp',
    stats: {
      strength: 75,
      agility: 55,
      intelligence: 70,
      defense: 80,
      magic: 65
    },
    abilities: [ABILITIES.LIFESTEAL, ABILITIES.LIGHT_BEAM],
    currentHealth: 400,
    maxHealth: 400,
    statusEffects: [],
    isStunned: false
  },
  // --- Fire creature ---
  {
    name: 'Salamander',
    element: 'fire',
    image: 'salamander.webp',
    stats: {
      strength: 70,
      agility: 80,
      intelligence: 45,
      defense: 60,
      magic: 60
    },
    abilities: [ABILITIES.FLAME_SURGE, ABILITIES.SIPHON],
    currentHealth: 330,
    maxHealth: 330,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  // --- Water creature (new) ---
  {
    name: 'Siren',
    element: 'water',
    image: 'siren.webp',
    stats: {
      strength: 35,
      agility: 75,
      intelligence: 85,
      defense: 40,
      magic: 90
    },
    abilities: [ABILITIES.CAST_SPELL, ABILITIES.SCREECH],
    currentHealth: 280,
    maxHealth: 280,
    statusEffects: [],
    isStunned: false
  },
  // --- Lightning creatures (new) ---
  {
    name: 'Ball Lightning',
    element: 'lightning',
    image: 'ball_lightning.webp',
    stats: {
      strength: 30,
      agility: 90,
      intelligence: 85,
      defense: 25,
      magic: 95
    },
    abilities: [ABILITIES.OVERCHARGE, ABILITIES.THUNDER_STRIKE],
    currentHealth: 270,
    maxHealth: 270,
    immunities: ['stun'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Thunderbird',
    element: 'lightning',
    image: 'thunderbird.webp',
    stats: {
      strength: 80,
      agility: 70,
      intelligence: 60,
      defense: 75,
      magic: 70
    },
    abilities: [ABILITIES.DIVEBOMB, ABILITIES.CHAIN_LIGHTNING],
    currentHealth: 400,
    maxHealth: 400,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Volt Serpent',
    element: 'lightning',
    image: 'volt_serpent.webp',
    stats: {
      strength: 70,
      agility: 75,
      intelligence: 55,
      defense: 65,
      magic: 70
    },
    abilities: [ABILITIES.CONSTRICT, ABILITIES.SIPHON],
    currentHealth: 310,
    maxHealth: 310,
    statusEffects: [],
    isStunned: false
  },
  // --- Fire creatures (new) ---
  {
    name: 'Inferno Djinn',
    element: 'fire',
    image: 'inferno_djinn.webp',
    stats: {
      strength: 45,
      agility: 70,
      intelligence: 90,
      defense: 45,
      magic: 95
    },
    abilities: [ABILITIES.CAST_SPELL, ABILITIES.BURN],
    currentHealth: 290,
    maxHealth: 290,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Magma Golem',
    element: 'fire',
    image: 'magma_golem.webp',
    stats: {
      strength: 85,
      agility: 25,
      intelligence: 35,
      defense: 90,
      magic: 55
    },
    abilities: [ABILITIES.SHIELD_WALL, ABILITIES.FIRE_BREATH],
    currentHealth: 470,
    maxHealth: 470,
    immunities: ['burning'],
    statusEffects: [],
    isStunned: false
  },
  // --- Air creatures (new) ---
  {
    name: 'Sylph',
    element: 'air',
    image: 'sylph.webp',
    stats: {
      strength: 35,
      agility: 80,
      intelligence: 80,
      defense: 40,
      magic: 85
    },
    abilities: [ABILITIES.HEAL, ABILITIES.SIPHON],
    currentHealth: 310,
    maxHealth: 310,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Harpy',
    element: 'air',
    image: 'harpy.webp',
    stats: {
      strength: 65,
      agility: 90,
      intelligence: 45,
      defense: 50,
      magic: 50
    },
    abilities: [ABILITIES.SCREECH, ABILITIES.FLY],
    currentHealth: 280,
    maxHealth: 280,
    statusEffects: [],
    isStunned: false
  },
  // --- Nature creatures (new) ---
  {
    name: 'Briar Shaman',
    element: 'nature',
    image: 'briar_shaman.webp',
    stats: {
      strength: 40,
      agility: 45,
      intelligence: 85,
      defense: 60,
      magic: 90
    },
    abilities: [ABILITIES.NATURES_WRATH, ABILITIES.HEAL],
    currentHealth: 310,
    maxHealth: 310,
    immunities: ['poisoned'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Dire Wolf',
    element: 'nature',
    image: 'dire_wolf.webp',
    stats: {
      strength: 90,
      agility: 88,
      intelligence: 35,
      defense: 55,
      magic: 25
    },
    abilities: [ABILITIES.BERSERK, ABILITIES.LIFESTEAL],
    currentHealth: 340,
    maxHealth: 340,
    statusEffects: [],
    isStunned: false
  },
  // --- Light creatures (new) ---
  {
    name: 'Seraph',
    element: 'light',
    image: 'seraph.webp',
    stats: {
      strength: 50,
      agility: 65,
      intelligence: 90,
      defense: 60,
      magic: 95
    },
    abilities: [ABILITIES.HEAL, ABILITIES.LIGHT_BEAM],
    currentHealth: 340,
    maxHealth: 340,
    immunities: ['cursed'],
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Templar',
    element: 'light',
    image: 'templar.webp',
    stats: {
      strength: 70,
      agility: 50,
      intelligence: 65,
      defense: 85,
      magic: 60
    },
    abilities: [ABILITIES.STUN, ABILITIES.FORTIFY],
    currentHealth: 380,
    maxHealth: 380,
    statusEffects: [],
    isStunned: false
  },
  // --- Ice creature ---
  {
    name: 'Frost Wyrm',
    element: 'water',
    image: 'frost_wyrm.webp',
    stats: {
      strength: 75,
      agility: 50,
      intelligence: 70,
      defense: 65,
      magic: 85
    },
    abilities: [ABILITIES.WATER_BLAST, ABILITIES.TIDAL_WAVE],
    currentHealth: 400,
    maxHealth: 400,
    immunities: ['frozen'],
    statusEffects: [],
    isStunned: false
  },
];



export default creatures;
