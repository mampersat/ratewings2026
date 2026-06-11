---
name: local-dev-targets-prod-db
description: .env.local DATABASE_URL points at the PROD Neon DB, not localhost
metadata:
  type: project
---

In this repo, `.env.local`'s `DATABASE_URL` points at the **production Neon** database (endpoint `ep-royal-morning-anhq4a8a`, role `neondb_owner`, db `neondb`) — NOT the localhost Postgres that CLAUDE.md's dev-workflow section implies. So `npm run dev` and any Prisma/psql command run locally hit PROD.

**Be careful:** destructive DB operations run locally (migrations, seeds, `sync-db-to-prod.sh`, manual SQL) affect real production data. Confirm before running anything that writes/drops.

Also: `.claude/settings.local.json` is now gitignored (it once leaked a prod DB password committed into permission rules — rotated 2026-06-09). Never put secrets in permission-rule strings.
