# ADR-022: A blog post may carry one MP3 on UploadThing, played with the browser's own audio control (extends ADR-021)
Date: 2026-10-24   Status: draft

## Context
Chris wants each blog post to offer a spoken version, the way posts on imagehorse.app/blog
do: one audio track, played on the post page under the date line as "Listen to this entry."
`blogPosts` has no audio field, and the only audio on the site is the radio stations rendered
into `public/audio/` at build time. Post audio is editorial content; adding a track must not
need a deploy. Since ADR-021 every uploaded file goes through UploadThing and gets a `media`
row, so audio has to show in Media Manager too.

## Decision
Schema widens only: `blogPosts.audioUrl: v.optional(v.string())`. No new table.
`createPost` and `updatePost` in `convex/blogPosts.ts` accept it.
`src/app/api/uploadthing/core.ts` gains an `audioUploader` route (`audio`, 32 MB, 1 file,
same `requireAdmin` gate as `mediaUploader`, `blogImageUploader` and `documentUploader`).
The upload runs from the admin's Blog Posts tab and inserts a `media` row with
`assignedToType: "document"`, `assignedToId: "blog-audio-<postId>"` (or the slug) and
`assignedToTitle: "Audio: <post title>"`, so the MP3 lists under Media Manager > Documents;
that shelf's Upload button routes audio files to `audioUploader` as well.
`src/app/blog/[slug]/BlogPostPage.tsx` renders a native `<audio controls preload="metadata">`
inside a labeled `<figure>`. No custom player, no autoplay; keyboard and screen-reader
behavior is whatever the browser's control provides.

## Consequences
+ One optional string on an existing table: no migration, old posts unchanged.
+ Adding or replacing a track is an admin action, not a deploy.
+ `preload="metadata"` keeps page weight flat until someone presses play.
- Audio is the largest thing the site uploads (a 10-minute MP3 is roughly 10-15 MB), so
  UploadThing plan storage grows fastest here.
- Replacing a track leaves the old file on UploadThing until it is removed in Media
  Manager, the same caveat as ADR-021.
- The RSS feed and `llms.txt` / `llms-full.txt` outputs do not mention audio yet (follow-up).

## Alternatives rejected
- Convex file storage. Works, but invisible in Media Manager; rejected for the reason
  given in ADR-021.
- `/public/audio`, next to the radio stations. Post audio is editorial content and must not
  need a deploy.
- A custom waveform player. Deferred: more JavaScript on a page Lighthouse already flags
  for script weight.

## Pre-mortem
It is six months later and this decision was a mistake. Most likely reason: the 32 MB cap
and the UploadThing plan limit met each other. A dozen long entries at 15 MB each is most
of a free-tier bucket, with the orphaned files from re-uploads on top, and the fix was a
migration to storage the site controls, which is the deploy-free promise undone. Early
warning sign to watch for: UploadThing storage usage climbing faster than post count, or
more than one `media` row per post with `assignedToId` starting with `blog-audio-`.

## Evidence
[Upload router](../../src/app/api/uploadthing/core.ts), [blog mutations](../../convex/blogPosts.ts),
[schema](../../convex/schema.ts), [post page](../../src/app/blog/[slug]/BlogPostPage.tsx),
[ADR-017](017-media-storage-boundaries.md), [ADR-021](021-resume-files-move-to-uploadthing.md).

[Decision index](INDEX.md) · [Chapter 10](README.md)
