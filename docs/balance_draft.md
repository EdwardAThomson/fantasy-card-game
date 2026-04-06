# Balance Draft — Creature Tiering & Strategy

## Approach

We have two levers to pull, and the order matters:

1. **Element advantages first** — Implementing the 1.25x/0.75x matchup system (from `element_combat_system.md`) will redistribute win rates across the board. Every creature gains 2 favourable and 2 unfavourable matchups. This alone should tighten the spread and make element diversity in your hand meaningful.

2. **Ability tuning second** — Once element effects are in, we re-run the sim and see what the new landscape looks like. Then we tune individual abilities with real data.

This document tiers every creature, identifies what's working, what isn't, and what each creature's role should be once elements are active.

---

## What Element Advantages Should Change

With the proposed matchups (Fire > Nature/Air, Water > Fire/Lightning, etc.), key shifts:

| Current dominant | Element | Weak to | Expected impact |
|---|---|---|---|
| Celestial Dragon (97.4%) | Light | Lightning, Nature | Now takes 1.25x from 13 creatures (7 lightning + 6 nature). Should drop to ~80-85%. |
| Dragon (88.7%) | Fire | Water, Earth | 6 water + 7 earth creatures now hit it for 1.25x. Big drop expected. |
| Forest Spirit (88.5%) | Nature | Fire, Dark | Already loses to fire creatures — this gets worse. But gains 1.25x vs Water and Earth. |
| Lightning Elemental (84.4%) | Lightning | Earth, Dark | Earth and dark creatures now punish it. |

Meanwhile, weak creatures in underrepresented counter-elements should rise. Siren (Water, 22.2%) would gain 1.25x against all fire and lightning creatures — that's 14 matchups improved.

**Prediction:** Elements alone could tighten the spread from ~4-97% to something like ~15-85%.

---

## Element Distribution by Current Tier

| Tier | Fire | Water | Nature | Earth | Air | Lightning | Light | Dark |
|---|---|---|---|---|---|---|---|---|
| Top 10 (>75%) | Dragon, Phoenix | Frost Wyrm | Forest Spirit | Minotaur | — | Lightning Elem | Celestial Dragon | — |
| Mid 11-25 (40-75%) | — | Water Elem, Tide Priestess | Treant, Druid | Dwarf Brs, Earth Elem | Air Elem | Thunder Mage, Storm Elem | Elem Guardian, Paladin | Undead Knight, Orc, Sorceress |
| Bottom 26-50 (<40%) | Fire Elem, Salamander, Inferno Djinn, Magma Golem | Sea Serpent, Siren | Elf Archer, Briar Shaman, Dire Wolf | Noble Lord, Human Ranger | Wizard, Storm Griffin, Wind Dancer, Sylph, Harpy | Ball Lightning, Thunderbird, Volt Serpent | High Elf Spearman, Seraph, Templar | Necromancer, Shadow Assassin, Giant Spider, Lich King?, Warlock |

Notes:
- **Fire** is polarised: Dragon/Phoenix at top, rest at bottom. The low-tier fire creatures all have burning immunity (redundant when fighting non-fire) and weak/duplicate abilities.
- **Air** is almost entirely bottom-tier. 5 of 6 air creatures are below 35%. Weak abilities (Gust of Wind, Fly, Evasion) and low HP.
- **Light** is bottom-heavy despite Celestial Dragon. 4 of 6 light creatures are below 40%.
- **Dark** is mid-to-bottom, but has 9 creatures — lots of roster filling space.
- **Water** is well-distributed thanks to stun/freeze effects on Frost Wyrm and healing on Water Elemental/Tide Priestess.

---

## Creature Tiers & Roles

### Tier S — Dominant (>80% win rate)

These creatures are already strong. Element disadvantages should naturally pull them down. Abilities should stay modest.

| # | Creature | Element | HP | Win% | Abilities | Role | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Celestial Dragon | Light | 550 | 97.4% | Fire Breath, Fly | Stat monster | Highest HP in game. Already has weak abilities (Fly). Element weakness to Lightning/Nature should create real counter-picks. **No changes needed.** |
| 2 | Dragon | Fire | 500 | 88.7% | Fire Breath, Fly | Stat monster | Same as above — dominant through raw stats. Water/Earth counter-picks should bring it down. **No changes needed.** |
| 3 | Forest Spirit | Nature | 360 | 88.5% | Heal, Entangle | Stun + heal combo | Overperforms its HP because Entangle is stun + poison DoT — arguably the best ability in the game. Element weakness to Fire/Dark is thematically perfect. **No changes needed — elements will balance it.** |
| 4 | Frost Wyrm | Water | 400 | 85.5% | Water Blast, Tidal Wave | Double freeze/stun | Two stun abilities is very strong. Nature/Air weakness should help. **No changes needed.** |
| 5 | Lightning Elemental | Lightning | 310 | 84.4% | Stun | Stun specialist | Only has ONE ability (Stun), but 100% proc = stun when it triggers. Massively overperforms its 310 HP. Earth/Dark weakness will help. **Consider: is one ability intended? Could get a second, weaker ability.** |

### Tier A — Strong (65-80%)

Performing well. Minor tweaks at most.

| # | Creature | Element | HP | Win% | Abilities | Role | Notes |
|---|---|---|---|---|---|---|---|
| 6 | Kraken | Water | 460 | 84.4% | Constrict, Crushing Grip | Tank + CC | High HP + stun + DoT. Solid design. **Fine.** |
| 7 | Phoenix | Fire | 380 | 83.1% | Heal, Fire Breath | Self-sustain + damage | Heal + damage ability is the ideal combo. **Fine.** |
| 8 | Lich King | Dark | 350 | 82.8% | Raise Dead, Necrotic Blast | Damage + heal | High magic (110) drives its damage. Heal is small (15 HP). Curse immunity is relevant. **Fine.** |
| 9 | Minotaur | Earth | 410 | 79.5% | Berserk, Stun | Bruiser + CC | Good stat block + stun. **Fine.** |
| 10 | Troll | Earth | 430 | 75.8% | Heal, Stun | Tank + CC + sustain | The complete package. High HP, heals, stuns. **Fine.** |
| 11 | Dwarf Berserker | Earth | 420 | 72.4% | Berserk | Pure damage | Only one ability. Wins through HP + Berserk burst. **Consider adding a second ability.** |
| 12 | Water Elemental | Water | 300 | 72.2% | Water Blast, Heal | Stun + heal | Low HP but great kit. Burning + frozen immunity is very valuable. **Fine.** |
| 13 | Undead Knight | Dark | 450 | 71.5% | Soul Reap, Stun | Tank + CC | High HP + stun. Bleeding + poisoned immunity. Solid. **Fine.** |
| 14 | Elemental Guardian | Light | 400 | 70.2% | Shield Wall, Light Beam | Defensive | Shield Wall (15 reduction) is the strongest defense ability. Decent. **Fine.** |
| 15 | Magma Golem | Fire | 470 | 70.1% | Shield Wall, Fire Breath | Defensive tank | High HP + Shield Wall. Reliable if dull. **Fine.** |
| 16 | Tide Priestess | Water | 300 | 67.2% | Heal, Tidal Wave | Support + CC | Low HP offset by heal + stun. **Fine.** |
| 17 | Treant | Nature | 460 | 66.4% | Shield Wall, Regenerate | Sustain tank | High HP + Regenerate (25 heal + 5/round HoT). Should be stronger — Shield Wall may be wasted since its offense is low (42.2 dmg/round, lowest of top 20). **Could swap Shield Wall for something offensive.** |

### Tier B — Average (40-65%)

These are broadly fine. Element advantages will help some, hurt others.

| # | Creature | Element | HP | Win% | Abilities | Role | Notes |
|---|---|---|---|---|---|---|---|
| 18 | Seraph | Light | 340 | 65.1% | Heal, Light Beam | Support + damage | Good kit, modest HP. **Fine.** |
| 19 | Air Elemental | Air | 290 | 64.3% | Gust of Wind, Stun | CC + chip | Stun carries it despite low HP. **Fine — stun does the work.** |
| 20 | Thunder Mage | Lightning | 300 | 61.7% | Chain Lightning, Stun | CC + damage | Stun + damage. Good design. **Fine.** |
| 21 | Earth Elemental | Earth | 380 | 60.8% | Rock Throw, Shield Wall | Defensive | Decent HP, boring kit. Rock Throw (+10) is generic. **Could be more interesting.** |
| 22 | Druid | Nature | 330 | 56.5% | Heal, Nature's Wrath | Support + DoT | Heal + poisoned DoT is a nice kit. **Fine.** |
| 23 | Sorceress | Lightning | 320 | 53.6% | Mana Bolt, Curse | Damage + debuff | Curse applies cursed (+10% incoming damage). Modest. **Mana Bolt is generic — could be more distinct.** |
| 24 | Templar | Light | 380 | 50.1% | Stun, Fortify | CC + defense | Has stun but 37.6 dmg/round is very low. Element will help (strong vs Dark/Fire). **Low damage is the issue — Fortify is defensive but Templar has no offensive punch.** |
| 25 | Thunderbird | Lightning | 400 | 48.7% | Fly, Chain Lightning | Evasive damage | 400 HP should be solid, but Fly (+5 defense) is nearly useless and Chain Lightning (+8) is weak. **Underperforming its stats. Needs better abilities.** |
| 26 | Orc | Dark | 400 | 48.5% | Berserk, Shield Wall | Bruiser + defense | Good HP but split identity — offense and defense don't synergise. Low magic/intelligence hurts initiative. **Fine for a straightforward fighter. Element advantages vs Lightning/Nature should help.** |
| 27 | Sea Serpent | Water | 320 | 48.4% | Poison Bite, Tidal Wave | DoT + stun | Has stun via Tidal Wave but only 320 HP. Should benefit from Water element advantages. **Fine.** |
| 28 | Briar Shaman | Nature | 310 | 46.2% | Nature's Wrath, Heal | DoT + sustain | Similar to Druid but worse stats. **Might overlap too much with Druid.** |
| 29 | Storm Elemental | Lightning | 330 | 44.6% | Thunder Strike, Gust of Wind | Damage | Stun immune, which is unique. But Gust of Wind (+10) is generic. **Stun immunity is a hidden strength that element matchups will make more relevant.** |
| 30 | Giant Spider | Dark | 320 | 41.7% | Poison Bite, Entangle | DoT + stun | Has Entangle (stun + poison) which is very strong, plus Poison Bite. 50% poison resistance. **Should perform better — the 320 HP is holding it back. Element advantages vs Lightning/Nature might push it up.** |
| 31 | Inferno Djinn | Fire | 290 | 41.6% | Cast Spell, Burn | Burst + DoT | Cast Spell (+20) is the strongest damage ability. Burn adds DoT. Low HP is the problem. **A genuine glass cannon — should be high-variance. Element will give it 1.25x vs Nature/Air.** |

### Tier C — Weak (20-40%)

These creatures need help. Element advantages will improve some, but many have fundamental ability problems.

| # | Creature | Element | HP | Win% | Abilities | Role | Notes |
|---|---|---|---|---|---|---|---|
| 32 | Paladin | Light | 400 | 39.5% | Fortify, Light Beam | Defensive | 400 HP but 42 dmg/round — can't kill anything fast enough. Both abilities are modest. **Needs more offensive punch or a way to capitalise on its tankiness.** |
| 33 | Necromancer | Dark | 290 | 39.1% | Summon Undead, Dark Spell | Heal + damage | Summon Undead heals only 10 HP. Dark Spell is +10 damage. Both are weak. **Needs stronger abilities to justify 290 HP.** |
| 34 | Warlock | Dark | 280 | 36.5% | Dark Blast, Summon Minion | Damage + heal | Same issue as Necromancer. Dark Blast +10, Summon Minion heals 10. Generic and weak. **Needs ability rework.** |
| 35 | Fire Elemental | Fire | 320 | 35.1% | Fire Breath, Burn | DoT + DoT | Both abilities apply burning — completely redundant. Having two chances at the same DoT isn't much better than one. **Give it a second distinct ability.** |
| 36 | Wizard | Air | 300 | 34.9% | Cast Spell, Teleport | Burst + defense | Cast Spell (+20) is great but Teleport (+5 defense) is nearly useless. 300 HP dies fast. **Element advantages (Air > Earth/Nature) will help. Teleport could be buffed.** |
| 37 | Storm Griffin | Air | 350 | 33.3% | Precision Shot, Fly | Damage + defense | 350 HP is decent but both abilities are weak. Precision Shot (+10) and Fly (+5) are generic. **Needs better abilities — could be a fast striker.** |
| 38 | Volt Serpent | Lightning | 310 | 30% | Constrict, Chain Lightning | Stun + damage | Has Constrict (stun) but Chain Lightning (+8) is the weakest damage ability. **Chain Lightning value is too low.** |
| 39 | Dire Wolf | Nature | 340 | 29.7% | Berserk, Camouflage | Burst + defense | Berserk (+15) is decent, Camouflage (+8) is weak. 340 HP is mid. **Underperforming. Could benefit from a more aggressive identity.** |
| 40 | Noble Lord | Earth | 330 | 27% | Command, Rally | Defense + heal | Command (-5 defense) and Rally (heal 10) are both very weak. **One of the worst ability sets in the game. Needs rework — maybe a leadership/buff theme.** |

### Tier D — Very Weak (<20%)

Fundamental problems. Need either ability reworks, stat adjustments, or a unique niche.

| # | Creature | Element | HP | Win% | Abilities | Role | Notes |
|---|---|---|---|---|---|---|---|
| 41 | Siren | Water | 280 | 22.2% | Evasion, Cast Spell | Evasion + burst | Cast Spell (+20) is good, but Evasion (+5) is almost nothing. 280 HP. **Water element will help (1.25x vs Fire/Lightning). Could become a viable glass cannon with element bonus.** |
| 42 | Elf Archer | Nature | 280 | 20.8% | Precision Shot, Evasion | Ranged + evasion | Two of the weakest abilities. Precision Shot (+10) and Evasion (+5). **Needs a niche — maybe "first strike" or higher crit potential. The archer fantasy isn't landing.** |
| 43 | Wind Dancer | Air | 270 | 17.3% | Evasion, Gust of Wind | Pure evasion | Two weak abilities, very low HP. **Evasion-focused identity doesn't work when evasion is +5. Could be redesigned as a dodge specialist with much higher evasion value.** |
| 44 | Sylph | Air | 260 | 14.8% | Heal, Gust of Wind | Support | Low HP, weak damage ability. Heal keeps it alive slightly longer. **Element advantages may help marginally. Needs better kit.** |
| 45 | Shadow Assassin | Dark | 250 | 10.8% | Backstab, Shadow Step | Burst + defense | Backstab (+15 + bleed DoT) is actually good, but Shadow Step (+5) is useless and 250 HP is the second-lowest. **The assassin fantasy should be: sometimes it kills you before you can react, sometimes it folds. Needs higher burst to justify the glass.** |
| 46 | Salamander | Fire | 290 | 9.4% | Fire Breath, Burn | DoT + DoT | Same problem as Fire Elemental — both abilities apply burning. Completely redundant. **Must replace one ability.** |
| 47 | Harpy | Air | 280 | 8.2% | Poison Bite, Fly | DoT + defense | Thematically odd (Poison Bite on an air creature?). Fly (+5) doesn't help. **Needs a coherent identity. Maybe a harassing/debuff role.** |
| 48 | Human Ranger | Earth | 290 | 8% | Ranged Attack, Camouflage | Damage + defense | Both abilities are weak and generic. Ranged Attack (+10) and Camouflage (+8). **Most boring ability set in the game. Needs a distinct identity — traps, ambush, tracking?** |
| 49 | High Elf Spearman | Light | 300 | 7.1% | Spear Thrust, Shield Wall | Damage + defense | Spear Thrust (+10) is weak. Shield Wall (-15) is decent but purely defensive, so fights drag and it still loses. **Needs offensive ability or a way to capitalise on defense.** |
| 50 | Ball Lightning | Lightning | 220 | 4.5% | Teleport, Thunder Strike | Defense + damage | Highest dmg/round in the game (73.2!) but lowest HP (220). Teleport (+5 defense) wastes its proc. **The ultimate glass cannon that needs its glass cannon identity to actually pay off. Replace Teleport with something high-impact.** |

---

## Recommended Approach

### Step 1: Implement Element Advantages (before any ability changes)

Add the 1.25x/0.75x system from `element_combat_system.md` to the combat sim. Run the full simulation. This will:
- Pull down dominant stat-monsters (Dragon, Celestial Dragon) in 2/8 matchups
- Lift weak creatures in their favourable elements
- Make element diversity in deck-building meaningful
- Give us a real baseline for ability tuning

### Step 2: Re-assess from new data

Some creatures may self-correct just from element advantages. Others will still need help. In particular watch for:
- **Fire bottom-tier** (Salamander, Fire Elemental, Inferno Djinn) — do they rise when hitting Nature/Air for 1.25x?
- **Air bottom-tier** (Wind Dancer, Sylph, Harpy) — Air is strong vs Earth/Nature, which includes some mid-tier creatures. Does this help enough?
- **Dark creatures** — Dark is strong vs Lightning/Nature. With 9 dark creatures, this could be a big shift.

### Step 3: Ability tuning pass

After elements are in, address remaining problems:

**Quick fixes (number tuning only):**
- Buff weak damage abilities: Gust of Wind, Ranged Attack, Spear Thrust, Chain Lightning
- Buff weak defense abilities: Fly, Evasion, Teleport, Shadow Step, Camouflage
- Buff weak heals: Summon Undead, Summon Minion, Rally

**Ability reworks (change what the ability does):**
- **Salamander / Fire Elemental**: Replace duplicate Burn/Fire Breath with a distinct second ability
- **Ball Lightning**: Replace Teleport with something explosive
- **Noble Lord**: Command and Rally both need to be more impactful
- **Human Ranger**: Needs a unique identity ability
- **Harpy**: Poison Bite doesn't fit thematically; needs an air-themed ability

**Role sharpening:**
- Glass cannons (Ball Lightning, Shadow Assassin, Inferno Djinn, Siren): Need abilities that create high-variance outcomes — big burst when they proc, still fragile when they don't
- Tanks with no teeth (Paladin, Templar, High Elf Spearman): Need a way to convert survivability into wins
- Boring mid-tier (Thunderbird, Storm Griffin, Earth Elemental): Need more distinct identities

---

## Open Questions

1. **Should we add new ability types?** Counter-attack, reflect damage, lifesteal, etc. could create new niches without just tuning numbers.
2. **Stun balance**: Currently the strongest mechanic. Should stun have diminishing returns (e.g., can't stun the same target twice in a row)?
3. **One-ability creatures**: Lightning Elemental and Dwarf Berserker only have one ability each. Is this intentional? They always know what they're getting, which could be a design choice.
4. **Creature count per element**: Dark has 9, others have 6-7. Should we aim for 6 each (48 total) or add more to smaller pools?
