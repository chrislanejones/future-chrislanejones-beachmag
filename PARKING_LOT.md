# Parking lot

- `outputs/coastal-site-preview.zip` predates the radio stations and the 1240px column. Rebuild it from `outputs/` before sharing it again.
- `outputs/coastal-demo.wav`, `work/generate_radio_demo.py` and the `build:audio` script are no longer used by any page. The radio plays `outputs/audio/*.mp3` now.
- Treble and bass are turned off when a page is opened from disk (`file://`), because Chrome passes silence from file media into Web Audio. Not yet checked by hand in a `file://` window.
- The VU meter reads after the volume knob, so at low volume it barely moves. Metering before the volume would make it livelier.
- `sandbox.js` is 1.1 MB (mostly three.js). Code-splitting would need ES modules, which don't load from `file://`.
- Not a git repo yet.
- **Projects and browser tabs from Convex** (10-22-2026): the homepage projects (`work/home-projects.html`) and the tabs list (`work/browser-tabs-data.json`) are hand-written snapshots. Later, mount them from the Convex data in `future-chrislanejones-beach` (`convex/projects.ts`, `src/data/projects-data.ts`). Design first, data later.
