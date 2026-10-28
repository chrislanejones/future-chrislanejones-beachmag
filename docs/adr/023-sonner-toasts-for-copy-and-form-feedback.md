# ADR-023: Sonner, wrapped as shadcn's Toaster on the site's own theme store, carries copy confirmations and form feedback
Date: 2026-10-27   Status: draft

## Context
Chris asked for shadcn Sonner toasts in two places: to confirm the new "Copy to clipboard"
button under the "Put it in your agent." sticker (`beach-offline.tsx`), and to carry all
end-user feedback on the three form pages (`/contact`, `/react-maintenance`,
`/wordpress-maintenance`, all rendering `contact-form.tsx`). The site had no toast system;
form results were inline status text. shadcn's stock `sonner.tsx` reads `next-themes`, but
the site already has one theme store (ADR-011).

## Decision
Add `sonner` (^2.0.8, via pnpm) as a runtime dependency. `src/components/ui/sonner.tsx`
wraps its `Toaster` and takes the theme from `useTheme` in `@/lib/theme-store`; no
`next-themes`. It is mounted once in `src/app/layout.tsx`. Styling lives in
`shell.css` (`.site-toaster` / `.site-toast`) on `--bm-*` tokens, with selectors that include
`[data-sonner-*]` attributes because Sonner's own attribute selectors otherwise win on
specificity. Submit success and failure move fully to toasts (the inline status blocks are
gone). Per-field errors stay inline (`aria-describedby`, `role="alert"`, focus to the first
invalid field) next to the summary toast, because a toast disappears and a screen-reader
user needs the error tied to its field.

## Consequences
+ One toast pattern site-wide: one component, one mount point, 5 `toast.*` calls in 2 files.
+ No second theme system; toasts follow the site's light/dark switch.
- A new runtime dependency on every page, since the `Toaster` sits in the root layout.
- The `[data-sonner-*]` selectors couple `shell.css` to Sonner's internal attribute names;
  a Sonner major can silently unstyle the toasts.
- Submit success is now transient: the "Message sent" confirmation no longer stays on the
  page after the toast times out.

## Alternatives rejected
- Inline status text only (the previous behavior). Gives the copy button nowhere natural
  to confirm, and is not what Chris asked for.
- A hand-rolled toast. Queueing, timing, swipe-dismiss and live-region work Sonner already does.
- shadcn's stock `sonner.tsx` with `next-themes`. A second theme system beside ADR-011.

## Pre-mortem
It is six months later and this decision was a mistake. Most likely reason: the toast
became the only record of a submit. A visitor glanced away, the "Message sent" toast timed
out, and with the inline status removed they could not tell whether the message went, so
they sent it twice or not at all. Early warning sign to watch for: duplicate contact
submissions from the same address minutes apart, or "did my message go through?" replies.

## Evidence
[Toaster wrapper](../../src/components/ui/sonner.tsx), [root layout](../../src/app/layout.tsx),
[contact form](../../src/components/page/contact-form.tsx),
[copy button](../../src/components/beachmag/beach-offline.tsx),
[toast styles](../../src/components/beachmag/shell.css), [ADR-011](011-coastal-tokens-and-theme.md).

Reversal cost: low. Delete the wrapper and its mount, restore inline status text at the
5 call sites, drop `sonner` from `package.json`.

[Decision index](INDEX.md) · [Chapter 10](README.md)
