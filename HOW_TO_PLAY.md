# Fantasy Card Game - How to Play

## 🎯 Objective
Defeat all of your opponent's creatures to win the game! Each player commands a deck of powerful creatures with unique abilities and stats. Use strategy, timing, and a bit of luck to emerge victorious.

---

## 🎮 Game Setup

### Starting the Game
- Each player is dealt a hand of **3 unique creature cards**
- Cards are randomly selected from a pool of diverse creatures
- Each creature has unique stats and abilities

### Game Modes
- **Single Player**: Battle against an AI opponent
- **Two Player**: Face off against another human player

---

## 📋 Game Flow

### 1. Selection Phase

Each round, players must:

1. **Select a Creature**: Click on one of your creature cards to send it into battle
2. **Choose Combat Style**: Pick Melee (🗡️), Ranged (🏹), or Magic (🪄)

**Auto-Selection**: When you have only one card remaining, it will be automatically selected for you!

### 2. Combat Phase

Once both players are ready:

1. Click the **"Fight!"** button to begin combat
2. Initiative is calculated to determine attack order
3. The faster creature attacks first
4. Both creatures exchange attacks (unless one is defeated first)
5. Abilities may trigger during combat
6. Damage Over Time (DoT) effects are applied at the start of each round

### 3. Round Resolution

- Creatures with 0 HP are defeated and removed from the game
- Players select new creatures for the next round
- The game continues until one player has no creatures left

---

## ⚔️ Combat System

### Combat Styles

Each combat style uses a different stat:

- **Melee (🗡️)**: Based on **Strength**
  - Close-range physical attacks
  - High damage potential
  
- **Ranged (🏹)**: Based on **Agility**
  - Long-range precision attacks
  - Balanced damage and accuracy
  
- **Magic (🪄)**: Based on **Magic**
  - Mystical spells and enchantments
  - Powerful but varies by creature

### Damage Calculation

```
Base Attack = Combat Stat + Random(0-20)
Defense Modifier = Opponent's Defense ÷ 2
Final Damage = Max(0, Base Attack - Defense Modifier)
```

### Initiative System

Initiative determines who attacks first:

- Calculated from **Agility** and **Intelligence** stats
- Higher initiative = attacks first
- Attacking first can be crucial for victory!

---

## ✨ Abilities

### Ability Activation

- Creatures have a **50% chance** to use an ability each round
- Abilities trigger automatically during combat
- Each creature has unique abilities based on their type

### Ability Types

#### 🔥 Damage Abilities

Deal bonus damage to the opponent:

- **Fire Breath**: +10 damage, applies Burning
- **Berserk**: +15 damage
- **Backstab**: +15 damage, applies Bleeding
- **Soul Reap**: +10 damage, applies Cursed
- **Mana Bolt**: +10 damage
- **Precision Shot**: +10 damage

#### 💚 Heal Abilities

Restore health to your creature:

- **Heal**: Restores 30 HP, applies Blessed
- **Rally**: Restores 10 HP, applies Blessed
- **Raise Dead**: Restores 15 HP
- **Summon Undead**: Restores 10 HP

#### 🛡️ Defense Abilities

Reduce incoming damage:

- **Shield Wall**: -15 damage reduction, applies Blessed
- **Evasion**: -5 damage reduction
- **Fly**: -5 damage reduction
- **Teleport**: -5 damage reduction
- **Command**: -5 damage reduction, applies Blessed

#### ⭐ Control Abilities

- **Stun**: Opponent skips their next turn completely

---

## 🎨 Status Effects

Status effects appear as colored badges on creature cards and provide visual feedback about active conditions.

### Damage Over Time (DoT) Effects

#### 🔥 Burning

- **Damage**: 5 per round
- **Duration**: 2 rounds
- **Total**: 10 damage
- **Applied by**: Fire Breath, Burn
- **Visual**: Orange-red flickering badge

#### ☠️ Poisoned

- **Damage**: 4 per round
- **Duration**: 3 rounds
- **Total**: 12 damage
- **Applied by**: Poison Bite
- **Visual**: Green bubbling badge

#### 🩸 Bleeding

- **Damage**: 3 per round
- **Duration**: 3 rounds
- **Total**: 9 damage
- **Applied by**: Backstab
- **Visual**: Dark red dripping badge

### Visual Status Effects

#### ❄️ Frozen

- **Effect**: Visual indicator only
- **Applied by**: Water Blast
- **Visual**: Icy blue crystalline badge

#### ✨ Blessed

- **Effect**: Indicates active buff
- **Applied by**: Heal, Shield Wall, Light Beam, Command, Rally
- **Visual**: Golden shimmering badge
- **Card Glow**: Green

#### 🌙 Cursed

- **Effect**: Dark magic indicator
- **Applied by**: Curse, Soul Reap, Dark Spell, Necrotic Blast, Dark Blast
- **Visual**: Purple pulsing badge
- **Card Glow**: Red

#### ⭐ Stunned

- **Effect**: Creature skips its next turn completely
- **Duration**: 1 round
- **Applied by**: Stun ability
- **Visual**: Large red overlay with "Stunned" text
- **Important**: Stunned creatures cannot attack, use abilities, or defend

### DoT Mechanics

- DoT damage is applied at the **start of each round** before combat
- Multiple DoT effects can stack (e.g., Burning + Poisoned)
- DoT damage is shown in the combat log
- Flying damage numbers appear for DoT damage
- DoT effects tick down each round until expired

---

## 🎭 Visual Feedback System

The game provides rich visual feedback to help you track what's happening:

### Flying Numbers

- **Red numbers**: Damage taken
- **Green numbers**: Health restored
- Numbers fly upward from the affected card
- Larger numbers for bigger amounts

### Ability Icons

- Emoji icons pop up when abilities are used
- Each ability has a unique icon (🔥💚⚡🗡️🛡️⭐ etc.)
- Icons appear for 2 seconds with a bouncing animation
- Helps you see which abilities triggered

### Status Badges

- Colored badges appear in the center of cards
- Show all active status effects
- Multiple effects stack vertically
- Each badge has a unique color and animation

### Card Effects

- **Glow**: Cards glow green (buffed) or red (debuffed)
- **Shake**: Cards shake when taking damage
- **Selection**: Selected cards have a blue border
- **Hover**: Cards lift slightly on mouse hover

### Combat Log

- Detailed text log of all combat actions
- Shows damage dealt, abilities used, status effects applied
- Scrollable history of the entire battle
- Essential for understanding complex interactions

---

## 🎲 Strategy Tips

### Card Selection

- **Know your stats**: Check which combat style your creature excels at
- **Counter your opponent**: If they favor Melee, use a creature with high Defense
- **Save your best**: Don't always lead with your strongest creature

### Combat Style Selection

- **Play to strengths**: Use the combat style that matches your creature's highest stat
- **Adapt**: Switch styles based on your opponent's patterns
- **Initiative matters**: High Agility creatures benefit from Ranged attacks

### Ability Management

- **Abilities are random**: You can't control when they trigger (50% chance)
- **DoT is powerful**: Burning, Poison, and Bleeding add up over multiple rounds
- **Healing is valuable**: Keep creatures alive longer to maximize their potential
- **Stun is game-changing**: Can completely turn the tide of battle

### Advanced Tactics

- **DoT stacking**: Multiple DoT effects deal massive damage over time
- **Defensive play**: Use Shield Wall and healing to outlast aggressive opponents
- **Initiative control**: Faster creatures can finish off weakened opponents before they act
- **Resource management**: Don't waste your strongest creatures early

---

## 📊 Creature Stats Explained

Each creature has the following stats:

- **HP (Health Points)**: How much damage the creature can take before being defeated
- **Strength**: Determines Melee attack damage
- **Agility**: Determines Ranged attack damage and initiative
- **Magic**: Determines Magic attack damage
- **Defense**: Reduces incoming damage from all sources
- **Intelligence**: Contributes to initiative calculation

---

## 🏆 Winning the Game

### Victory Conditions

- Defeat all of your opponent's creatures
- Last player with creatures remaining wins
- No draws - battle until there's a winner!

### End Game

- A modal appears announcing the winner
- Combat log shows the complete battle history
- Players can start a new game or return to deck builder

---

## 🎪 Game Modes

### Single Player Mode

- Battle against an AI opponent
- AI automatically selects cards and combat styles
- AI chooses the highest stat for each creature
- Great for practice and learning

### Two Player Mode

- Both players manually select cards and combat styles
- Turn-based selection
- Perfect for competitive play with friends

---

## 🔧 Technical Notes

### Auto-Selection

- When a player has only one card left, it's automatically selected
- Speeds up gameplay in the final rounds
- Players still choose their combat style

### Status Effect Duration

- Most status effects last **1 round**
- DoT effects last **2-3 rounds** depending on the effect
- Stun lasts **1 round** (the stunned creature skips one turn)

### Ability Trigger Rate

- All abilities have a **50% chance** to trigger each round
- This adds an element of luck and unpredictability
- Strategic play still matters more than luck!

---

## 📱 Interface Guide

### Card Display

- **Top**: Creature name
- **Center**: Creature stats (HP, Strength, Agility, Magic, Defense, Intelligence)
- **Bottom**: Abilities list
- **Overlays**: Status effects appear as badges in the center

### Combat Buttons

- **Melee (🗡️)**: Red button
- **Ranged (🏹)**: Green button  
- **Magic (🪄)**: Blue button
- **Fight!**: Large button that glows when both players are ready

### Help Button

- **?** button in the corner
- Opens this help guide
- Available at any time during the game

---

## 🎨 Accessibility

- Clear visual feedback for all actions
- Color-coded status effects
- Text descriptions in combat log
- Large, readable fonts
- High contrast UI elements

---

## 🐛 Known Behaviors

### Stun Mechanics

- Stun is applied during combat
- The stunned creature skips their **next** turn
- If a slower creature stuns a faster one, the faster creature has already attacked this round
- Stun visual effect persists until the stunned turn is skipped

### DoT Timing

- DoT damage applies at the **start** of the round
- This happens before combat
- A creature can be defeated by DoT damage before combat begins

### Multiple Status Effects

- Multiple status effects can be active simultaneously
- They stack vertically on the card
- Each effect is processed independently

---

## 🎮 Quick Reference

### Combat Flow

1. Select creature
2. Choose combat style
3. Click Fight!
4. DoT damage applies
5. Initiative calculated
6. Faster creature attacks
7. Slower creature attacks (if alive)
8. Round ends
9. Repeat until winner

### Status Effect Summary

- 🔥 **Burning**: 5 dmg/round × 2 rounds
- ☠️ **Poisoned**: 4 dmg/round × 3 rounds
- 🩸 **Bleeding**: 3 dmg/round × 3 rounds
- ❄️ **Frozen**: Visual only
- ✨ **Blessed**: Buff indicator
- 🌙 **Cursed**: Debuff indicator
- ⭐ **Stunned**: Skip next turn

---

**Good luck, and may the best strategist win!** 🏆
