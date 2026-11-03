# Change summary

[Documentation handbook](README.md) · [Project home](../README.md)

## 2026-11-03 — Latest resume revision

- Replaced both production resume downloads using the newly supplied PDF and a matching editable Word document, preserving the existing Word layout. Both include Craft CMS in Technical Skills and Independent Consulting.
- Updated the career page's resume label and CMS header to November 2026.
- Kept the resume files outside Git. Verified the complete Word text against the PDF, checked its three-page rendering, and downloaded both live files to confirm their checksums match the sources.

## 2026-11-03 — Resume refresh and coastal sketches

- Replaced the production Convex PDF and Word resumes with the supplied October 2026 DOCX and its three-page PDF conversion; verified both downloads against the source files and removed the two previous storage objects.
- Replaced the 404 Music Lounge and embedded video with “This one wiped out,” a broken-surfboard ink sketch, and links home and to the site map. Updated the footer label, including older CMS labels.
- Added the bald beach-shirt character with an oversized phone and rings below the contact page's “Elsewhere on the internet” social links. Both new illustrations follow the homepage sketches and use the current theme's ink.
- Updated the contact sketch to seat the same character in a folding beach chair under a striped umbrella, keeping the oversized phone, phone-print shirt, rings, and sandals. The wider scene retains the same sidebar height and fits mobile screens.
- Included the existing sandcastle-message apostrophe fix in this publication.

Validation: production build, TypeScript, ESLint, CSS checks, and all 120 tests passed. The 404 and contact pages passed desktop/mobile checks in light and dark themes, with no horizontal overflow or serious/critical automated accessibility findings. [Artwork sources and prompts](art/ink-sketches.md).

## 2026-10-24 — Live on chrislanejones.com

Status: pushed to `main`, which deploys chrislanejones.com.

- This repo became the live site, with the production Convex functions. The admin drives the nav, footer columns, social links, clients, projects, conferences, career timeline, résumés, SEO and blog posts.
- Résumés (PDF and Word) and one MP3 per blog post upload through UploadThing; posts play their narration in a ported Image Horse player.
- Security pass: admin-only writes and lists, an UploadThing-only allowlist for stored URLs, HSTS, and `media-src` for blog audio.
- New day and night homepage stills from the 3D town, WebP images across the site, site-wide reduced motion, a skip link and larger touch targets.
- Phones and tablets: the radio's tuner gets its own row, the three tool groups sit above the icons, and the ramblings stack above the postcards.
- "Past & present." and the About page's conference trail share one paged logo board (`logo-board.tsx`); its page dots follow the screen width. Conference logos on /conferences are larger.
- The footer's beach umbrella is redrawn with domed panels and a scalloped edge.
- Sand game: any dry sand on screen is buildable (up to 17 by 13 spots, not just the 9 by 7 middle). The flag box sits on a low rise near the frame's left edge, and the wash stops along the rise's curved edge (`sandbox/ledge.ts`).
- /conferences and the blog: the search field takes the full width on phones.
- Radio: the silver body uses a soft brushed grain instead of 1px stripes that banded on phones; volume runs through a gain node (iOS ignores an audio element's volume) and starts at 70 on touch screens; on phones the knobs spread across their row with FM / AM and a lit TAPE lamp just above them.
- Homepage: "My ramblings." sits above its paper like "Wish you were here.", with the quote at the top of the card.
- Large screens (1280px and up): the radio becomes a stereo boombox with a speaker either side of the deck ("COASTAL" and "STEREO"). The tuner's FM numbers span the whole display. The ramblings card is shorter on desktop.
- Sand game: the loading bucket from the beach site is back, counting 1% to 100% and filling for at least 400ms.
- Blog: the beach-town post shows the radio on desktop, tablet and phone.

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
