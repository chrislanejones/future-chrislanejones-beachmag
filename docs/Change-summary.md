# Change summary

[Documentation handbook](README.md) · [Project home](../README.md)

## 2026-10-24 — Live on chrislanejones.com

Status: pushed to `main`, which deploys chrislanejones.com.

- This repo became the live site, with the production Convex functions. The admin drives the nav, footer columns, social links, clients, projects, conferences, career timeline, résumés, SEO and blog posts.
- Résumés (PDF and Word) and one MP3 per blog post upload through UploadThing; posts play their narration in a ported Image Horse player.
- Security pass: admin-only writes and lists, an UploadThing-only allowlist for stored URLs, HSTS, and `media-src` for blog audio.
- New day and night homepage stills from the 3D town, WebP images across the site, site-wide reduced motion, a skip link and larger touch targets.
- Phones and tablets: the radio's tuner gets its own row, the three tool groups sit above the icons, and the ramblings stack above the postcards.
- "Past & present." and the About page's conference trail share one paged logo board (`logo-board.tsx`); its page dots follow the screen width. Conference logos on /conferences are larger.
- The footer's beach umbrella is redrawn with domed panels and a scalloped edge.

Validation: TypeScript, ESLint and the CSS drift check (`pnpm check:css`) passed; layouts checked at 344, 390, 768 and 1280px.

## 2026-10-21 — Documentation and portfolio maintenance

Status: committed on `design/beach-homepage`; this entry does not assert a production release.

- Replaced the long project README with a chapter index, nine handbook chapters and an architecture-decisions chapter. Added ADR-010 through ADR-020 as retrospective draft records.
- Preloaded Browser Tabs links on the server, retained live updates, and added category navigation and grouping.
- Removed generated modification dates from sitemap entries without tracked content-update dates.
- Updated dependencies and the pnpm lockfile, retaining TypeScript 6 and a compatible Effect 3 override for UploadThing.
- Refreshed About media and changed Site History to updated still images.
- Incorporated PR #47 from `beach/main`, retaining its hero, other page banners and résumé framing while preserving the local About and Site History changes.

Validation: frozen-lockfile installation, TypeScript, ESLint, all 69 tests across six files, and the production build passed. The production dependency audit reported no known vulnerabilities.

The full dependency audit reports one high-severity development dependency finding in `braces`, reached through the Next.js ESLint plugin and `fast-glob` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)); pnpm reports no patched version. Installation also reports ignored build scripts for `@clerk/shared` and `core-js`. The build reports the existing `middleware` convention's deprecation in favor of `proxy`.
