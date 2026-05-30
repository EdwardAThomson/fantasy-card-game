# Roadmap — Fantasy Combat Card Game

_Status: active · updated 2026-05-30_

A React two-player card battler — duel decks of fantasy creatures across melee,
ranged, and magic combat styles. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the
detailed phase-by-phase plan.

## Shipped

- [x] Card combat — three creatures per player with full stat sheets
- [x] 50 creatures across 8 elements
- [x] 50+ abilities (damage, healing, control, buff/debuff)
- [x] Three combat styles (melee / ranged / magic)
- [x] Element advantage system (8-element matchup, 1.15× / 0.85×)
- [x] Status effects & damage-over-time (8 types, stacking)
- [x] Initiative & combat resolution (speed, first strike)
- [x] AI opponent (single-player)
- [x] Game modes — quick play, advanced deck builder, two-player local
- [x] Deck builder UI
- [x] Combat log
- [x] Visual feedback (flying damage numbers, card animations, status badges)
- [x] Mobile-responsive layout
- [x] Help / tutorial modal
- [x] Win/loss detection + new-game reset
- [x] Combat-simulation script for balance checks

## Next

- [ ] Finish game-engine extraction (split remaining logic out of `Game.js`)
- [ ] Mobile CSS refinements (combat-log disclosure, card sizing at 480px)
- [ ] Animation polish (card death fade, modal entrances, stun flash)

## Backlog

- [ ] TypeScript migration (incremental)
- [ ] Seeded RNG (Mulberry32) for determinism / replays
- [ ] Story mode (10–15 chapters, creature unlocks, localStorage saves)
- [ ] Online multiplayer (Cloudflare Workers + Durable Objects, server-authoritative)
- [ ] Test coverage expansion
