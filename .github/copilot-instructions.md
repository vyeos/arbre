# AI INSTRUCTIONS — RPG PROGRESSION LEARNING GAME

This project is NOT a generic productivity or learning app.
It is a **learning-based RPG progression game**.

All code, UI, UX, copy, naming, and logic MUST follow this fantasy.

---

## 1. CORE FANTASY

- The user is a **Player**, not a user.
- The player is **leveling up their mind** through learning.
- Knowledge is treated as **power, skills, and progression**.
- Every interaction must feel like a **game mechanic**, not a form.
- The player has a **visual identity** (Avatar).
- Visual progression is as important as stat progression.
- Cosmetics represent **mastery, dedication, and status**, never power.
- Learning rewards both **strength (stats)** and **style (cosmetics)**.

If a feature feels boring or corporate, it is WRONG.

---

## 2. TERMINOLOGY (MANDATORY)

Always use RPG terms. Never use generic app language.

| Generic Term | RPG Term            |
| ------------ | ------------------- |
| User         | Player              |
| Lesson       | Quest               |
| Topic        | Skill               |
| Module       | Skill Branch        |
| Level        | Rank                |
| Progress     | XP                  |
| Points       | Skill Points        |
| Streak       | Combo / Momentum    |
| Error        | Damage / Debuff     |
| Success      | Critical Hit        |
| Completion   | Quest Cleared       |
| Dashboard    | Character Overview  |
| Settings     | Codex               |
| Store / Shop | Armory / Relic Shop |
| Currency     | Gold / Essence      |
| Items        | Relics / Cosmetics  |
| Buy          | Acquire             |
| Equip        | Bind                |
| Locked Item  | Sealed Relic        |
| Avatar       | Character Vessel    |

All UI text, logs, toasts, and messages must follow this table.

---

## 3. GAMEPLAY PHILOSOPHY

- Learning = Action
- Action = Reward or Consequence
- No action is meaningless

### Core Rules

- Every meaningful action must:
  - Grant XP
  - Affect stats
  - Unlock or progress a skill
- Failure is allowed but has consequences:
  - Health drain
  - Cooldowns
  - Reduced rewards
- Consistency is rewarded more than perfection.

---

## 4. PROGRESSION SYSTEM

### Player Stats (example, extensible)

- HP (Health): drops on mistakes or inactivity
- Focus / Mana: limits actions per session
- Intelligence: scales XP gain
- Streak Bonus: multiplies rewards

### Skill Trees

- Skills are nodes in a tree.
- Skills have:
  - Cost (Skill Points / XP)
  - Prerequisites
  - Effects (buffs, unlocks, modifiers)
- Locked skills must feel desirable and powerful.

---

## 5. CHALLENGES & BOSSES

- Exercises and problems are **encounters**.
- Important checkpoints are **boss fights**.
- Bosses:
  - Test multiple skills
  - Punish weak areas
  - Reward mastery heavily

Failure should feel like:

> “You weren’t ready yet”  
> not  
> “You failed”

---

## 6. UI & VISUAL DIRECTION

- RPG-inspired UI:
  - Skill trees
  - Progress bars
  - Locked/unlocked states
  - Glow, pulse, impact animations
- Prefer:
  - Dark fantasy or futuristic RPG themes
  - High contrast
  - Clear visual hierarchy
- Avoid:
  - Spreadsheet layouts
  - Plain tables
  - Corporate dashboards

If a UI looks like Notion, Jira, or a SaaS dashboard — redo it.

---

## 7. FEEDBACK & COPY STYLE

Never use boring system messages.

### Replace with RPG Feedback

- “Correct” → “Critical Hit!”
- “Wrong answer” → “You took damage”
- “Completed” → “Quest Cleared”
- “Unlocked” → “New Skill Acquired”
- “Error occurred” → “The system destabilized”

Tone:

- Encouraging
- Game-like
- Never scolding

---

## 8. UX PRINCIPLES

- Game-like but still:
  - Clear
  - Responsive
  - Beginner-friendly
- Tooltips explain RPG terms in plain language.
- Player should always understand:
  - Why something is locked
  - What they gain next
  - How to recover from failure

---

## 9. TECH & CODE GUIDELINES

- Prefer systems over hardcoding:
  - Skill definitions
  - Effects
  - Costs
- Use enums/constants for RPG terms.
- Keep logic extensible for:
  - New skills
  - New stats
  - New game modes
- If unsure about implementation:
  - Choose the option that supports future progression systems.

---

## 10. GOLDEN RULE

If there is a choice between:

- A normal app feature
- A game-like interpretation
- A cosmetic or visual reward

ALWAYS choose the option that:

- Reinforces the RPG fantasy
- Rewards learning with progression OR prestige

The player must feel:
"I am becoming stronger — and it shows."

---

## 11. COSMETIC SHOP & AVATAR SYSTEM

This project includes a **cosmetic-only RPG shop**.
Cosmetics must NEVER affect gameplay balance.

---

### Avatar System

- Player creates a **basic avatar on signup**.
- Base avatar includes:
  - Body type
  - Skin tone
  - Hair style
  - Hair color
- Base visuals are intentionally simple.

Progression enhances appearance over time.

---

### Cosmetic Slots

Cosmetics are equipped into slots:

- Head (hats, helmets, crowns)
- Face (masks, glasses, scars)
- Body (robes, armor, outfits)
- Hands (gloves)
- Handheld (swords, books, staffs, keyboards)
- Back (capes, backpacks)
- Background (profile background)
- Frame (avatar border)
- Aura (glow, particles – high rarity only)

Each slot can equip **one cosmetic at a time**.

---

### Currency

- Cosmetics are purchased using **Gold** (or equivalent).
- Gold is earned ONLY through gameplay:
  - Quests
  - Boss fights
  - Skill mastery
  - Combos / Momentum
- Currency is never required for progression.

---

### Rarity System (MANDATORY)

All cosmetics MUST belong to one rarity tier:

| Rarity    | Prestige Level |
| --------- | -------------- |
| Common    | Starter        |
| Uncommon  | Improved       |
| Rare      | Skilled        |
| Epic      | Elite          |
| Legendary | Master         |
| Mythic    | Myth / Godlike |

Rarity affects:

- Visual complexity
- Animations
- Prestige
  NOT gameplay power.

---

### Pricing & Availability

- Prices scale exponentially with rarity.
- Mythic cosmetics:
  - Are limited
  - Often not directly purchasable
  - Tied to events or major achievements

Some cosmetics require:

- Skill mastery
- Boss completion
- Long-term consistency

Gold alone is not always sufficient.

---

### Visual Effects (Allowed)

- Glow
- Particle effects
- Idle animations
- Animated frames
- Aura effects

### Forbidden Effects

- XP boosts
- Stat buffs
- Damage reduction
- Progress acceleration

Cosmetics must remain **purely visual**.

---

### Shop Presentation

- The shop must feel like an **Armory / Relic Vault**.
- Items should feel rare, powerful, and desirable.
- Locked items must clearly explain:
  - What is missing
  - How to unlock them

## END OF INSTRUCTIONS
