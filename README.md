# Arbre — RPG Progression Learning Game

Arbre is a **learning-based RPG progression game** where the **Player** clears **Quests**, earns **XP**, unlocks **Skills**, and collects **Cosmetic Relics**. Every action affects progression and power — no corporate dashboards, only game mechanics.

## Core Fantasy

- The Player levels up their mind through Quests.
- Knowledge becomes power, Skills, and progression.
- Rewards grant XP, stats, and prestige cosmetics.
- Cosmetics are visual only — never gameplay power.

## Features

- **Quest Arena** with bug-fix encounters
- **Skill Tree** unlocks with tiered effects
- **Armory / Relic Vault** for cosmetic-only items
- **Sandbox Runner** for safe code execution (Docker or E2B)
- **Stability System** with drain and crash feedback

## Tech Stack

- Next.js (App Router)
- Elysia API
- Drizzle ORM + Postgres
- Monaco Editor
- React Query
- Docker + E2B Sandbox

## Requirements

- Node/Bun
- Postgres
- Docker (for local sandbox)
- Optional: E2B API key

## Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Run migrations:

```bash
bun run db:migrate
```

4. Seed the world:

```bash
bun run db:seed
```

5. Start the game:

```bash
bun run dev
```

## Sandbox Runner (Local)

Build the runner image:

```bash
docker build -t arbre-runner:latest -f docker/runner/Dockerfile .
```

Optional env:

```
SANDBOX_RUNNER_IMAGE=arbre-runner:latest
SANDBOX_ALLOW_LOCAL=true
```

## E2B Sandbox (Optional)

Set:

```
E2B_API_KEY=...
E2B_TEMPLATE=base
```

## Game Terminology

- User → **Player**
- Lesson → **Quest**
- Topic → **Skill**
- Progress → **XP**
- Points → **Skill Points**
- Store → **Armory / Relic Vault**
- Avatar → **Character Vessel**
