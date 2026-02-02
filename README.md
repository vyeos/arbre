# Arbre — Core Gameplay Flow

This is a learning-based RPG progression game. The Player grows through Quests, Skills, and earned power. There are no traditional tutorials, no AI assistance, and no replay farming.

## Core Philosophy

- Game first; learning is implicit.
- No tutorial pages. Only floating dialog moments.
- Progression is linear; Skills branch.
- Completed Quests are viewable, never replayable.

## System State Model

Each Quest is always in one state:

- **ACTIVE**: Playable
- **COMPLETED**: Read-only review
- **LOCKED**: Inaccessible
- **SKIPPED**: Temporarily bypassed, returns to queue later

## Text-Based Game State Diagram

```
[Landing]
   |
   |--(Logged-In Player)--> [Quest 1]

[Quest 1]
   |--(Success)--> [Rewards] --> [Skill Tree Intro] --> [Skill Purchase Gate] --> [Quest 2]
   |--(Crash)----> [Server Crashed] --> [Retry Quest 1]
   |--(Skip)-----> [Quest 2] + [Quest 1 = SKIPPED]

[Quest N]
   |--(Success)--> [Rewards] --> [Unlock Quest N+1]
   |--(Crash)----> [Server Crashed] --> [Retry Quest N]
   |--(Skip)-----> [Quest N+1] + [Quest N = SKIPPED]

[Quest Completed]
   |--(Open)--> [Read-Only Review]

[Skipped Quest]
   |--(Return Later)--> [ACTIVE]
```

## Quest Lifecycle

**Start** → **Onboarding Dialogs** → **Play** → **Validate** → **Success/Crash/Skip** → **Transition**

### Start

- Player spawns directly into Quest 1.
- No menus visible.

### Onboarding Dialogs (Quest 1 only)

Floating dialogs pause gameplay and appear contextually:

1. Code editor basics
2. Bug exists in the code
3. Server Health drain and pressure
4. Success vs Crash

Dialogs are shown once and never again.

### Play

- Buggy code + validation runner
- Server Health drains over time

### Success

- Grant Bytes / Focus / Commits immediately
- Reward animation
- Mark Quest as COMPLETED
- Lock Quest from replay

### Failure

- Server Health reaches 0 → **SERVER CRASHED**
- Quest stays ACTIVE; Player can retry

### Skip

- Player spends Bytes to skip the current Quest
- Quest state becomes **SKIPPED**
- Next Quest becomes **ACTIVE**
- Skipped Quest returns to the queue after the next Quest is cleared
- Skipped Quests are visible in the Quest selector and clearly marked

## Skip Rules (Mandatory)

- Skipping costs **Bytes** (economy sink)
- Skipped Quests cannot be marked COMPLETED via skip
- A skipped Quest can only be cleared by returning and solving it
- Skipping is allowed only when the Quest is ACTIVE
- Skipped Quests must be reintroduced (no permanent bypass)

## Completed Quest Rules (Read-Only)

- Visually marked **COMPLETED**
- Opens in **read-only**
- Final corrected code shown
- Disabled: editing, running, Server Health, rewards
- Tooltip: “This quest has already been resolved. You may review it, but not modify it.”

## Skill Tree Interaction Flow

After first Quest success:

- Skill Tree auto-opens
- Floating dialog explains:
  - What Skills are
  - Currency costs
  - Active vs passive effects
- Player must purchase at least one Skill to proceed
- Skill effects apply immediately and persist
- Skills are permanent; no resets

## Skill Effects in Gameplay

Skills can:

- Modify Server Health drain
- Unlock actions (undo, hints, dry run)
- Reduce penalties
- Modify challenge constraints

## Quest Progression

- After Skill purchase, unlock next Quest
- Difficulty increases gradually
- New bug tiers unlock over time
- After ~3 Quests, introduce cosmetic currency (Gold)

## Cosmetic Shop Introduction

On first Gold earned:

- Floating dialog introduces the Armory / Relic Vault
- Cosmetics include Character Vessel skins, UI effects, editor themes
- Cosmetics are visual only, no gameplay impact

## Player State

### Logged-In Player

- Full access to all systems
- Progress is saved

## UI States & Transitions

1. **Landing** → Login
2. **Quest 1** (no menus) → Onboarding dialogs → Play
3. **Server Crashed** → Retry Quest
4. **Quest Success** → Reward animation
5. **Skill Tree Intro** → Skill Purchase Gate
6. **Quest 2+** → Normal loop
7. **Completed Quest Review** (read-only)
8. **Skipped Quest** → Marked and queued for return
9. **Armory Intro** on first Gold

## Strict Rules

- No replaying Quests for rewards
- No editing completed Quests
- No skipping Skill Tree introduction
- No direct access to locked Quests
- No traditional level select UI
- All onboarding via floating dialogs only

## Goal

Progression feels earned. Power is visible. Learning is accidental.

## Completed Quest Rules (Read-Only)

- Visually marked **COMPLETED**
- Opens in **read-only**
- Final corrected code shown
- Disabled: editing, running, Server Health, rewards
- Tooltip: “This quest has already been resolved. You may review it, but not modify it.”

## Skill Tree Interaction Flow

After first Quest success:

- Skill Tree auto-opens
- Floating dialog explains:
  - What Skills are
  - Currency costs
  - Active vs passive effects
- Player must purchase at least one Skill to proceed
- Skill effects apply immediately and persist
- Skills are permanent; no resets

## Skill Effects in Gameplay

Skills can:

- Modify Server Health drain
- Unlock actions (undo, hints, dry run)
- Reduce penalties
- Modify challenge constraints

## Quest Progression

- After Skill purchase, unlock next Quest
- Difficulty increases gradually
- New bug tiers unlock over time
- After ~3 Quests, introduce cosmetic currency (Gold)

## Cosmetic Shop Introduction

On first Gold earned:

- Floating dialog introduces the Armory / Relic Vault
- Cosmetics include Character Vessel skins, UI effects, editor themes
- Cosmetics are visual only, no gameplay impact

## Player States

### Demo Player (Logged-Out)

- Can play limited Quests
- Can earn currency
- Can buy Skills and Cosmetics
- Progress is not saved
- Must show dialog: progress resets on exit; full access requires login
- Gameplay rules identical to full game

### Logged-In Player

- Full access to all systems
- Progress is saved
- No advantages over Demo beyond persistence

## UI States & Transitions

1. **Landing** → Demo or Login
2. **Quest 1** (no menus) → Onboarding dialogs → Play
3. **Server Crashed** → Retry Quest
4. **Quest Success** → Reward animation
5. **Skill Tree Intro** → Skill Purchase Gate
6. **Quest 2+** → Normal loop
7. **Completed Quest Review** (read-only)
8. **Armory Intro** on first Gold

## Strict Rules

- No replaying Quests for rewards
- No editing completed Quests
- No skipping Skill Tree introduction
- No direct access to locked Quests
- No traditional level select UI
- All onboarding via floating dialogs only

## Goal

Progression feels earned. Power is visible. Learning is accidental.PHASE 0: Project Initialization

0.1 Repository & Tooling
• Set up:
• Next.js (App Router)
• Elysia backend
• TypeScript everywhere
• Configure ESLint, Prettier
• Set up environment variable handling (.env.example) with required vars list
• Define local/dev/prod config split and secrets handling
• Add commit hooks (lint-staged)
• Testing scaffolding (unit/integration/e2e placeholders)

Goal: Clean, reproducible dev environment.

⸻

PHASE 1: Database & Core Models

1.1 Database Setup
• Set up PostgreSQL connection
• Integrate Drizzle ORM
• Configure Drizzle Kit for migrations
• Add docker-compose for local Postgres
• Add seed scripts and baseline seed data
• Define migration rollback policy

1.2 Core Tables (Minimal Schema)

Create tables for:
• Better Auth tables (users, accounts, sessions, verification tokens, authenticators if using passkeys)
• UserProgress
• Challenges
• ChallengeRuns
• Skills
• SkillUnlocks
• Currencies (Bytes, Focus, Commits)
• Purchases (paid unlocks)
• AdminAuditLogs

Goal: Persist progression, skills, economy, and auth state.

⸻

PHASE 2: Authentication & User Roles

2.1 Authentication
• Integrate Better Auth
• Implement:
• Signup
• Login
• Logout
• Session validation
• Session storage and cookie policy
• Password policy and email verification
• CSRF protection for state-changing routes

2.2 Roles
• Implement basic role system:
• player
• admin
• Restrict admin routes
• Audit admin actions

Goal: Secure access and future admin tooling.

⸻

PHASE 3: API Contract & Type Sharing

3.1 API Contract
• Define Elysia routes with request/response schemas
• Versioning strategy
• Standardize error shapes
• Runtime validation at the boundary

3.2 Type Sharing
• Shared types package for frontend/backend
• Export Drizzle schema types where needed

Goal: Stable contracts and safe type sharing.

⸻

PHASE 4: Challenge Definition System

4.1 Challenge Format

Define a JSON-based challenge schema including:
• Language
• Bug tier (syntax, runtime, etc.)
• Starter code
• Test cases (visible + hidden)
• Server health drain rate
• Constraints
• Rewards
• Codex link (free docs resource to encourage reading manuals)

4.2 Challenge Loader
• Load challenges from DB or filesystem
• Validate challenge schema at load time

Goal: Data-driven challenges, no hardcoding.

⸻

PHASE 5: Code Editor & Frontend Gameplay UI

5.1 Monaco Editor Integration
• Add Monaco Editor
• Allow language switching.
• Load starter code
• Capture user edits

5.2 Gameplay UI

Implement:
• Server Health Bar (no numeric timer)
• Log panel (fake + real logs)
• Editor lock on crash
• Run / Submit buttons
• Guest demo gameplay (logged-out)
• Landing page (game overview)
• Demo play page (logged-out)
• Purchase page (paywall)
• Auth pages (login/signup)

Goal: Core gameplay loop visible and usable.

⸻

PHASE 6: Server Health (Time) Engine

6.1 Server Health Logic
• Implement server health as a value from 0–100
• Health decreases continuously
• Drain can be reduced by buying updrades in the skill tree

6.2 UI State Mapping

Map health to states:
• Stable
• Warning
• Critical

Trigger:
• Visual distortion
• Log intensity changes
• Audio hooks

6.3 Crash Handling
• When health reaches 0:
• Show SERVER CRASHED
• Lock editor
• End run

Goal: Time pressure without timers.

⸻

PHASE 7: Code Execution & Validation

7.1 Sandbox Execution
• Set up Docker-based sandbox
• Support runtimes:
• JS / TS
• Python
• C / C++
• Java
• Go
• Enforce:
• Time limits
• Memory limits
• No filesystem access
• No network access
• Harden containers (seccomp/AppArmor)

Runtime Notes:
• The sandbox runner requires a local Docker daemon.
• Build the runner image before calling the execute endpoint:
docker build -t arbre-runner:latest -f docker/runner/Dockerfile .
• Set SANDBOX_RUNNER_IMAGE if you use a different tag.

7.2 Validation Engine
• Execute user code against test cases
• Compare outputs deterministically
• Handle:
• Syntax errors
• Runtime errors
• Timeouts

Goal: Objective, test-based correctness.

⸻

PHASE 8: Skill Tree Engine

8.1 Skill Model

Define skills as:
• ID
• Cost (Commits)
• Prerequisites
• Effects

8.2 Unlock Logic
• Check prerequisites
• Deduct currency
• Apply effects

8.3 Skill Effects System

Implement effects that modify:
• Server health drain
• Allowed actions (undo, hints)
• Challenge constraints

8.4 Skill Catalog

One-time unlocks:
• Extra Edit → One extra keystroke beyond limit
• Fog Pierce → Reveal hidden lines briefly
• Multi-Line Patch → Break “one-line fix” rule once
• Precision Bonus → No undo → bonus Focus
• Ghost Fix → First fix doesn’t consume edits
• Crash Shield → Survive one crash and keep editor open
• Hint Pulse → Reveal one hidden hint per run
• Constraint Lens → Show which constraint failed
• Log Silence → Mute fake logs during runs
• Rollback Token → Refund one failed run’s Focus cost

Upgradeable (5–10 tiers):
• Efficient Fixer → +20% Bytes on clean runs (scales per tier)
• Self-Healing Server → Health regenerates slowly over time
• Performance Tuner → O(n²) penalties reduced
• Stability Buffer → Slower health drain at low health
• Error Diffuser → Fewer penalties for runtime errors
• Quick Compile → Reduced compile/validation time
• Focus Saver → Lower Focus cost for retries
• Commit Amplifier → +% Commits on first-try solves
• Edit Budget → +N edits per tier
• Log Clarity → Increase signal in real logs

Goal: Data-driven progression, no UI dependency.

⸻

PHASE 9: Currency & Economy Engine

9.1 Currency Tracking
• Track: Bytes, Focus, Commits
• Persist per user

9.2 Reward Logic
• Award currency based on:
• Bug tier
• Performance
• Active modifiers

9.3 Spend Logic
• Bytes → per-run boosts
• Focus → time control (in skill tree)
• Commits → permanent unlocks (in skill tree)

Goal: Balanced, abuse-resistant economy.

⸻

PHASE 9.5: Armory & Character Vessel Progression

9.5.1 Character Vessel (Base)
• Player creates a basic Character Vessel at signup:
• Body type
• Skin tone
• Hair style
• Hair color
• Eye style (optional)
• Base visuals are intentionally simple.

9.5.2 Relic Slots (Cosmetics)
• Head
• Face
• Body
• Hands
• Handheld
• Back
• Background
• Frame
• Aura (high rarity only)
• One bound Relic per slot.

9.5.3 Gold Economy (Cosmetics Only)
• Gold is earned through Quests, boss fights, Skill mastery, and Combos/Momentum.
• Gold is never purchasable with real money.
• Gold is used to Acquire cosmetics only.

9.5.4 Rarity & Prestige
• Common, Uncommon, Rare, Epic, Legendary, Mythic.
• Rarity affects visuals, animation, prestige only.
• Rarity never affects gameplay stats.

9.5.5 Sealed Relics & Unlock Conditions
• Prices scale exponentially with rarity.
• Legendary Relics require Skill mastery.
• Mythic Relics are limited and tied to boss victories or events.
• Sealed Relics clearly explain unlock requirements.

9.5.6 Armory Experience
• The shop is an Armory / Relic Vault.
• Use Acquire / Bind / Sealed language in all UI.

Goal: Visual progression that reflects mastery and dedication.

⸻

PHASE 10: Difficulty & Modifiers

10.1 Difficulty Scaling
• Increase:
• Bug count
• Health drain
• Constraint severity
• Scale automatically with progression

10.2 Optional Modifiers
• No syntax highlighting
• Limited edits
• Fog of code
• One-liner fixes

Modifiers increase rewards.

Goal: Player-controlled challenge depth.

⸻

PHASE 11: Cache Storage & Performance

11.1 Cache Storage
• Introduce Redis (or equivalent) for cache storage
• Define cache keys, TTLs, and namespaces
• Cache high-read entities (challenges, skill trees, user state)
• Write-through or cache-aside strategy
• Cache invalidation plan on writes
• Client-side caching with TanStack Query for CSR

11.2 Query Optimization
• Add indexes for hot paths
• Use read-optimized views/materialized aggregates where needed
• Warm caches for popular content

Goal: Minimize DB queries and latency at scale.

⸻

PHASE 12: Admin Dashboard

12.1 Admin UI
• View users
• Create/edit challenges
• Create/edit skills
• Enable/disable content

12.2 Access Control
• Admin-only routes
• Secure API access

Goal: Content control without redeploys.

⸻

PHASE 13: Payments & Access Control

13.1 Free vs Paid Split
• Free demo challenges
• Logged-out demo gameplay access
• Paid unlock grants full access

13.2 Polar Integration
• One-time purchase
• Webhook handling:
• Grant access
• Handle refunds

Goal: Clean game-style monetization.

⸻

PHASE 14: Observability & Protection

14.1 Logging & Errors
• Log executions
• Track crashes
• Capture validation failures
• Audit admin actions

14.2 Rate Limiting & Abuse Prevention
• Limit code submissions per user/IP
• Protect sandbox endpoints
• Validate requests at API boundaries

14.3 Monitoring & Backups
• Health checks
• Alerting
• DB backups and retention policy

Goal: Stability & safety.

⸻

PHASE 15: Deployment & CI/CD

15.1 Deployment
• Frontend → Vercel

15.2 CI/CD
• Lint
• Type check
• Unit/integration tests
• Build
• Deploy

Goal: Repeatable, safe releases.

⸻

FINAL NOTE FOR AGENT IDE

Prioritize correctness, determinism, and safety over UI polish.
Treat this project as a game engine with code-based puzzles, not a tutorial app.
