# Database Workflow

## Local Development

- Start Postgres: `docker-compose up -d`
- Set `DATABASE_URL` in `.env.local`

## Migrations

- Generate migrations: `bun run db:generate`
- Apply migrations: `bun run db:migrate`

## Rollback Policy

- Drizzle migrations are forward-only.
- To rollback, create a new migration that reverses the change.
- Always take a DB backup before applying migrations in production.

## Seeding

- Run baseline seed: `bun run db:seed`
