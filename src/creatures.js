export const ABILITIES = {
  FIRE_BREATH: 'fire_breath',
  HEAL: 'heal',
  BERSERK: 'berserk',
  SHIELD_WALL: 'shield_wall',
  STUN: 'stun',
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
    abilities: [ABILITIES.FIRE_BREATH, 'fly'],
    currentHealth: 500,
    maxHealth: 500,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Orc',
    element: 'earth',
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
    element: 'dark',
    image: 'wizard.webp',
    stats: {
      strength: 50,
      agility: 65,
      intelligence: 90,
      defense: 45,
      magic: 95
    },
    abilities: ['cast_spell', 'teleport'],
    currentHealth: 300,
    maxHealth: 300,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Elf Archer',
    element: 'air',
    image: 'elf_archer.webp',
    stats: {
      strength: 60,
      agility: 90,
      intelligence: 70,
      defense: 50,
      magic: 60
    },
    abilities: ['precision_shot', 'evasion'],
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
    abilities: ['soul_reap', ABILITIES.STUN],
    currentHealth: 450,
    maxHealth: 450,
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
      defense: 60,
      magic: 90
    },
    abilities: [ABILITIES.HEAL, ABILITIES.STUN],
    currentHealth: 350,
    maxHealth: 350,
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
    abilities: [ABILITIES.BERSERK],
    currentHealth: 420,
    maxHealth: 420,
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
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Sorceress',
    element: 'dark',
    image: 'sorceress.webp',
    stats: {
      strength: 55,
      agility: 60,
      intelligence: 95,
      defense: 50,
      magic: 100
    },
    abilities: ['mana_bolt', 'curse'],
    currentHealth: 320,
    maxHealth: 320,
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
    abilities: [ABILITIES.SHIELD_WALL, 'light_beam'],
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
    abilities: ['summon_undead', 'dark_spell'],
    currentHealth: 290,
    maxHealth: 290,
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
      defense: 40,
      magic: 50
    },
    abilities: ['backstab', 'shadow_step'],
    currentHealth: 250,
    maxHealth: 250,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Giant Spider',
    element: 'nature',
    image: 'giant_spider.webp',
    stats: {
      strength: 70,
      agility: 80,
      intelligence: 35,
      defense: 60,
      magic: 30
    },
    abilities: ['poison_bite', ABILITIES.STUN],
    currentHealth: 300,
    maxHealth: 300,
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
      defense: 90,
      magic: 110
    },
    abilities: [ABILITIES.HEAL, ABILITIES.FIRE_BREATH],
    currentHealth: 550,
    maxHealth: 550,
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
    abilities: ['raise_dead', 'necrotic_blast'],
    currentHealth: 350,
    maxHealth: 350,
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
    abilities: ['dark_blast', 'summon_minion'],
    currentHealth: 280,
    maxHealth: 280,
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
      defense: 60,
      magic: 50
    },
    abilities: ['spear_thrust', ABILITIES.SHIELD_WALL],
    currentHealth: 300,
    maxHealth: 300,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Noble Lord',
    element: 'earth',
    image: 'noble_lord.webp',
    stats: {
      strength: 80,
      agility: 55,
      intelligence: 75,
      defense: 70,
      magic: 65
    },
    abilities: ['command', 'rally'],
    currentHealth: 330,
    maxHealth: 330,
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
      defense: 55,
      magic: 45
    },
    abilities: ['ranged_attack', 'camouflage'],
    currentHealth: 290,
    maxHealth: 290,
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
    abilities: [ABILITIES.FIRE_BREATH, 'burn'],
    currentHealth: 320,
    maxHealth: 320,
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
    abilities: ['water_blast', ABILITIES.HEAL],
    currentHealth: 300,
    maxHealth: 300,
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
    abilities: ['rock_throw', ABILITIES.SHIELD_WALL],
    currentHealth: 380,
    maxHealth: 380,
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
      defense: 40,
      magic: 80
    },
    abilities: ['gust_of_wind', ABILITIES.STUN],
    currentHealth: 290,
    maxHealth: 290,
    statusEffects: [],
    isStunned: false
  },
  {
    name: 'Lightning Elemental',
    element: 'lightning',
    image: 'lightning_elemental.webp',
    stats: {
      strength: 65,
      agility: 90,
      intelligence: 80,
      defense: 45,
      magic: 85
    },
    abilities: [ABILITIES.STUN],
    currentHealth: 310,
    maxHealth: 310,
    statusEffects: [],
    isStunned: false
  }

// add more
];



export default creatures;
