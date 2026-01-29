PHASE 0: Project Initialization

0.1 Repository & Tooling
	•	Initialize a monorepo (or clearly separated frontend/backend if preferred)
	•	Set up:
	•	Next.js (App Router)
	•	Elysia backend
	•	TypeScript everywhere
	•	Configure ESLint, Prettier
	•	Set up environment variable handling (.env.example)

Goal: Clean, reproducible dev environment.

⸻

PHASE 1: Database & Core Models

1.1 Database Setup
	•	Set up PostgreSQL connection
	•	Integrate Drizzle ORM
	•	Configure Drizzle Kit for migrations

1.2 Core Tables (Minimal Schema)

Create tables for:
	•	Users
	•	UserProgress
	•	Challenges
	•	ChallengeRuns
	•	Skills
	•	SkillUnlocks
	•	Currencies (Bytes, Focus, Commits)
	•	Purchases (paid unlocks)

Goal: Persist progression, skills, economy.

⸻

PHASE 2: Authentication & User Roles

2.1 Authentication
	•	Integrate Better Auth
	•	Implement:
	•	Signup
	•	Login
	•	Logout
	•	Session validation

2.2 Roles
	•	Implement basic role system:
	•	player
	•	admin
	•	Restrict admin routes

Goal: Secure access and future admin tooling.

⸻

PHASE 3: Challenge Definition System

3.1 Challenge Format

Define a JSON-based challenge schema including:
	•	Language
	•	Bug tier (syntax, runtime, etc.)
	•	Starter code
	•	Test cases (visible + hidden)
	•	Server health drain rate
	•	Constraints
	•	Rewards

3.2 Challenge Loader
	•	Load challenges from DB or filesystem
	•	Validate challenge schema at load time

Goal: Data-driven challenges, no hardcoding.

⸻

PHASE 4: Code Editor & Frontend Gameplay UI

4.1 Monaco Editor Integration
	•	Add Monaco Editor
	•	Enable language switching
	•	Load starter code
	•	Capture user edits

4.2 Gameplay UI

Implement:
	•	Server Health Bar (no numeric timer)
	•	Log panel (fake + real logs)
	•	Editor lock on crash
	•	Run / Submit buttons

Goal: Core gameplay loop visible and usable.

⸻

PHASE 5: Server Health (Time) Engine

5.1 Server Health Logic
	•	Implement server health as a value from 0–100
	•	Health decreases continuously per challenge rules
	•	Mistakes accelerate drain
	•	Correct fixes slow drain

5.2 UI State Mapping

Map health to states:
	•	Stable
	•	Warning
	•	Critical

Trigger:
	•	Visual distortion
	•	Log intensity changes
	•	Audio hooks (optional)

5.3 Crash Handling
	•	When health reaches 0:
	•	Show SERVER CRASHED
	•	Lock editor
	•	End run

Goal: Time pressure without timers.

⸻

PHASE 6: Code Execution & Validation

6.1 Sandbox Execution
	•	Set up Docker-based sandbox
	•	Support runtimes:
	•	JS / TS
	•	Python
	•	C / C++
	•	Java
	•	Go
	•	Enforce:
	•	Time limits
	•	Memory limits
	•	No filesystem access
	•	No network access

6.2 Validation Engine
	•	Execute user code against test cases
	•	Compare outputs deterministically
	•	Handle:
	•	Syntax errors
	•	Runtime errors
	•	Timeouts

Goal: Objective, test-based correctness.

⸻

PHASE 7: Skill Tree Engine

7.1 Skill Model

Define skills as:
	•	ID
	•	Cost (Commits)
	•	Prerequisites
	•	Effects

7.2 Unlock Logic
	•	Check prerequisites
	•	Deduct currency
	•	Apply effects

7.3 Skill Effects System

Implement effects that modify:
	•	Server health drain
	•	Allowed actions (undo, hints)
	•	Challenge constraints

Goal: Data-driven progression, no UI dependency.

⸻

PHASE 8: Currency & Economy Engine

8.1 Currency Tracking
	•	Track:
	•	Bytes
	•	Focus
	•	Commits
	•	Persist per user

8.2 Reward Logic
	•	Award currency based on:
	•	Bug tier
	•	Performance
	•	Active modifiers

8.3 Spend Logic
	•	Bytes → per-run boosts
	•	Focus → time control
	•	Commits → permanent unlocks

Goal: Balanced, abuse-resistant economy.

⸻

PHASE 9: Difficulty & Modifiers

9.1 Difficulty Scaling
	•	Increase:
	•	Bug count
	•	Health drain
	•	Constraint severity
	•	Scale automatically with progression

9.2 Optional Modifiers
	•	No syntax highlighting
	•	Limited edits
	•	Fog of code
	•	One-liner fixes

Modifiers increase rewards.

Goal: Player-controlled challenge depth.

⸻

PHASE 10: Admin Dashboard

10.1 Admin UI
	•	View users
	•	Create/edit challenges
	•	Create/edit skills
	•	Enable/disable content

10.2 Access Control
	•	Admin-only routes
	•	Secure API access

Goal: Content control without redeploys.

⸻

PHASE 11: Payments & Access Control

11.1 Free vs Paid Split
	•	Free demo challenges
	•	Paid unlock grants full access

11.2 Polar Integration
	•	One-time purchase
	•	Webhook handling:
	•	Grant access
	•	Handle refunds

Goal: Clean game-style monetization.

⸻

PHASE 12: Observability & Protection

12.1 Logging & Errors
	•	Log executions
	•	Track crashes
	•	Capture validation failures

12.2 Rate Limiting
	•	Limit code submissions
	•	Prevent sandbox abuse

12.3 Monitoring
	•	Health checks
	•	Alerting

Goal: Stability & safety.

⸻

PHASE 13: Deployment & CI/CD

13.1 Deployment
	•	Frontend → Vercel
	•	Backend → DigitalOcean

13.2 CI/CD
	•	Lint
	•	Type check
	•	Build
	•	Deploy

Goal: Repeatable, safe releases.

⸻

FINAL NOTE FOR AGENT IDE

Prioritize correctness, determinism, and safety over UI polish.
Treat this project as a game engine with code-based puzzles, not a tutorial app.
