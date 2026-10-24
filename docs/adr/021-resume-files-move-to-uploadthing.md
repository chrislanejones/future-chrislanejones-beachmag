# ADR-021: The resume files move from Convex storage to UploadThing (amends ADR-002, ADR-006, ADR-017)
Date: 2026-10-24   Status: draft

## Context
The PDF and Word resume live in Convex file storage (ADR-002), replaced from the
admin's `ResumeFilesPanel` through `resume.generateAdminUploadUrl` + `resume.publish`
(ADR-006) or `scripts/upload-resume.sh`. Every other uploaded file on the site goes
through UploadThing and gets a `media` row, so the admin's Media Manager lists
images but not the two resumes. ADR-017 recorded that split as a boundary to keep.
Chris wants the resumes visible in Media Manager with everything else.

## Decision
Resumes upload to UploadThing. `src/app/api/uploadthing/core.ts` gains a
`documentUploader` route (`pdf` + `blob`, 16 MB, 1 file, same `requireAdmin` gate as
`mediaUploader`). `resumeFiles` widens, never narrows: `url: v.optional(v.string())`
is added and `storageId` becomes optional, so existing rows keep working.
`getDownload` returns `url ?? storage.getUrl(storageId)`. `resume.publish` takes the
UploadThing URL, filename, size and mimeType, replaces the row, and inserts a `media`
row with `assignedToType: "document"` (id `resume-pdf` / `resume-docx`) so the file shows under Documents in Media Manager. The download
route `src/app/career-and-resume/download/[kind]/route.ts` is unchanged; it already
fetches `file.url` and sets the filename and `Content-Disposition`. A replaced
Convex-storage blob is still deleted, as before. A replaced UploadThing file is not
deleted by the resume flow; the admin removes it in Media Manager.

## Consequences
+ Both resumes appear in Media Manager, one place for every uploaded file.
+ Widening the schema means no data migration and no downtime; old rows resolve
  through `storageId` until they are replaced.
+ `scripts/upload-resume.sh` keeps working against the storage path.
- The resume gets a second public URL on the UploadThing CDN, like images do. The
  file was already a public download, but it now lives on a host the site does not
  control, and replaced copies stay there until the admin deletes them by hand.
- UploadThing plan storage now counts the resumes too.
- The Convex deployment must be redeployed for the schema, and the two live resumes
  must be re-uploaded once through the new panel before the UploadThing path is live.
- Two storage paths exist for one pair of files until the legacy script is retired.

## Alternatives rejected
- Keep Convex storage. Works, but the files stay invisible in Media Manager, which
  is the thing Chris wants to see.
- An "Other files" tab in Media Manager fed from Convex storage. A second media UI
  for two files.
- `/public`. Rejected in ADR-002; the resume must not live in git.

## Pre-mortem
It is six months later and this decision was a mistake. Most likely reason:
"the admin deletes old files in Media Manager" never happened, so UploadThing holds
every resume version ever uploaded, each with Chris's phone number on it, on a CDN
URL that still resolves. ADR-002's goal was no new copies piling up anywhere; this
moved the pile from git history to a third-party bucket with no automatic cleanup,
and Media Manager deletion only removes the Convex row (ADR-017), not the file.
Early warning sign to watch for: more than two `media` rows with
`assignedToId` starting with `resume-`, or an old resume URL from UploadThing still returning
200 after a replacement.

## Evidence
[Upload router](../../src/app/api/uploadthing/core.ts), [resume functions](../../convex/resume.ts),
[schema](../../convex/schema.ts), [download route](../../src/app/career-and-resume/download/[kind]/route.ts),
[CLI script](../../scripts/upload-resume.sh), [ADR-002](002-resume-in-convex-storage.md),
[ADR-006](006-admin-resume-upload.md), [ADR-017](017-media-storage-boundaries.md).

[Decision index](INDEX.md) · [Chapter 10](README.md)
