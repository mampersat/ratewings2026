# RateWings 🍗

> Discover, review, and rank the best chicken wing spots.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e599?logo=postgresql&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel&logoColor=white)

<!-- Add a screenshot: drop a file at public/screenshot.png and uncomment below -->
<!-- ![RateWings Screenshot](public/screenshot.png) -->

## What is this?

RateWings lets you find chicken wing spots near you, rate them on four dimensions — **Overall, Heat, Crispiness, and Value** — and see how they stack up on a leaderboard. No accounts required; just pick a name and start rating.

## Features

- Browse and filter wing spots by distance, rating, and city
- Rate spots on a 1–10 scale across four categories
- Leaderboard ranked by average overall score
- Admin panel for managing spots, editing ratings, and merging duplicates
- Claim your ratings with a display name — no sign-up required

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon) |
| Hosting | Vercel |

## Local development

**Prerequisites:** Node.js 22+, Docker (for local Postgres)

```bash
# Clone and install
git clone https://github.com/mampersat/ratewings2026.git
cd ratewings2026
npm install

# Start local Postgres
docker run -d --name ratewings-db \
  -e POSTGRES_USER=ratewings \
  -e POSTGRES_PASSWORD=ratewings \
  -e POSTGRES_DB=ratewings \
  -p 5432:5432 postgres:16

# Configure environment
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL

# Run migrations and start
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ADMIN_PASSWORD` | Password for `/admin` |

## Deployment

Deployed automatically to Vercel on push to `main`. The build runs `prisma generate`, `prisma migrate deploy`, then `next build`.
