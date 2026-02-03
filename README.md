This is my attempt to completely vibe code an app.
**It is a complete failure**.
Sure the ui looks nice. Who made it? Opus.
The code looks readable. Who wrote it? Codex.
In this project, my job was to just create a skill tree based game like learning platform where any one can learn to code and actually have fun.
The idea seems good but the vendors are a lot.

1. Database - Supabase
2. Code Editor - Monaco
3. Sandbox - Docker(local)/E2B(deploy)
4. Deployment - Vercel

And the hardest part in all of this was that, I had to think about what the game will offer. What quests, what skills, what rewards, how to give them, how to manage the customizable avatar, how to manage relics (just cosmetics - put in the game because i wanted to).

There are a lot of things that are hard in this. I could have been solved them if i wrote the code. But lengthy AI code is always trash. So the whole code for this website is a piece of shit.

This can a good project if someone is willing to make it. I would be glad to help you make what I can't.

After this experiment, I realised one thing. AI will take our jobs, but not yet. It simply doesn't have the brains to do it. So until then, devs have to churn out quality code right from their 8-10 fingrers (how ever many you use for typing).

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
