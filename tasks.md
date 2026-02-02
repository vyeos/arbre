# Gameplay Flow Implementation Tasks

## Phase A — Core State Model

- [x] Define Quest state enum: ACTIVE / COMPLETED / LOCKED / SKIPPED
- [x] Persist Quest state per Player (demo uses in-memory)
- [x] Enforce: only ACTIVE Quests are playable
- [x] Enforce: COMPLETED Quests are read-only
- [x] Enforce: LOCKED Quests are inaccessible
- [x] Enforce: SKIPPED Quests are visible and queued for return

## Phase B — Initial State & Quest 1 Drop

- [x] Spawn new Player directly into Quest 1
- [x] Hide menus at start of Quest 1
- [x] Ensure all currencies start at 0
- [x] Ensure no Skills unlocked at start

## Phase C — Onboarding Dialogs (Quest 1)

- [x] Floating dialog: editor basics
- [x] Floating dialog: bug exists in code
- [x] Floating dialog: Server Health drain
- [x] Floating dialog: success vs crash
- [x] Dialogs pause gameplay
- [x] Dialogs are shown only once
- [x] No static tutorial pages

## Phase D — Quest Mechanics

- [x] Server Health drains over time
- [x] Validate code for success
- [x] Crash when Server Health hits 0
- [x] Show SERVER CRASHED state
- [x] Allow retry only on ACTIVE Quests

## Phase E — Rewards & Completion

- [x] Award Bytes / Focus / Commits on success
- [x] Show reward animation
- [x] Mark Quest as COMPLETED
- [x] Lock Quest from replay

## Phase F — Completed Quest Review

- [x] Display COMPLETED badge
- [x] Read-only editor
- [x] Show final corrected code
- [x] Disable run/submit
- [x] Disable Server Health
- [x] Show tooltip: “This quest has already been resolved. You may review it, but not modify it.”

## Phase G — Skill Tree Introduction Gate

- [x] Auto-open Skill Tree after first Quest success
- [x] Floating dialog: Skills, costs, active vs passive
- [x] Require at least one Skill purchase to proceed
- [x] Apply Skill effects immediately
- [x] Prevent Skill resets

## Phase H — Skill Effects in Gameplay

- [x] Apply Server Health drain modifiers
- [ ] Unlock actions (undo, hints, dry run)
- [ ] Reduce penalties
- [ ] Modify challenge constraints

## Phase I — Quest Progression

- [x] Unlock next Quest after Skill purchase
- [x] Gradually increase difficulty
- [x] Unlock new bug tiers over time
- [x] Introduce Gold after ~3 Quests

## Phase J — Cosmetic Introduction

- [x] On first Gold earned, show Armory intro dialog
- [ ] Cosmetic catalog: Vessel skins, UI effects, editor themes
- [x] Cosmetics are visual only (no gameplay impact)

## Phase K — Skip Quest System

- [x] Add Skip Quest button (ACTIVE only)
- [x] Spend Bytes to skip (configurable cost)
- [x] Mark Quest as SKIPPED
- [x] Advance to next Quest immediately
- [x] Re-queue skipped Quest after next Quest is cleared
- [x] Prevent SKIPPED from counting as COMPLETED
- [x] Show SKIPPED badge in Quest selector
- [x] Tooltip: “Skipped Quests must be cleared later.”

## Phase L — Demo Player vs Logged-In Player

- [x] Demo Player: limited Quest count
- [x] Demo Player: can earn currency
- [x] Demo Player: can buy Skills and Cosmetics
- [x] Demo Player: progress resets on exit
- [x] Show dialog: persistence requires login
- [x] Logged-In Player: full access, same rules, saved progress

## Phase M — UI State Transitions

- [x] Landing → Demo or Login
- [x] Quest 1 → Onboarding dialogs → Play
- [x] Crash → Retry same Quest
- [x] Success → Rewards → Skill Tree Gate
- [x] Skill purchase → Unlock Quest 2
- [x] Completed Quest → Read-only review
- [x] Skipped Quest → Marked and queued for return
- [x] First Gold → Armory intro

## Phase 0 — Project Initialization

- [x] Add ESLint + Prettier config
- [x] Add .env.example with required vars list
- [x] Add lint-staged + pre-commit hook
- [x] Add testing scaffolding (unit/integration/e2e)

## Phase 1 — Database & Core Models

- [x] Add docker-compose for local Postgres
- [x] Configure Drizzle ORM + Drizzle Kit
- [x] Create migrations workflow and rollback policy
- [x] Add seed script + baseline seed data
- [x] Define schema for Better Auth tables
- [x] Define core tables: UserProgress, Challenges, ChallengeRuns
- [x] Define skills/economy tables: Skills, SkillUnlocks, Currencies
- [x] Define Purchases + AdminAuditLogs

## Phase 2 — Authentication & Roles

- [x] Integrate Better Auth
- [x] Implement signup/login/logout
- [x] Implement session validation + cookie policy
- [x] Add password policy + email verification
- [x] Add CSRF protection for state-changing routes
- [x] Add role system (player/admin) + route guards
- [x] Add admin action audit logging

## Phase 3 — API Contract & Type Sharing

- [x] Define API routes and schemas in Elysia
- [x] Standardize error shapes
- [x] Add request/response runtime validation
- [x] Create shared types package
- [x] Export Drizzle types where needed

## Phase 4 — Challenge Definition System

- [x] Define challenge JSON schema
- [x] Implement schema validation
- [x] Implement loader (DB/filesystem)
- [x] Add challenge seed data

## Phase 5 — Code Editor & Gameplay UI

- [x] Integrate Monaco Editor
- [x] Enable language switching per challenge
- [x] Load starter code
- [x] Implement server health bar
- [x] Add log panel (real + fake logs)
- [x] Add Run/Submit buttons
- [x] Lock editor on crash
- [x] Add logged-out demo gameplay mode
- [x] Create landing page (game overview)
- [x] Create demo play page (logged-out)
- [x] Create purchase/paywall page
- [x] Modify auth pages (login/signup) if needed
- [x] Add Tutorial Quest (guided gameplay + Codex text) after UI is complete

## Phase 6 — Server Health Engine

- [x] Implement continuous health drain
- [x] Add skill-based drain modifiers
- [x] Map health to UI states
- [x] Add crash handling flow

## Phase 7 — Code Execution & Validation

- [x] Build Docker-based sandbox runner
- [x] Support JS/TS, Python, C/C++, Java, Go
- [x] Enforce time/memory limits
- [x] Block filesystem and network
- [x] Add container hardening (seccomp/AppArmor)
- [x] Implement deterministic test validator
- [x] Handle syntax/runtime/timeout errors

## Phase 8 — Skill Tree Engine

- [x] Define skill model + prerequisites
- [x] Implement unlock/spend logic
- [x] Implement effects system
- [x] Populate initial skill catalog (one-time + upgradeable)

## Phase 9 — Currency & Economy

- [x] Implement currency tracking (Bytes/Focus/Commits)
- [x] Implement reward logic per performance/modifiers
- [x] Implement spend logic for boosts/unlocks

## Phase 9.5 — Armory & Character Vessel Progression

- [x] Add Character Vessel creation at signup (body type, skin tone, hair style, hair color, optional eye style)
- [x] Define Relic slots and binding rules (one bound Relic per slot)
- [x] Add Gold economy path for cosmetics only (no real-money purchase)
- [x] Define rarity tiers, pricing curve, and Sealed unlock requirements
- [x] Build Armory / Relic Vault UI with Sealed Relic messaging
- [x] Add cosmetic catalog and Acquire / Bind flow
- [x] Enforce cosmetics as visual-only (no gameplay effects)

## Phase 10 — Difficulty & Modifiers

- [x] Implement difficulty scaling
- [x] Implement modifiers (fog, limited edits, one-liner, etc.)

## Phase 11 — Cache Storage & Performance

- [x] Add Redis cache layer
- [x] Define keys/TTLs/namespaces
- [x] Implement cache invalidation
- [x] Add TanStack Query for client caching
- [x] Add indexes and hot-path query tuning

## Phase 12 — Admin Dashboard

- [x] Build admin UI for users/challenges/skills
- [x] Add admin-only route protection
- [x] Secure admin API endpoints

## Phase 13 — Payments & Access Control

- [ ] Implement free vs paid gating
- [ ] Allow demo gameplay for logged-out users
- [ ] Integrate Polar purchase flow
- [ ] Handle webhook grants/refunds
- [ ] Unlock full game after purchase

## Phase 14 — Observability & Protection

- [ ] Add execution logging
- [ ] Track crashes and validation failures
- [ ] Add rate limiting for submissions
- [ ] Add autencication/authorizations checks from frontend and backend
- [ ] Add monitoring + health checks
- [ ] Add DB backups + retention policy

## Phase 15 — Deployment & CI/CD

- [ ] Deploy frontend on Vercel
- [ ] Configure CI: lint, typecheck, tests, build
- [ ] Configure deploy workflow
