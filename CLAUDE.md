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

The coastal-magazine skin for chrislanejones.com, on the live site's Next.js + Convex app. Not the live site.

| Path | What it is |
|---|---|
| repo root | **The app.** Next.js + Convex, copied from `~/repo/future-chrislanejones-beach` at `08f5780` on 10-22-2026. `pnpm dev` serves it on port 3100. |
| `src/components/beachmag/` | The skin: `BeachmagShell`, the homepage sections, the radio, the sandbox, the browser-tabs archive and the events calendar. Inner pages reach it through `src/components/coastal/page-shell.tsx`; `shell.css` maps their `--coast-*` colors onto the magazine palette. |
| `design/` | **Reference only, not built or deployed.** The static design the skin was ported from (`design/outputs/*.html`) and its Python builders. |

`src/components/beachmag/beachmag.css` and `browser-tabs.css` are generated from the design: `pnpm design:css`. Station audio is rendered with `pnpm audio:render` into `public/audio/`.

## Hard rules

- **`future-chrislanejones-beach` is the live site.** This repo must never deploy, link or push to anything it uses.
- **Never run `convex dev`, `convex deploy`, `convex run` with mutations, or `convex import`** here. The Convex deployment belongs to the live site; `convex/` here is a copy so the types and queries compile. Reads through the app are fine.
- **Never run `vercel`, `vercel link` or `vercel deploy`** here, and never connect this repo to the live Vercel project.
- `.env.local` is Chris's to copy in. Never read, create or edit it.
