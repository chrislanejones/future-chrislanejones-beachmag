# ADR-024: The sandcastle gets a right-click / long-press menu built on Radix ContextMenu, wrapped as shadcn's `context-menu.tsx`
Date: 2026-11-09   Status: accepted

## Context
The homepage sandcastle (`src/components/beachmag/sandbox/`) builds one way: pick a tool,
then tap the beach (a press that moves under 10 px places the piece).
Chris wants a menu on the clicked spot: build any piece there, rotate a wall, remove the
top piece, undo. He linked shadcn's Base UI context-menu page.
The repo is all Radix already (8 `@radix-ui/react-*` packages: dialog, dropdown-menu,
popover, tabs, switch, alert-dialog, label, slot), and `components.json` is `new-york`.

## Decision
Add `@radix-ui/react-context-menu` as a runtime dependency, wrapped as a shadcn-style
`src/components/ui/context-menu.tsx` in the new-york style, matching
`src/components/ui/dropdown-menu.tsx`. The sandbox wraps its canvas in it. Radix opens the
menu on right-click, on touch long-press (its own ~700 ms timer, so it works on iOS where
`contextmenu` never fires) and on the keyboard ContextMenu key / Shift+F10. Menu items
dispatch to the existing castle reducer (ADR-013).

## Consequences
+ One headless-UI family: same look, focus handling and theming as the dropdown menu.
+ Keyboard nav, typeahead, collision handling and long-press come with the package.
- One more runtime package. It ships in the homepage client bundle with `sandbox.tsx`
  (a static import from `src/app/page.tsx`), not lazily with the Three.js scene.
- Radix's long-press shares the canvas with the scene's tap-to-place and its
  `touch-action: pan-y` scroll. Handled in `sandbox.tsx`: a press that opened the menu is
  not also a tap when it lifts (a flag reset on every pointerdown, set when the menu
  opens), the scene ignores the right button, and the menu content ignores focus moving
  out on lift. A fixed hold-time cutoff was tried and dropped: on a busy phone the lift
  event arrives late and quick taps read as holds. A resting thumb that stays still for
  ~700 ms can still open the menu.
- "Remove the top piece" needs no new reducer action: it is the existing `erase` tool
  through `place`, the same as the Delete key.
- `context-menu.tsx` adds one prop to shadcn's file: a portal `container`, so the menu
  opens inside `#sandbox` and keeps the section's fonts, colors and tool drawings.

## Alternatives rejected
- Base UI (`@base-ui-components/react`), the variant Chris linked. A second headless-UI
  library beside eight Radix packages, for one menu.
- A hand-rolled menu. Focus management, keyboard nav, typeahead, collision handling and
  touch long-press are what Radix gives for free.

## Pre-mortem
It is six months later and this decision was a mistake. Most likely reason: the canvas is a
touch surface first. Radix's long-press fires on the same finger the sandbox uses to
place pieces and to scroll past the section, so phone visitors kept getting a menu they did
not ask for, or a piece plus a menu, and the workaround (disabling long-press, or a timer race
against the scene's `onPointerUp`) undid the reason for using Radix. Early warning sign to
watch for: on a phone, visitors report a menu opening when they meant to tap or scroll.

## Evidence
[Sandbox section](../../src/components/beachmag/sandbox/sandbox.tsx),
[castle reducer](../../src/components/beachmag/sandbox/sandcastle-model.ts),
[dropdown menu](../../src/components/ui/dropdown-menu.tsx), [components.json](../../components.json),
[ADR-013](013-sandcastle-state-and-rendering.md).

Reversal cost: low. Delete the wrapper and the canvas trigger, drop the package; tool plus
tap still builds everything.

[Decision index](INDEX.md) · [Chapter 10](README.md)
