# future-chrislanejones-beachmag

A new skin for chrislanejones.com. Not the live site.

| Folder | What it is |
|---|---|
| `outputs/`, `work/` | The static coastal-magazine design (radio, projects, browser tabs). The visual reference. Build with `pnpm run build`, view with `pnpm run dev` (port 4173). |
| `site/` | The live site's Next.js + Convex app, copied from `~/repo/future-chrislanejones-beach` at `08f5780` plus its uncommitted edits on 10-22-2026. The design gets ported onto this. Run with `pnpm run site:dev` (port 3100). |

## Hard rules

- **`future-chrislanejones-beach` is the live site.** This repo must never deploy, link or push to anything it uses.
- **Never run `convex dev`, `convex deploy`, `convex run` with mutations, or `convex import`** from `site/`. The Convex deployment belongs to the live site; `site/convex/` here is a read-only copy so the types and queries compile. Reads through the Next.js app are fine.
- **Never run `vercel`, `vercel link` or `vercel deploy`** here, and never connect this repo to the live Vercel project.
- `site/.env.local` is Chris's to copy in. Never read, create or edit it.
