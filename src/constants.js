export const DECK_SIZE = 3;

export const ELEMENTS = {
  fire:      { icon: '\uD83D\uDD25', color: '#ef4444' },
  water:     { icon: '\uD83C\uDF0A', color: '#3b82f6' },
  nature:    { icon: '\uD83C\uDF3F', color: '#22c55e' },
  earth:     { icon: '\uD83E\uDEA8', color: '#a8783e' },
  air:       { icon: '\uD83C\uDF2A\uFE0F', color: '#67e8f9' },
  lightning: { icon: '\u26A1', color: '#facc15' },
  light:     { icon: '\u2728', color: '#fbbf24' },
  dark:      { icon: '\uD83C\uDF11', color: '#a855f7' },
};

export const ELEMENT_ADVANTAGES = {
  fire:      ['nature', 'air'],
  water:     ['fire', 'lightning'],
  nature:    ['water', 'earth'],
  earth:     ['lightning', 'fire'],
  air:       ['earth', 'nature'],
  lightning: ['water', 'air'],
  light:     ['dark', 'fire'],
  dark:      ['lightning', 'nature'],
};

export const ADVANTAGE_MULTIPLIER = 1.15;
export const DISADVANTAGE_MULTIPLIER = 0.85;

export const eName = (creature) => {
  const el = ELEMENTS[creature?.element];
  return el ? `${el.icon} ${creature.name}` : creature?.name || '';
};
