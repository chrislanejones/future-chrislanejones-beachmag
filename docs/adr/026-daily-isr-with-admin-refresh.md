# ADR-026: Public pages refresh once a day, and every admin save refreshes the whole site
Date: 2026-11-11   Status: draft

## Context
22 pages and the sitemap had `export const revalidate = 60`, so a crawler hitting a blog,
project, conference or event page more than a minute after the last visit rebuilt it. Vercel
Hobby usage for the 30 days to 11-11-2026: ISR Writes 150K / 200K, Fluid Active CPU 2h 30m /
4h. The Image Horse projects on the same team are static and use neither. Per-project metrics
need Observability Plus (not on Hobby), so the cause was found from the code.

## Decision
Those 23 routes now use `revalidate = 86400`; `llms.txt` and `llms-full.txt` stay at 3600.
New `POST /api/revalidate` checks Clerk `auth()` + `isSiteOwner` (403 otherwise) and runs
`revalidatePath("/", "layout")`: the whole site, because one edit shows on several pages
(/blog, the homepage, the sitemap, llms.txt). `useSiteMutation` wraps Convex `useMutation`;
after a save succeeds it waits 1.5 s (a burst of row reorders refreshes once), then posts to
the route without waiting. 15 admin files use it; Messages stays on `useMutation`, since
contact messages show on no public page. A route test covers signed out, non-owner and owner.

## Consequences
+ ISR writes and CPU should drop sharply. The real number needs a week of usage data.
+ Admin edits go live in about 2 s instead of up to 60 s. This replaces ADR-025's "event page
  metadata lags the hero by up to 60 s": an admin title save now refreshes it within seconds.
- Content changed outside the admin (`convex run`, the seed runner, the daily
  `cleanupStaleSEO` cron, a Convex dashboard edit) waits up to a day, unless someone saves in
  the admin or redeploys.
- Every admin save purges every cached page, so the next visit to each one re-renders. Fine at
  this site's edit rate.

Not in scope: `/browser-tabs` is dynamic (ADR-015, no-store fetch) and runs a function on
every visit. Worth its own look if CPU stays high.

## Alternatives rejected
- `revalidate = 3600` only. Simplest, but edits lag up to an hour; Chris chose instant-on-save.
- `revalidate = 86400` only. Event posts would lag a day.
- A Convex action calling a secret-protected Next route after each mutation. Catches non-admin
  edits too, but needs a shared secret in both Vercel and Convex env and a prod Convex deploy.
- Per-path `revalidatePath` / `revalidateTag`. More precise, but every mutation has to know
  which pages show its data; one missed page is a stale page. Whole-site refresh is cheap here.

## Pre-mortem
Most likely mistake: an edit made outside the admin (a `convex run` fix, a dashboard tweak)
sits invisible for a day and nobody connects it to this change. Early warning sign: a Convex
change that is not on the live site, or ISR writes that do not fall in the week after release.

[Route](../../src/app/api/revalidate/route.ts) · [hook](../../src/app/admin/hooks/useSiteMutation.ts) · [Decision index](INDEX.md)
