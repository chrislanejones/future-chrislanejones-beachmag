# Chapter 8: Testing and dependencies

[Book contents](../../README.md) · [Project home](../../../README.md) · [Previous chapter](../07-seo/README.md) · [Next chapter](../09-deployment/README.md)

## Local quality gates

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm run lint
pnpm run test
pnpm run build
```

The tests cover backend authorization and rate limits, blog sanitization, project helpers and the sandcastle model. A test pass is not a replacement for checking browser behavior: verify navigation, both themes, search, an empty search result, and the changed interactive controls. Test upload/admin changes using an owner account in the intended environment.

If diagnosing bundler behavior, `pnpm exec next build --webpack` is an explicit alternative. Production builds need valid frontend configuration and access to the selected Convex deployment. Building the frontend does not deploy backend functions.

## Accessibility checks

Start the site with `pnpm run dev`, then run `pnpm run check:a11y`. On a new machine, install the test browser first with `pnpm exec playwright install chromium`.

The Playwright/axe audit checks 18 public routes in desktop and mobile viewports, each in light and dark mode, using WCAG A/AA rules through 2.2. It also detects page-level horizontal overflow. Results, including incomplete checks that require review, are written to ignored `output/accessibility/report.json`. The only excluded element is Next.js's development toolbar.

Override `A11Y_BASE_URL` to scan a deployed site, `A11Y_PATHS` for comma-separated paths, `A11Y_MODES` for comma-separated modes (`desktop-light`, `desktop-dark`, `mobile-light`, `mobile-dark`), and `A11Y_OUTPUT` for the report path.

On October 26, 2026, all 72 page/theme checks passed after correcting the calendar's accessible button labels and group semantics. Playwright MCP also verified mobile menu initial focus, forward/reverse focus containment and Escape restoration; desktop dropdown keyboard operation; skip-to-content; calendar Enter activation and whole-square pointer activation at 390, 768 and 1440 pixels; invalid contact-form focus and errors; radio slider arrow keys; theme switching; and paused ramblings with manual advance. The menu's open state also passed the axe scan. Invalid form checks send no messages.

These results do **not** establish full WCAG conformance. Textures, gradients and overlapping artwork leave some automated contrast checks inconclusive. Review those findings against the rendered backgrounds, and perform a real screen-reader pass (such as NVDA with Chrome), zoom/text-spacing checks and authenticated admin testing before making a conformance claim. Accessibility snapshots are not a substitute for screen-reader testing.

## Dependency updates

Use pnpm only. Keep `package.json` and `pnpm-lock.yaml` together. `pnpm outdated` checks available releases; `pnpm update --latest` may introduce major-version changes. Review peer ranges and migration notes, then run the gates above. Never use an unconstrained security override that can silently replace a dependency with an incompatible major version.

TypeScript stays on the supported 6.0 line while typescript-eslint 8.72 refuses TypeScript 7. UploadThing 7 uses Effect 3; the security override for old Effect 3 releases stays inside that major even when the app's direct Effect dependency advances to 4. See [ADR-019](../../adr/019-dependency-updates-and-compatibility.md).

Run `pnpm audit` and `pnpm audit --prod` separately. An unpatched development dependency must be recorded with its actual exposure, not silently hidden or described as a clean audit. Current validation and exceptions are recorded in the [change summary](../../Change-summary.md).

## Documentation upkeep

The root README is the book cover and chapter list. Each chapter explains one area and links to the source. Use ADRs for durable architectural choices, not every small CSS edit. Date retrospective records when written and state that they describe existing code; do not invent a historical acceptance date.

Keep existing ADR identifiers stable. Handoffs remain dated evidence, not the primary operating manual. The [parking lot](../../../PARKING_LOT.md) contains outstanding and historical findings; check source before treating an old note as current.

---

[Book contents](../../README.md) · [Project home](../../../README.md) · [Previous chapter](../07-seo/README.md) · [Next chapter](../09-deployment/README.md)
