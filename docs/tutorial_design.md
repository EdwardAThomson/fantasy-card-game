# New Player Tutorial — Design

A "How to Play" button on the front page starts a short, guided first fight.
The player learns by doing: every lesson asks them to click the real control,
in the real game screen, against a scripted opponent.

The written rules (the in-game `?` help and `HOW_TO_PLAY.md`) stay as the
reference. The tutorial only teaches enough to play a first match.

## Status

Built and styled. The overlay matches the redesigned title screen, cards and
game screen: a navy glass panel with gold hairlines and Cinzel headings, a
gold spotlight ring that gently pulses, progress dots, and a pointer from the
panel to its target. The welcome and the finale are centred with a crest.
Step targets use `data-tutorial` attributes rather than class names so future
restyles do not break the tutorial.

## The journey

| # | Step | Player does | Teaches |
|---|------|-------------|---------|
| 1 | Welcome | Next | Goal: defeat all three enemy creatures |
| 2 | Your creatures | Next | You have a hand of three |
| 3 | Health | Next | Zero health = defeated |
| 4 | Stats | Next | Strength→Melee, Agility→Ranged, Magic→Magic; Defense; initiative |
| 5 | Elements | Next | Good matchup +15%, bad −15% |
| 6 | Opponent moves first | Next | They sent Fire Elemental; Water beats Fire |
| 7 | Choose your fighter | Click Water Elemental | Selecting a creature |
| 8 | Choose how to attack | Click Magic | Matching style to best stat |
| 9 | Fight! | Click Fight | Starting a round |
| 10 | First blood | Next | Reads back what happened (advantage %, damage numbers, abilities) |
| 11 | Combat log | Next | Where the detail lives |
| 12 | Your call | Any creature + style + Fight | First unguided round, with a hint |
| 13 | Finish the battle | Free play | One-off tips appear as new things happen |
| — | Victory / So close | Quick match or Back to menu | Hand-off to real play |

**One-off tips** during free play, each shown at most once, triggered by what
just happened in the round: special ability, status effect, stun, bad
matchup, creature defeated.

**Skip tutorial** is on every step. The home button still works. Finishing or
skipping sets `fcg.tutorialDone` in localStorage; until then the front page
How to Play menu item reads "New here? Start with a guided battle".

## The scripted match

All of it lives in `src/tutorial/tutorialScript.js`.

- **Decks.** The player gets one creature per combat style: Water Elemental
  (Magic), Dire Wolf (Melee), Elf Archer (Ranged). The opponent gets Fire
  Elemental, Troll and Harpy at 35% health so the match is short and winnable.
  The lineup gives natural element lessons: Water beats Fire, Nature beats
  Earth, and Air beats Nature (the "bad matchup" tip usually fires on Harpy).
- **Opponent.** Commits *before* the player each round, in a fixed order with
  a fixed style (`OPPONENT_PLAN`), so the player can counter-pick. Normal AI
  picks after the player; this is a tutorial-only teaching affordance.
- **Seeded rolls.** The combat engine now draws randomness from `src/rng.js`.
  The tutorial installs a seeded generator, so the guided rounds play out
  identically every time and the step text can rely on them. Normal games
  still use `Math.random`.
- **No modals.** Round-win and game-over modals are suppressed in tutorial
  mode; the tutorial's own panel and tips cover those moments.

## The step mechanism

`src/tutorial/TutorialOverlay.js` renders on top of the normal `Game`. It does
not touch game state:

- **Events in.** `Game` reports `cardSelected`, `styleSelected`,
  `roundResolved` (with element multipliers, ability, new statuses, stun and
  deaths) and `gameOver`. A step advances on `Next` or on a matching event.
- **Spotlight.** A highlight ring around the step's `target`, with the rest of
  the screen dimmed. The target is re-measured as the layout shifts and
  scrolled into view.
- **Input gating.** A capture-phase listener swallows clicks and taps outside
  the step's `allow` list (default: the target only), so the player cannot
  wander off-script mid-lesson. The panel, home button and modals are always
  clickable. Free-play steps lift the gate.
- **Placement.** On desktop the panel is measured and placed on the first
  side of the target (below, above, right, left) where it fits whole, then
  clamped on screen, with a pointer aimed at the target. On phones it becomes
  a sheet pinned to whichever half of the screen the target is not on.

Adding or changing a lesson is a data change: add a step with a `target`
(a `data-tutorial` selector), text, and an `advance` rule.

### Hooks in the game screen

`data-tutorial` attributes: `p1-area`, `p1-hand`, `p2-hand`,
`p1-style-{Melee|Ranged|Magic}` (via `AttackPicker`'s `tutorialId`), `fight`,
`home`, `combat-log`, `combat-log-toggle` (the top-bar Log button),
and on each card `card-{name}` with `card-health`, `card-stats`,
`card-element` inside it. Redesigns should keep these on the equivalent
elements.

## Possible follow-ups

- An element chart step once an elements explainer exists, linking to it.
- A "Replay tutorial" entry in the in-game help.
