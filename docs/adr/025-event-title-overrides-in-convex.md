# ADR-025: Event titles can be overridden from the admin panel through a Convex `eventTitles` table; the event list itself stays in code
Date: 2026-11-10   Status: draft

## Context
Every event lives in code: `HOME_EVENTS` in `src/components/beachmag/events.ts` (slug, start,
name, optional `series`, place, venue, description). Commit a5d2b01 added `series`, so a
recurring meetup's name ("AI Connect Jax", "JaxJUG") sits as a small label over `name`, which
is that month's episode title, and `eventTitle()` joins them as "Series: Episode" for tab
titles, OG, schema.org and aria-labels. Changing a title still means a code push. Chris wants
to edit series and title from the admin panel.

## Decision
Add a Convex table `eventTitles` { `eventSlug`, `series` ("" = no series), `name` }, indexed
`by_eventSlug`. Public queries `eventTitles.list` (take 500) and `eventTitles.get({eventSlug})`;
admin-only mutations `eventTitles.save` (`requireAdmin`, slug regex, trimmed, name 1-200 chars,
series up to 80) and `eventTitles.reset` (deletes the row). A row overrides both `series` and
`name` for its event; slugs, and so URLs, never change. A pure `applyTitles(events, rows)` in
`events.ts` merges rows over the code defaults. The homepage list (`journal-hero.tsx`), the
/events calendar (`events-calendar.tsx`) and the event hero (`event-gallery.tsx`) read rows
live with `useQuery` inside the existing `ContentBoundary`, falling back to code titles if the
query fails. The event page (server, `revalidate = 60`) fetches its row for metadata and
schema.org. The admin Events tab gets a Titles form: "Series (recurring event)", "This event's
title", Save, Reset.

## Consequences
+ Title and series edits ship from admin with no code push or deploy.
+ Small, additive change: one new table, nothing migrated; dates, venues, static params and
  the sitemap keep reading the code list.
- Two sources of truth for a title: the code default and the override. Admin shows the
  effective title and a Reset so the override is never invisible.
- The event page's tab title, OG and schema.org lag the visible hero by up to 60 s (ISR).
- A Convex deploy to production (`hardy-fox-765`). Additive (new table only), and only with
  Chris's go-ahead for that run.

## Alternatives rejected
- Keep titles code-only. Every title tweak needs a code push; Chris wants it in admin.
- Move all of `HOME_EVENTS` into Convex. A much bigger migration: dates, venues, schedules,
  tests, static params and the sitemap all read the code list.
- A separate series table, so renaming a series renames every episode at once. More moving
  parts for 2 series; per-event rows are enough now, and a series table can be added later.

## Pre-mortem
It is six months later and this decision was a mistake. Most likely reason: the override
quietly drifted from the code. Someone fixed a title in `events.ts`, the old override row
still won, and the site kept showing the stale title with nothing in the diff to explain it.
Or a series was renamed in code and only the events without rows picked it up, so the same
meetup showed two names. Per-event rows also mean renaming "AI Connect Jax" takes one save
per episode. Early warning sign to watch for: a title edit in `events.ts` that does not show
up on the live site, or a series label that differs between two events of the same meetup.

## Evidence
[Event list](../../src/components/beachmag/events.ts),
[homepage list](../../src/components/beachmag/journal-hero.tsx),
[event hero](../../src/components/beachmag/event-gallery.tsx),
[event page](../../src/app/events/[slug]/page.tsx),
[admin Events tab](../../src/app/admin/AdminDashboard/EventsTab.tsx),
[ADR-014](014-convex-content-and-local-presentation.md), [ADR-020](020-separate-frontend-and-backend-deployments.md).

Reversal cost: low. Drop the table, the two queries and the form; `applyTitles` with no rows
returns the code titles unchanged.

[Decision index](INDEX.md) · [Chapter 10](README.md)
