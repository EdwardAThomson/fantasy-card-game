# Fantasy Card Game — Development Roadmap

## Context

The game is a React-based two-player fantasy card combat game with 27 creatures, 34 abilities, and 3 game modes. The codebase is clean but has scaling challenges: Game.js is 988 lines of tightly coupled logic+UI, mobile layout has critical breakages (deck builder, combat log), and animations have gaps (no victory/defeat, no card death, no modal transitions). This roadmap expands the game methodically across 5 areas, with creatures and mobile being the immediate priorities, and story mode / online play as longer-term goals.

**Tech preferences:** Minimal dependencies (each must earn its place), open to TypeScript, Cloudflare Pages+Workers for hosting, centralised auth system for online play.

---

## Phase 1: Foundation & Creatures (Immediate)

### 1A. Creature Expansion Methodology

**Current imbalance by element:**

| Element   | Count | Target | Need       |
|-----------|-------|--------|------------|
| Dark      | 7     | 5      | -2 (no new)|
| Earth     | 5     | 5      | 0          |
| Multi     | 4     | 4      | 0          |
| Fire      | 3     | 4      | +1         |
| Nature    | 2     | 4      | +2         |
| Air       | 2     | 4      | +2         |
| Light     | 2     | 4      | +2         |
| Water     | 1     | 4      | +3         |
| Lightning | 1     | 3      | +2         |

**Target: ~40 creatures total** (13 new), balancing elements to 3-5 each.

**Stat design guidelines:**

- HP range: 250–550 (tanks high, glass cannons low)
- Each creature should excel in 1-2 stats and be weak in 1-2
- Element should influence stat tendency (Fire=high magic/strength, Air=high agility, Earth=high defense)
- No creature should be strictly better than another in all stats

**Proposed new creatures (13):**

| Name            | Element   | Role           | HP  | Key Stats                      | Abilities                          |
|-----------------|-----------|----------------|-----|--------------------------------|------------------------------------|
| Kraken          | Water     | Tank/Magic     | 480 | High magic, high defense       | Water Blast, Constrict (new)       |
| Sea Serpent     | Water     | Damage         | 340 | High agility, high magic       | Poison Bite, Tidal Wave (new)      |
| Tide Priestess  | Water     | Support        | 300 | High intelligence, high magic  | Heal, Water Blast                  |
| Storm Griffin   | Air       | Damage         | 360 | High agility, high strength    | Precision Shot, Thunder Strike (new)|
| Wind Dancer     | Air       | Evasive        | 280 | Very high agility, low defense | Evasion, Fly                       |
| Treant          | Nature    | Tank           | 450 | High defense, high HP, low agi | Shield Wall, Regenerate (new)      |
| Druid           | Nature    | Support/Magic  | 320 | High intelligence, high magic  | Heal, Nature's Wrath (new)         |
| Paladin         | Light     | Tank/Support   | 420 | Balanced, high defense         | Shield Wall, Light Beam            |
| Seraph          | Light     | Damage/Support | 350 | High magic, high intelligence  | Light Beam, Rally                  |
| Thunder Mage    | Lightning | Magic          | 310 | High magic, high intelligence  | Lightning Bolt, Thunder Strike (new)|
| Storm Elemental | Lightning | Damage         | 330 | High agility, high magic       | Lightning Bolt, Chain Lightning (new)|
| Salamander      | Fire      | Agile          | 290 | High agility, high strength    | Fire Breath, Burn                  |
| Ifrit           | Fire      | Bruiser        | 400 | High strength, high magic      | Fire Breath, Inferno (new)         |

**Adding a creature — touch points:**

1. `src/creatures.js` — Add to `creatures` array with full stat block
2. `public/` — Add `.webp` image file
3. If new abilities: add to `ABILITIES` object in `creatures.js`, add handler in `resolveAbility()` in `Game.js`
4. Tests: add immunity/resistance smoke tests if applicable

### 1B. New Abilities

**Current gap analysis:** No buff/debuff abilities beyond simple heal/defense. No conditional triggers, no multi-target effects, no resource mechanics.

**Proposed new abilities (8):**

| Ability         | Type    | Effect                        | Status                                           |
|-----------------|---------|-------------------------------|--------------------------------------------------|
| Constrict       | damage  | 8 bonus damage                | Applies "stunned" (25% chance instead of 50%)    |
| Tidal Wave      | damage  | 10 bonus damage               | Applies "frozen" with DoT (2 dmg/round, 2 rounds)|
| Thunder Strike  | damage  | 12 bonus damage               | 30% chance to stun                               |
| Regenerate      | heal    | Heals 15 HP                   | Applies "blessed"                                |
| Nature's Wrath  | damage  | 10 bonus damage               | Applies "poisoned" DoT                           |
| Chain Lightning | damage  | 8 bonus damage                | Flavour variant of Lightning Bolt                |
| Inferno         | damage  | 15 bonus damage               | Applies "burning" DoT                            |
| Fortify         | defense | Reduces incoming damage by 12 | Applies "blessed"                                |

**Implementation:** Each new ability follows the existing pattern in `resolveAbility()` — a case in the switch statement that modifies attacker/defender stats and returns log messages.

---

## Phase 2: Mobile & Animations (Immediate)

### 2A. Mobile Fixes (Critical)

**Files to modify:** `src/App.css`, `src/index.css`

1. **Deck builder layout** — Add `@media (max-width: 768px)` rule to stack `.player-decks-container` vertically:
   ```css
   @media (max-width: 768px) {
     .player-decks-container {
       flex-direction: column;
       align-items: center;
     }
     .deck-display { width: 90%; }
   }
   ```

2. **Combat log progressive disclosure** — Instead of hiding at 1200px, collapse to a togglable panel:
   - Add a "Combat Log" toggle button visible at <1200px
   - Log slides in as an overlay or bottom drawer
   - Requires small JS change in `Game.js` (toggle state)

3. **Game container flex-basis** — Change `flex: 1 1 980px` to `flex: 1 1 auto; max-width: 1000px` to prevent tablet overflow

4. **Touch interactions** — Add larger touch targets for combat buttons (min 44px), add `:active` states matching `:hover`

5. **Fixed buttons (Home/Help)** — Reposition at <480px to avoid content overlap

6. **Card sizing at 480px** — Test 140px cards with 3 per row; may need horizontal scroll or 2+1 layout

### 2B. Animation Improvements

**Priority order (most impactful first):**

1. **Card death animation** — Fade out + shrink when creature HP hits 0 (CSS only: opacity 0, scale 0.8, transition 0.5s)
2. **Victory/defeat modal** — Slide-in or scale-up entrance animation for the winner modal
3. **Stun entrance** — Brief flash/shake when stun is applied (reuse cardShake with different timing)
4. **Modal transitions** — Add enter/exit transitions to `Modal.js` (opacity + translateY)
5. **Combat resolution** — Brief "clash" visual between the two selected cards (CSS animation on the fight button area)

**Approach:** Pure CSS animations. No animation library needed — the game's animation needs are simple transforms/opacity, and a library would add bundle weight without enough built-in "fantasy game" animations to justify it. If animation needs grow significantly later (particle effects, complex sequences), revisit Framer Motion.

---

## Phase 3: Architecture Refactoring (Before Story/Online)

### 3A. Extract Game Engine

**Goal:** Separate game logic from React rendering so it can be reused by story mode, tested independently, and eventually run server-side.

1. Create `src/gameEngine.js` — Move pure functions out of Game.js:
   - `combatRound()`, `handleCombatRound()`, `processDoTDamage()`
   - `resolveAbility()`, `applyStatusEffect()`, `applyDoT()`
   - `getCombatStat()`, `getRandomUniqueCards()`
   - `makeAIDecision()` (extract from useCallback)
   - New: `calculateInitiative()`, `victoryCheck()`

2. Create `src/gameState.js` — Define game state shape:
   - Serializable state object (for save/load, network sync)
   - State transition functions (action -> new state)

3. **Game.js becomes a thin React wrapper** (~300 lines):
   - Calls game engine functions
   - Manages animations/UI state only
   - Renders based on game state

4. **Replace `Math.random()` with seeded RNG** in game engine:
   - Simple `mulberry32` or similar (no dependency needed)
   - Enables: replays, server authority, deterministic testing

### 3B. TypeScript (Optional, Recommended)

- Migrate incrementally: rename `.js` to `.ts`/`.tsx` one file at a time
- Start with `creatures.ts` and `gameEngine.ts` (data + logic benefit most)
- Type the creature, ability, and game state interfaces
- CRA supports TS out of the box (`npm install typescript @types/react`)
- **Win:** Catches stat typos, missing ability handlers, invalid state transitions

---

## Phase 4: Story Mode (Later)

### High-Level Design

```
src/
  story/
    StoryMode.js        — Main story component
    chapters.js         — Chapter definitions (opponents, narrative, rewards)
    StoryBattle.js      — Wrapper around Game.js with story context
    StoryProgress.js    — Progress tracker component
```

**Mechanics:**

- Linear chapter progression (10-15 chapters)
- Each chapter: narrative text -> pre-set opponent deck -> battle -> reward
- Rewards: unlock new creatures for your story deck
- Progress saved to `localStorage` (simple JSON)
- Reuses existing Game component with `player2Deck` set by chapter data

**Touches:** `App.js` (new mode), new `src/story/` directory, `creatures.js` (creature unlock flags)

---

## Phase 5: Online Play (Later)

### Architecture: Cloudflare Pages + Workers + Durable Objects

**Why Durable Objects:** Perfect for game rooms — each room is a stateful object with WebSocket connections. No separate database needed for active games. Cloudflare Pages serves the React app.

```
Infrastructure:
  Cloudflare Pages     -> React SPA (static hosting)
  Cloudflare Worker    -> API routes (auth, matchmaking, lobby)
  Durable Objects      -> Game rooms (WebSocket, authoritative state)
  KV / D1              -> User profiles, match history, leaderboards
```

### Auth Integration

- Design an `AuthProvider` React context that wraps the app
- Auth context exposes: `user`, `login()`, `logout()`, `isAuthenticated`
- API calls include auth token in headers
- Worker validates token against the centralised auth system
- Keep auth module as a thin adapter — when the centralised system is ready, swap the implementation behind the same interface

### Lobby System

- Worker API: `POST /lobby/create`, `GET /lobby/list`, `POST /lobby/join`
- Durable Object per lobby room: manages WebSocket connections, game state
- Game engine runs in the Durable Object (server authority)
- Client sends actions (select card, choose style, fight)
- Server validates, computes result with seeded RNG, broadcasts state

**Key dependency:** Phase 3 game engine extraction must be complete first (engine needs to run in Worker environment, not just browser).

---

## Phase 6: Testing Strategy (Ongoing)

**Current:** 4 test files, ~15% coverage. Focus on abilities, AI, deck, immunities.

**Expand incrementally with each phase:**

- Phase 1: Add tests for each new creature's abilities and immunities
- Phase 2: No new tests (CSS changes)
- Phase 3: Comprehensive game engine tests (combat resolution, DoT timing, stun mechanics, initiative, seeded RNG determinism)
- Phase 4: Story progression tests (chapter unlocks, save/load)
- Phase 5: Game state sync tests, auth flow tests

**Test commands:** `npm test` (Jest + React Testing Library, already configured)

---

## Execution Order Summary

| Priority | Phase | Scope                     | Effort       |
|----------|-------|---------------------------|--------------|
| NOW      | 1A    | Add 13 creatures + images | Medium       |
| NOW      | 1B    | Add 8 abilities           | Small        |
| NOW      | 2A    | Mobile CSS fixes          | Small-Medium |
| NOW      | 2B    | Animation improvements    | Small        |
| NEXT     | 3A    | Extract game engine       | Medium       |
| NEXT     | 3B    | TypeScript migration      | Medium       |
| LATER    | 4     | Story mode                | Medium       |
| LATER    | 5     | Online play (CF Workers)  | Large        |

---

## Verification

- **Creatures/abilities:** Run `npm test` — all existing + new ability tests pass
- **Mobile:** Manual test at 320px, 480px, 768px, 1024px, 1440px (Chrome DevTools device mode)
- **Animations:** Visual inspection of card death, modal entrance, stun application
- **Game engine extraction:** All existing tests still pass after refactor; new deterministic tests pass with seeded RNG
- **Story mode:** Play through 2-3 chapters end-to-end
- **Online:** Two browser tabs can connect, select decks, and battle with server-authoritative state
