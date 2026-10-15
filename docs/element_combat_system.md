# Element Combat System — Design Document

## Overview

An element-based advantage/disadvantage system that adds a strategic layer to creature selection. Rather than a simple rock-paper-scissors triangle, this uses a **web of relationships** where each element is strong against 2 others and weak against 2 others, with the remaining 4 being neutral.

The multipliers are intentionally modest — element matchups should influence decisions, not dictate them. A well-statted creature with a bad matchup can still win.

---

## Element Matchup Web

```
         Fire
        / | \
     >>>  |  <<<
      /   |   \
  Nature  |  Air
    |  \  |  / |
    |   Water  |
    |   / | \  |
  Earth   |  Lightning
    \   \ | /   /
     <<<  |  >>>
        \ | /
        Light --- Dark
```

### Matchup Table

Matches `ELEMENT_ADVANTAGES` in `src/constants.js`. Strong = 1.15x damage, weak = 0.85x.

| Attacker    | Strong Against (1.15x)  | Weak Against (0.85x)    |
|-------------|-------------------------|-------------------------|
| Fire        | Nature, Air             | Water, Light            |
| Water       | Fire, Light             | Nature, Earth           |
| Nature      | Water, Earth            | Fire, Dark              |
| Earth       | Lightning, Water        | Nature, Air             |
| Air         | Earth, Dark             | Fire, Lightning         |
| Lightning   | Air, Light              | Earth, Dark             |
| Light       | Dark, Fire              | Water, Lightning        |
| Dark        | Lightning, Nature       | Light, Air              |

Every element is strong against exactly two and weak against exactly two, and no pair is mutually strong.

### Design Rationale

Each pairing has a thematic justification:

- **Fire > Nature** — fire burns forests
- **Fire > Air** — fire feeds on oxygen, superheats air
- **Water > Fire** — water extinguishes flame
- **Water > Light** — mist and rain dim the sun
- **Nature > Water** — plants absorb and control water
- **Nature > Earth** — roots break stone, life reclaims land
- **Earth > Lightning** — earth grounds electrical charge
- **Earth > Water** — earth dams and drinks up water
- **Air > Earth** — wind erodes rock
- **Air > Dark** — wind scatters shadow and smoke
- **Lightning > Light** — storm clouds blot out the sun
- **Lightning > Air** — lightning splits the sky
- **Light > Dark** — light banishes shadow
- **Light > Fire** — divine light outshines mundane flame
- **Dark > Lightning** — darkness absorbs energy
- **Dark > Nature** — blight and decay consume life

### Balance Check

Every element has exactly:
- 2 elements it is strong against
- 2 elements it is weak against
- 4 neutral matchups (including self)

No element is strictly better positioned than another.

---

## Proposed Multipliers

> **Shipped values:** the game uses **1.15x / 0.85x** (`src/constants.js`). The 1.25x / 0.75x figures below were the original proposal.

| Matchup      | Damage Multiplier |
|--------------|-------------------|
| Strong (>>>) | 1.25x             |
| Neutral      | 1.0x              |
| Weak (<<<)   | 0.75x             |
| Mirror       | 1.0x              |

### Why 1.25x / 0.75x?

- **Big enough to matter**: On a 50-damage hit, that's +12 or -12 damage — noticeable and worth playing around.
- **Small enough to overcome**: A creature with better stats or a lucky ability proc can still beat a bad matchup.
- **Comparable to existing effects**: Blessed already gives 0.9x reduction, Cursed gives 1.1x amplification. Element advantage is slightly stronger than a status effect, which feels right for a strategic choice made during selection.

---

## Implementation Approach

### 1. Define the matchup data

Add to `constants.js`:

```js
// Element advantage web — each element lists what it is strong against
export const ELEMENT_ADVANTAGES = {
  fire:      ['nature', 'air'],
  water:     ['fire', 'light'],
  nature:    ['water', 'earth'],
  earth:     ['lightning', 'water'],
  air:       ['earth', 'dark'],
  lightning: ['air', 'light'],
  light:     ['dark', 'fire'],
  dark:      ['lightning', 'nature'],
};

export const ADVANTAGE_MULTIPLIER = 1.15;
export const DISADVANTAGE_MULTIPLIER = 0.85;
```

### 2. Add a lookup function

Add to `gameEngine.js`:

```js
export function getElementMultiplier(attacker, defender) {
  if (!attacker?.element || !defender?.element) return 1;
  if (attacker.element === defender.element) return 1;

  const advantages = ELEMENT_ADVANTAGES[attacker.element];
  if (advantages?.includes(defender.element)) return ADVANTAGE_MULTIPLIER;

  // Check if defender has advantage over attacker (i.e., attacker is weak)
  const defenderAdvantages = ELEMENT_ADVANTAGES[defender.element];
  if (defenderAdvantages?.includes(attacker.element)) return DISADVANTAGE_MULTIPLIER;

  return 1;
}
```

### 3. Apply in combat

In `combatRound()` within `gameEngine.js`, apply the multiplier after base damage calculation but before ability modifiers:

```js
// After: let damage = Math.max(0, playerAttack - defenseMod);
const elementMult = getElementMultiplier(attacker, defender);
damage = Math.round(damage * elementMult);

// Log the matchup if it's not neutral
if (elementMult > 1) {
  logFn(`${attacker.element} is strong against ${defender.element}! (${Math.round(elementMult * 100)}% damage)`, 'advantage');
}
if (elementMult < 1) {
  logFn(`${attacker.element} is weak against ${defender.element}. (${Math.round(elementMult * 100)}% damage)`, 'disadvantage');
}
```

### 4. Visual feedback

- Show element matchup indicator between the two selected cards before combat
- Colour-coded: green arrow for advantage, red for disadvantage, grey for neutral
- Add matchup info to the Card component tooltip when hovering the element badge

### 5. Update How To Play modal

Add an **Elements** tab explaining the system and showing the matchup table.

---

## Interaction with Existing Systems

| System               | Interaction                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| **Immunities**       | No change — immunities block status effects, not base damage                |
| **Resistances**      | Stacks multiplicatively (e.g., 0.75 element * 0.5 resistance = 0.375x)     |
| **Blessed (0.9x)**   | Stacks: a weak-element hit on a Blessed target = 0.75 * 0.9 = 0.675x      |
| **Cursed (1.1x)**    | Stacks: a strong-element hit on a Cursed target = 1.25 * 1.1 = 1.375x     |
| **DoT damage**       | Element multiplier does NOT affect DoT — DoT is ability-based, not element |
| **Ability bonus dmg** | Element multiplier applies to the total (base + ability bonus)             |

---

## Current Creature Count by Element

| Element   | Count | Notes                                   |
|-----------|-------|-----------------------------------------|
| Dark      | 9     | Largest pool — varied roles             |
| Fire      | 7     | Includes 6 with burning immunity        |
| Nature    | 7     | Strong poison/bleed themes              |
| Earth     | 7     | Tanky, bleeding immune                  |
| Lightning | 7     | Mix of magic damage + stun              |
| Water     | 6     | Freeze/constrict specialists            |
| Air       | 6     | High agility, evasive                   |
| Light     | 6     | Support-oriented, few immunities        |

Total: 55 creatures. Distribution is reasonably balanced (6-9 per element).

---

## Open Questions

1. **Should element advantage affect healing?** Probably not — healing targets self, and the attacker's element shouldn't reduce your own heal. But worth confirming.
2. **AI awareness**: Should the AI factor in element matchups when selecting creatures? Currently it picks by highest stat. Adding matchup awareness would make AI smarter.
3. **Visual design**: How prominent should the matchup indicator be? Subtle tooltip vs. prominent banner between cards.
4. **Deck builder info**: Should the deck builder show a "coverage" indicator (e.g., "your deck is weak to Fire")?
