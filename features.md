# Features

## Core Gameplay
- In-browser code editor with Monaco
- Language switching per challenge
- Starter code loading and edit tracking
- Server health bar with visual states (stable/warning/critical)
- Log panel with real and fake logs
- Editor lock and crash handling on failure
- Run and submit actions with validation results
- Logged-out demo gameplay mode
- Landing page that explains the game
- Demo play page for logged-out users
- Purchase/paywall page
- Auth pages (login/signup)

## Challenges
- JSON-based challenge schema
- Visible and hidden test cases
- Per-challenge constraints and rewards
- Challenge loader from DB or filesystem

## Server Health Engine
- Continuous health drain per challenge
- Mistake-accelerated drain and corrective slowdown
- Health state mapping to UI effects

## Code Execution & Validation
- Docker-based sandbox execution
- Multi-language runtimes (JS/TS, Python, C/C++, Java, Go)
- Time/memory limits, no filesystem/network access
- Deterministic test validation (syntax/runtime/timeout handling)

## Skill Tree & Progression
- Skill model with prerequisites and effects
- One-time unlocks and multi-tier upgrades
- Skills that modify health drain, edits, hints, logs, rewards
- Sample catalog for gameplay-focused traits

## Economy
- Bytes, Focus, Commits currencies
- Reward logic based on performance and modifiers
- Spend logic for boosts and permanent unlocks

## Difficulty & Modifiers
- Automatic difficulty scaling
- Optional modifiers (fog, limited edits, one-liner fixes)

## Authentication & Roles
- Better Auth integration (sessions, login/signup/logout)
- Role-based access (player/admin)
- Session validation and CSRF protection

## Admin & Content Management
- Admin dashboard for users, challenges, skills
- Admin-only routes and API access control
- Admin audit logging

## Payments & Access Control
- Free vs paid content split
- Polar one-time purchase flow
- Webhook handling for grants/refunds
- Demo access for guests; full game after purchase

## Performance & Caching
- Redis-based server cache with TTLs and invalidation
- Client-side caching via TanStack Query (CSR)
- Query/index optimization for hot paths
n
## Observability & Protection
- Execution logs and crash tracking
- Validation failure tracking
- Rate limiting for submissions
- Monitoring, health checks, and backups

## Deployment
- Frontend deployment on Vercel
- CI/CD for lint, type check, tests, build, deploy
