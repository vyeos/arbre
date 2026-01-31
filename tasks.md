# Tasks

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

- [ ] Build Docker-based sandbox runner
- [ ] Support JS/TS, Python, C/C++, Java, Go
- [ ] Enforce time/memory limits
- [ ] Block filesystem and network
- [ ] Add container hardening (seccomp/AppArmor)
- [ ] Implement deterministic test validator
- [ ] Handle syntax/runtime/timeout errors

## Phase 8 — Skill Tree Engine

- [ ] Define skill model + prerequisites
- [ ] Implement unlock/spend logic
- [ ] Implement effects system
- [ ] Populate initial skill catalog (one-time + upgradeable)

## Phase 9 — Currency & Economy

- [ ] Implement currency tracking (Bytes/Focus/Commits)
- [ ] Implement reward logic per performance/modifiers
- [ ] Implement spend logic for boosts/unlocks

## Phase 9.5 — Armory & Character Vessel Progression

- [ ] Add Character Vessel creation at signup (body type, skin tone, hair style, hair color, optional eye style)
- [ ] Define Relic slots and binding rules (one bound Relic per slot)
- [ ] Add Gold economy path for cosmetics only (no real-money purchase)
- [ ] Define rarity tiers, pricing curve, and Sealed unlock requirements
- [ ] Build Armory / Relic Vault UI with Sealed Relic messaging
- [ ] Add cosmetic catalog and Acquire / Bind flow
- [ ] Enforce cosmetics as visual-only (no gameplay effects)

## Phase 10 — Difficulty & Modifiers

- [ ] Implement difficulty scaling
- [ ] Implement modifiers (fog, limited edits, one-liner, etc.)

## Phase 11 — Cache Storage & Performance

- [ ] Add Redis cache layer
- [ ] Define keys/TTLs/namespaces
- [ ] Implement cache invalidation
- [ ] Add TanStack Query for client caching
- [ ] Add indexes and hot-path query tuning

## Phase 12 — Admin Dashboard

- [ ] Build admin UI for users/challenges/skills
- [ ] Add admin-only route protection
- [ ] Secure admin API endpoints

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
- [ ] Add monitoring + health checks
- [ ] Add DB backups + retention policy

## Phase 15 — Deployment & CI/CD

- [ ] Deploy frontend on Vercel
- [ ] Configure CI: lint, typecheck, tests, build
- [ ] Configure deploy workflow
