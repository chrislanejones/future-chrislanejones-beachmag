<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

# future-chrislanejones-beachmag

**The live site, chrislanejones.com** (since 10-24-2026): the coastal-magazine skin on the Next.js + Convex app. `future-chrislanejones-beach` is retired as the main site.

| Path | What it is |
|---|---|
| repo root | **The app.** Next.js + Convex, copied from `~/repo/future-chrislanejones-beach` at `08f5780` on 10-22-2026. `pnpm dev` serves it on port 3100. |
| `src/components/beachmag/` | The skin: `BeachmagShell`, the homepage sections, the radio, the sandbox, the browser-tabs archive and the events calendar. Inner pages reach it through `src/components/coastal/page-shell.tsx`; `shell.css` maps their `--coast-*` colors onto the magazine palette. |
| `design/` | **Reference only, not built or deployed.** The static design the skin was ported from (`design/outputs/*.html`) and its Python builders. |

`src/components/beachmag/beachmag.css` and `browser-tabs.css` are generated from the design: `pnpm design:css`. Station audio is rendered with `pnpm audio:render` into `public/audio/`.

## Hard rules

- **This repo is production.** The Vercel project `future-chrislanejones-beach` (domains `www.chrislanejones.com` and `chrislanejones.com`) builds from this repo's GitHub `main`, so **every push to `main` deploys the live site**. Push only when Chris asks.
- **`convex/` here is now the source of the production Convex functions.** `convex deploy`, `convex run` with mutations, `convex import` and changes to Convex env vars hit live data: only with Chris's explicit go-ahead for that run. Never `convex dev` against production.
- **Never run `vercel deploy`** by hand or change the Vercel project's settings, domains or env vars without Chris's go-ahead. Rollback lives in the Vercel dashboard (Instant Rollback).
- Convex deployments: production is `hardy-fox-765` (the live site); local `.env.local` points at `limitless-parakeet-517`, a separate deployment with its own data, so project slugs and content differ locally. Check the URL before testing writes.
- `.env.local` is Chris's to copy in. Never read, create or edit it.
