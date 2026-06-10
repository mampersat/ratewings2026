---
name: dark-mode-body-bg
description: Page background flips with prefers-color-scheme; use dark: variants on page text
metadata:
  type: project
---

In RateWings, `globals.css` has an **unlayered** `body { background: var(--background) }` rule that overrides the `bg-gray-50` utility on `<body>` (Tailwind v4 utilities sit in cascade layers, unlayered rules win). `--background` is `#ffffff` in light mode and `#0a0a0a` under `@media (prefers-color-scheme: dark)`.

**So the page background is NOT always light — it flips with the OS color scheme.** Any text placed directly on the body must use `dark:` variants (e.g. `text-gray-900 dark:text-[#f4ede2]`), matching the pattern the rest of the app already uses. A fixed dark text color will be invisible in dark mode. Verify with [[visual-verification-method]] — headless chrome defaults to dark; add `--blink-settings=preferredColorScheme=1` to force a light render.
