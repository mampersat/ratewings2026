# RateWings — CLAUDE.md

## Project overview
RateWings is a Next.js + TypeScript app for discovering, reviewing, and ranking chicken wing spots.

## Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **ORM**: Prisma 7 (PostgreSQL)
- **Runtime**: Node.js 22+

## Conventions

### File structure
- Pages live in `src/app/` (App Router)
- Shared UI components in `src/components/`
- DB client singleton in `src/lib/db.ts`
- Shared TypeScript types in `src/types/index.ts`
- Prisma schema in `prisma/schema.prisma`

### Data fetching
- Prefer server components for data fetching — keep async DB calls in page files, not components.
- Use `export const dynamic = "force-dynamic"` on pages that read live data.
- API routes in `src/app/api/` are for client-side mutations only (POST/PUT/DELETE).

### Styling
- Use Tailwind utility classes. No CSS modules or custom stylesheets beyond `globals.css`.
- Orange-500 is the brand accent color.
- Mobile-first: design for small screens first, add `sm:`/`lg:` breakpoints as needed.

### Database
- All DB access goes through the singleton in `src/lib/db.ts`.
- Never import `PrismaClient` directly in page or component files.
- Migrations live in `prisma/migrations/`. Always commit migration files.
- Run `npx prisma migrate dev` to apply schema changes locally.
- Run `npx prisma generate` after changing `schema.prisma` to update the client.
- **Prisma 7 note**: the DB URL lives in `prisma.config.ts` (for migrations). The runtime client uses `@prisma/adapter-pg` — import from `@/generated/prisma/client`, not `@prisma/client`.

### Auth (not yet implemented)
- Auth is intentionally deferred to v2. A placeholder `userId` string is used in the rating form.
- When adding auth, use Next.js middleware + session cookies. Do not use third-party auth services without discussion.

## Environment variables
Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` — Postgres connection string (local: `postgresql://ratewings:ratewings@localhost:5432/ratewings`)
- `ADMIN_PASSWORD` — Password for `/admin` (defaults to `"admin"` if unset)
- `PROD_DB_URL` — Production Railway DB URL (used by sync script only)

## Deployment
- **Platform**: Railway
- **Database**: PostgreSQL hosted on Railway
- To get the production `DATABASE_URL`, run: `railway variables` (requires Railway CLI + login)
- To run migrations against production: `DATABASE_URL=<prod-url> npx prisma migrate deploy`
- To import seed data against production: `DATABASE_URL=<prod-url> python3 scripts/import-wings-db.py`
- To sync local DB → prod (destructive): `./scripts/sync-db-to-prod.sh` (reads `PROD_DB_URL` from `.env.local`)

## Dev workflow
```bash
# Install dependencies
npm install

# Start local Postgres (Docker)
docker run -d --name ratewings-db -e POSTGRES_USER=ratewings -e POSTGRES_PASSWORD=ratewings -e POSTGRES_DB=ratewings -p 5432:5432 postgres:16

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

## Things to avoid
- Do not add AI/LLM features without discussion.
- Do not over-abstract — prefer a bit of duplication over a premature utility.
- Do not add external auth libraries (NextAuth, Clerk, etc.) without prior agreement.
- Do not use `any` types.
