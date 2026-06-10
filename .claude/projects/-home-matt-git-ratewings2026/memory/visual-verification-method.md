---
name: visual-verification-method
description: How to screenshot RateWings UI for visual verification (no Playwright installed)
metadata:
  type: reference
---

To visually verify frontend changes in RateWings: Playwright/Puppeteer are NOT installed, but `/usr/bin/google-chrome` is. With `npm run dev` running on :3000, screenshot headless:

`google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=390,1400 --screenshot=/tmp/out.png "http://localhost:3000/<path>"`

Use width 390 for mobile-first checks, ~900 for desktop. Find a real spot id from `curl -s localhost:3000/spots | grep -oE '/spots/[A-Za-z0-9]+'`. No local Postgres by default — the running dev server is already wired to a DB when the user starts it.
