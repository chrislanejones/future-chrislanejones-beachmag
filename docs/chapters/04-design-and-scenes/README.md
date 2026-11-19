# Chapter 4: Coastal design and scenes

[Book contents](../../README.md) · [Project home](../../../README.md) · [Previous chapter](../03-features/README.md) · [Next chapter](../05-content-and-media/README.md)

## Design vocabulary

Warm sand, ocean blue, TT Interphases, and shared semantic tokens carry the beach identity across the public site and admin. CSS Modules contain coastal layouts; Tailwind and shared UI primitives support forms and controls. Theme state lives in [theme-store.ts](../../../src/lib/theme-store.ts), rather than independent toggle state on each surface.

The [simple design guide](../../SIMPLE-DESIGN-GUIDE.md) is the detailed palette and contrast reference. The [sign-art README](../../../src/components/coastal/sign-art/README.md) documents the procedural sign assets.

## Hero and banner delivery

[HeroPhoto](../../../src/components/coastal/hero-photo.tsx) and [SceneBanner](../../../src/components/coastal/scene-banner.tsx) pass day/night assets to [SceneLoop](../../../src/components/coastal/scene-loop.tsx). The initial display is a WebP still; eligible visitors subsequently receive a muted MP4 loop. CSS chooses the still for the theme. The loop waits for loading/idle scheduling, pauses offscreen or in a hidden tab, and is omitted on narrow screens, Data Saver, or reduced motion.

A scene can omit its video and stay a still. Since 11-18-2026 every page banner does: only the homepage hero plays a loop, and the other pages show a Sunlit still and an After dark still. The site no longer loads the legacy town model as its hero, even though old model source files remain in the repository.

## The Vice edition (11-19-2026)

A one-day skin for Grand Theft Auto VI's release. On 11-19-2026, Eastern time, the magazine turns Miami: After dark becomes Vice nights (neon on a violet night) and Sunlit becomes Vice days (pastel Ocean Drive deco).

| Piece | File |
|---|---|
| The date and the switch | [vice-day.ts](../../../src/lib/vice-day.ts): a `<head>` script sets `html.vice` before first paint, so the daily ISR cache never decides it |
| Client hook | [vice.ts](../../../src/lib/vice.ts) (`useVice`) |
| Styles | [vice.css](../../../src/components/beachmag/vice.css), an override layer on the palette variables; colors are `--vice-*` tokens in `globals.css`, and `pnpm check:css` holds it to zero raw colors |
| Photo grading and painted figures | [vice-filters.tsx](../../../src/components/beachmag/vice-filters.tsx) (SVG filters; photos are never converted) |
| Sandbox pennants | [vice-flag.tsx](../../../src/components/beachmag/sandbox/vice-flag.tsx) |
| Nav logo | `public/art/vice-logo.svg` |
| Mock-ups (reference only) | `design/vice/` |

- Preview it on any day with `?vice=on`. Hide it with `?vice=off`. Either choice lasts for the rest of the browser tab.
- The three display fonts (Monoton, Limelight, Yellowtail) aren't preloaded, so they only download while the edition is on.
- After the day it does nothing. To retire it, delete the files above and the `vice.css` line in `scripts/check-css.mjs`.

Recordings originate in the separate private `3d-world` project. The [capture handoff](scene-capture.md) explains cameras and capture steps. Still images and clips must depict the same shot; a changed scene or camera needs new captures.

## Interactive 3D and motion

[CoastFloor](../../../src/components/coastal/coast-floor.tsx) and [SandcastleBuilder](../../../src/components/coastal/sandcastle-builder.tsx) dynamically import their WebGL scenes. The decorative coast avoids narrow screens and Data Saver. The sandcastle loads near the viewport and pauses ongoing motion when hidden or reduced motion is requested.

[Reveal](../../../src/components/coastal/reveal.tsx) uses IntersectionObserver and the Web Animations API, leaving content in the HTML rather than hiding it until a motion library starts. Motion remains installed for other components.

See [ADR-009](../../adr/009-page-banners-use-recorded-video-loops.md), [ADR-011](../../adr/011-coastal-tokens-and-theme.md), and [ADR-012](../../adr/012-progressive-motion-and-lazy-webgl.md).

---

[Book contents](../../README.md) · [Project home](../../../README.md) · [Previous chapter](../03-features/README.md) · [Next chapter](../05-content-and-media/README.md)
