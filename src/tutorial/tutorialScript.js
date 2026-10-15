import creatures from '../creatures';

// The guided first fight. Everything that makes the tutorial "scripted" lives
// here: the decks, the opponent's moves, the RNG seed and the steps.
//
// Step fields:
//   target   CSS selector to spotlight (null = centred card, no spotlight)
//   allow    selectors the player may click; anything else is swallowed.
//            Omitted = the target only. [] = nothing (read-and-continue steps).
//            null = everything (free play).
//   advance  'next' (Next button) or { event, match? } where event is one of
//            cardSelected | styleSelected | roundResolved | gameOver.
//   dim      false to skip the dark backdrop.
//   title / body  strings, or functions of the tutorial context
//            ({ lastRound, gameOver }).

export const t = (name) => `[data-tutorial="${name}"]`;
const card = (name, part) => (part ? `${t(`card-${name}`)} ${t(`card-${part}`)}` : t(`card-${name}`));

const pick = (name, hpScale = 1) => {
  const base = creatures.find(c => c.name === name);
  const copy = JSON.parse(JSON.stringify(base));
  copy.maxHealth = Math.round(copy.maxHealth * hpScale);
  copy.currentHealth = copy.maxHealth;
  return copy;
};

// Opponent creatures are weakened so the whole fight lasts a handful of rounds.
const OPPONENT_HP_SCALE = 0.35;

export const buildTutorialDecks = () => ({
  // One creature per combat style, so each style gets a natural showcase.
  player: [pick('Water Elemental'), pick('Dire Wolf'), pick('Elf Archer')],
  opponent: [
    pick('Fire Elemental', OPPONENT_HP_SCALE),
    pick('Troll', OPPONENT_HP_SCALE),
    pick('Harpy', OPPONENT_HP_SCALE),
  ],
});

// The opponent leads with these, in order, moving on when one falls.
// It commits before the player does, so the player can counter-pick.
export const OPPONENT_PLAN = {
  'Fire Elemental': 'Magic',
  Troll: 'Melee',
  Harpy: 'Ranged',
};

export const TUTORIAL_SEED = 20261015;

const roundSummary = ({ lastRound }) => {
  if (!lastRound) return '';
  const parts = [];
  if (lastRound.p1Multiplier > 1) {
    parts.push(`Water beats Fire, so your hits landed at ${Math.round(lastRound.p1Multiplier * 100)}% and theirs at ${Math.round(lastRound.p2Multiplier * 100)}%.`);
  }
  parts.push('The numbers that flew off the cards are the damage each side took.');
  if (lastRound.abilityUsed) {
    parts.push(`${lastRound.abilityUsed.cardName} also triggered a special ability.`);
  }
  return parts.join(' ');
};

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to the arena',
    body: 'Each side brings three creatures. Defeat all of your opponent\'s creatures to win. This short battle shows you how.',
    advance: 'next',
  },
  {
    id: 'hand',
    target: t('p1-hand'),
    allow: [],
    title: 'Your creatures',
    body: 'These three are yours. Each round you send one of them into battle.',
    advance: 'next',
  },
  {
    id: 'health',
    target: card('Water Elemental', 'health'),
    allow: [],
    title: 'Health',
    body: 'When a creature\'s health reaches zero it is defeated and leaves the battle.',
    advance: 'next',
  },
  {
    id: 'stats',
    target: card('Water Elemental', 'stats'),
    allow: [],
    title: 'Stats',
    body: 'STR powers Melee, AGI powers Ranged and MAG powers Magic attacks. DEF softens hits, and AGI plus INT decide who strikes first.',
    advance: 'next',
  },
  {
    id: 'element',
    target: card('Water Elemental', 'element'),
    allow: [],
    title: 'Elements',
    body: 'Every creature has an element. A good matchup adds 15% damage and a bad one costs 15%.',
    advance: 'next',
  },
  {
    id: 'opponent',
    target: card('Fire Elemental'),
    allow: [],
    title: 'Your opponent moves first',
    body: 'They are sending in Fire Elemental. Water beats Fire, so you have the perfect answer.',
    advance: 'next',
  },
  {
    id: 'select-card',
    target: card('Water Elemental'),
    title: 'Choose your fighter',
    body: 'Tap Water Elemental to send it into battle.',
    advance: { event: 'cardSelected', match: p => p.side === 'p1' && p.name === 'Water Elemental' },
  },
  {
    id: 'select-style',
    target: t('p1-style-Magic'),
    title: 'Choose how to attack',
    body: 'Each attack button shows the stat it uses for your creature. Water Elemental\'s Magic is 90, its best, so choose Magic.',
    advance: { event: 'styleSelected', match: p => p.side === 'p1' && p.choice === 'Magic' },
  },
  {
    id: 'fight',
    target: t('fight'),
    title: 'Fight!',
    body: 'Both sides are ready. Start the round.',
    advance: { event: 'roundResolved' },
  },
  {
    id: 'result',
    target: t('p2-hand'),
    allow: [],
    title: 'First blood',
    body: roundSummary,
    advance: 'next',
  },
  {
    id: 'log',
    target: `${t('combat-log')}, ${t('combat-log-toggle')}`,
    allow: [],
    title: 'Combat log',
    body: 'Every roll, ability and effect is recorded here if you want the detail.',
    advance: 'next',
  },
  {
    id: 'your-turn',
    target: t('p1-area'),
    allow: [t('p1-area'), t('fight'), t('combat-log')],
    dim: false,
    compact: true,
    title: 'Your call',
    body: 'Pick any creature and style, then Fight. Play to each creature\'s best stat, and watch the elements.',
    advance: { event: 'roundResolved' },
  },
  {
    id: 'free-play',
    target: null,
    allow: null,
    dim: false,
    compact: true,
    title: 'Finish the battle',
    body: 'You\'re on your own now. Tips will appear when something new happens.',
    advance: { event: 'gameOver' },
  },
  {
    id: 'done',
    target: null,
    title: ({ gameOver }) => (gameOver?.winner === 'p1' ? 'Victory!' : 'So close'),
    body: ({ gameOver }) => (gameOver?.winner === 'p1'
      ? 'You know the basics. Try a quick match against a random deck, or build your own deck from the menu.'
      : 'That one got away, but you know the basics now. Try a quick match, or build your own deck from the menu.'),
    advance: 'finish',
  },
];

// One-off tips during free play, triggered by what happens in a round.
export const TUTORIAL_TIPS = [
  {
    id: 'ability',
    when: r => !!r.abilityUsed,
    title: 'Special ability',
    body: 'Each attack has a 50% chance (60% with Ranged) to trigger one of the creature\'s abilities: bonus damage, healing, shields or status effects.',
  },
  {
    id: 'status',
    when: r => r.newStatuses.length > 0,
    title: 'Status effects',
    body: 'Badges on a card show effects like Burning or Poisoned. Damage over time hits at the start of each round.',
  },
  {
    id: 'stun',
    when: r => r.stunned,
    title: 'Stunned',
    body: 'A stunned creature skips its next attack.',
  },
  {
    id: 'disadvantage',
    when: r => r.p1Multiplier < 1,
    title: 'Bad matchup',
    body: 'Your element is weak against theirs, so your hits only land at 85%. Consider a different creature.',
  },
  {
    id: 'defeated',
    when: r => r.deaths.length > 0,
    title: 'Creature defeated',
    body: 'A defeated creature is gone for good. Choose who goes in next.',
  },
];

const TUTORIAL = {
  steps: TUTORIAL_STEPS,
  tips: TUTORIAL_TIPS,
  opponentPlan: OPPONENT_PLAN,
  seed: TUTORIAL_SEED,
  buildDecks: buildTutorialDecks,
};

export default TUTORIAL;
