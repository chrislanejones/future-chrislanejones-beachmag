import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "./reveal";
import { SceneLoop, type LoopScene } from "./scene-loop";
import styles from "./scene-banner.module.css";

type BannerScene = LoopScene & { focus: string };

/*
 * Each page's view of the St. Augustine Beach 3D world (~/repo/3d-world), as a
 * day and a night still with a seamless loop of each. Camera notes:
 * docs/handoffs/2026-10-15-page-banner-scenes.md.
 */
export const BANNER_SCENES: Record<string, BannerScene> = {
  // Stills only (11-18-2026): Chris's framing down a side street to El Castillo, no loop.
  "/about": {
    focus: "52% 50%",
    day: { still: "/banners/about-day.webp", alt: "A 3D model of a St. Augustine Beach side street from above the houses: palms and pines, parked cars and the El Castillo resort hotel at the end of the street under a pink evening sky",
      blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAQAgCdASoQAAkAAoBCJZQCdAEPSq5zQhIAAP5b/yFDQXAarDdOknSQZADUuV3HSl0n9sLLZxMgNEZiSSSMLV9ChGfV1Abd/fnr0q2HS1tDeCPFQAA=" },
    night: { still: "/banners/about-night.webp", alt: "A 3D model of a St. Augustine Beach side street at dusk from above the houses: the first windows lit and the El Castillo resort hotel at the end of the street under a purple sky",
      blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAAAQAgCdASoQAAkAAoBCJZwCdAEPS7jtjxIAAP14+4bEF2B3y22cqnSaApc+EfMVJJEEpjxFEdDPDrhvebzxHIqw4svBQAAA" },
  },
  // Chris's framing (11-18-2026): a rooftop deck under string lights. Dark mode is dusk, 18.75.
  "/events": {
    focus: "45% 60%",
    day: { still: "/banners/events-day.webp", alt: "A 3D model of a St. Augustine Beach rooftop deck: people at picnic tables under teal umbrellas and palms, string lights overhead and a hotel behind, late in the afternoon",
      blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAQCdASoQAAkAAoBCJZQCsAEU2Cpjr4AA/smGMpEfiF/t1PYzHGb6TBuNzDvBHkf7nERoLR+PzicvF5UWibDWILhaCfiZEKdReSwExjGcrnTHARmPDAAA" },
    night: { still: "/banners/events-night.webp", alt: "A 3D model of a St. Augustine Beach rooftop deck at dusk: the string lights on over people at picnic tables under teal umbrellas, the hotel windows lit behind",
      blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAkAAoBCJZwCsAEO569e/AAAzhBfTNpVWqxqbgI1bPm0Q6Lsuo9YLnNaDyIuCzzHVkQx41NTIvTz4LBViooY+yCb+93BKAE2AAAA" },
  },
  // Stills only (11-18-2026): Chris's framing, 6.5 for Sunlit and 18.75 for After dark.
  "/browser-tabs": {
    focus: "45% 50%",
    day: { still: "/banners/browser-tabs-day.webp", alt: "A 3D model of a St. Augustine Beach corner from above: the Cone Cove ice cream shop under palms, a crosswalk and a flag, with the ocean past the rooftops in the morning",
      blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAQCdASoQAAkAAoBCJZQC7AEOh1WwAP4nv6n/bzT9znkkKwfVXm66VJRMd3yrrYzw3sWmGNwWkj6czhbgMcnzynYLlSZc1pNEbLVIOgAAAA==" },
    night: { still: "/banners/browser-tabs-night.webp", alt: "A 3D model of a St. Augustine Beach corner at dusk from above: Cone Cove's windows lit under the palms, a crosswalk and a flag, the ocean past the rooftops",
      blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAACwAQCdASoQAAkAAoBCJZwAAuTU8JoAAP7sW/zZ3LefCa7UoSrtSD3c9NxPrRiacEMuOqnB5d3j4hvlYhWgAAAA" },
  },
  // Stills only (11-18-2026): Chris's framing, 6.0 for Sunlit and 18.75 for After dark.
  "/contact": {
    focus: "45% 60%",
    day: { still: "/banners/contact-day.webp", alt: "A 3D model of two people in beach chairs under an umbrella at sunrise, a cooler between them, one talking on a giant 1980s brick phone, a fishing boat offshore",
      blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoQAAkAAoBCJZwCdAEOI+oAAP7tm004RoUpkIvYhUljEySoLctMsk6sThEAQc4SZ5AEAGFUAAA=" },
    night: { still: "/banners/contact-night.webp", alt: "A 3D model of two people in beach chairs under an umbrella at dusk, a cooler between them, one talking on a giant 1980s brick phone, a fishing boat offshore",
      blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoQAAkAAoBCJYwCdAERHMCgAPx8jpj1y2OfChsLXaFAKLTCQS4u0QOS6ADUAAAA" },
  },
  // Stills only (11-18-2026): Chris's framing, 6.0 for Sunlit and 18.75 for After dark.
  "/blog": {
    focus: "45% 50%",
    day: { still: "/banners/blog-day.webp", alt: "A 3D model of St. Augustine Beach from the water at sunrise: a fishing boat offshore, the dunes and beach houses behind it",
      blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoQAAkAAoBCJYgCdH8AGEi/u8YAAP7q6yp1pOhV0mCCdmDSliaTxLLG4ZIbf4NxN5znqm1Cas6i0ZutBFXxTNuIAAA=" },
    night: { still: "/banners/blog-night.webp", alt: "A 3D model of St. Augustine Beach from the water at dusk: a fishing boat offshore, the first windows lit in the beach houses behind it",
      blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAkAAoBCJQBOgB6JBTRCgAD+WEJSmTDQ1GxDqH/Ul44evAOa9gVvDYVYwA6rsC2DT9xGxdZWbxgA" },
  },

  // Stills only (11-18-2026): Chris's framing, 6.0 for Sunlit and 18.75 for After dark.
  "/conferences": {
    focus: "40% 55%",
    day: { still: "/banners/conferences-day.webp", alt: "A 3D model of the Envoy Suites hotel beside the volleyball courts at sunrise, the beach pavilion and the ocean at the end of the parking lot",
      blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQAgCdASoQAAkAAoBCJZQCsAECptUG5ngAAMyj40dGbS4qhNrmW0WYWHCQPIcAcw0yVH3CY1ABnA0ReUCRUsrjFecGlXBLi+o2jm8GzgA=" },
    night: { still: "/banners/conferences-night.webp", alt: "A 3D model of the Envoy Suites hotel beside the volleyball courts at dusk, its windows lit and the beach pavilion at the end of the parking lot",
      blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoQAAkAAoBCJZQC7AEezx3EqTQAAP40eK6FGXq3TqJyqUGNBQhwvrOgPLZA4B+B4mJ4Et7+xHWRv9A6Rm3cAA==" },
  },
  // Stills only: the beach chairs under the umbrella south of the pier
  // (global camera at 19.7, 0.8, -10.4 looking at 24.8, 0.1, -16.5;
  // 7.25 for day, 19.25 for night).
  "/lets-meet": {
    focus: "60% 70%",
    day: { still: "/banners/lets-meet-day.webp", alt: "A 3D model of two beach chairs under an umbrella on the sand, the pier and swimmers down the beach in the morning",
      blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoQAAkAA4BaJQBOgB59JyxIAAD+6siPB02GJSYpOFanP1AFEBIc2uMywAA=" },
    night: { still: "/banners/lets-meet-night.webp", alt: "A 3D model of two beach chairs under an umbrella on the sand, the pier and swimmers down the beach at night",
      blur: "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAADQAQCdASoQAAkAA4BaJYwAAu0dpchAAAD+u1/RcvL9uZztQx6QwaAA" },
  },
  // Stills only (11-18-2026): Chris's framing, 5.75 for Sunlit and 18.75 for After dark.
  "/career-and-resume": {
    focus: "40% 50%",
    day: { still: "/banners/career-and-resume-day.webp", alt: "A 3D model of the Envoy Suites hotel from across A1A at sunrise: palms in the front lot, cars parked under the building and the valet canopy past the corner",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoQAAkAAoBCJZwC7AEQFPpL7mhAAP55P23ZDAxidZZtE69pinBrA6QrnzJt3D3IcQwGc9qrJ0cFjA6PuZsLa2hGYYAAAA==" },
    night: { still: "/banners/career-and-resume-night.webp", alt: "A 3D model of the Envoy Suites hotel from across A1A at dusk: its windows lit above the palms in the front lot and the valet canopy past the corner",
      blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoQAAkAAoBCJZwCdAEU+bAPzwAA/s4HIHUv3M+OgAsHtsbrcN6WgjofE2TZPmlLzZXdbSqt2qVs8rQROxhplaAA" },
  },
  // Stills only (11-18-2026): Chris's framing, 6.0 for Sunlit and 18.75 for After dark.
  "/projects": {
    focus: "40% 55%",
    day: { still: "/banners/projects-day.webp", alt: "A 3D model of a beach lot under construction beside the dune at sunrise: footings on a concrete slab, a sand pile and orange safety fence, the ocean and pier beyond",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoQAAkAAoBCJZwCdAEU9PGoAAD5QuNHBZSgdLNnXzG1rOopyKYXm1AMfhslmH4l/uysNa32gq2cLEFAm4BiF8VhwwAAAA==" },
    night: { still: "/banners/projects-night.webp", alt: "A 3D model of a beach lot under construction beside the dune at dusk: footings on a concrete slab and a sand pile, windows lit in the house next door",
      blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoQAAkAAoBCJZwC7AEPBG5X1vAA/oQfvAUJ3gO6lT/zJqfQqcpJ1zdGJWOpN0BtQ7FncqQPJgcTCcIeAAA=" },
  },
  // Stills only (11-18-2026): Chris's framing, 6.5 for Sunlit and 18.75 for After dark.
  "/site-history": {
    focus: "40% 50%",
    day: { still: "/banners/site-history-day.webp", alt: "A 3D model of the El Castillo resort hotel from the street: its sign, a flag and palms out front, early in the morning",
      blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAkAAoBCJYwCdAC1MY5n+AD+64IEwGcbNcKC37HK8+A3yjw8K6v2P0Vq49JWA6cRwZUJFtEFxD8RZfeGHFlQEDrZZgj6AAA=" },
    night: { still: "/banners/site-history-night.webp", alt: "A 3D model of the El Castillo resort hotel from the street at dusk: windows lit above its sign, the flag and the lamps along the curb",
      blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAkAAoBCJZQCdAEfwGv6HN6AAM39uCJ4Q1zRyWfjtO8wIV0h0ugPljIidVadzjzve/cCDVa5BlCPkWVo9jqcSZkggAAA" },
  },
  "/site-map": {
    focus: "68% 50%",
    day: { still: "/banners/site-map-day.webp", alt: "A 3D model of a top-down map of the beach town streets, beach and ocean at midday",
      blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoQAAkAAoBCJQBOgBjsndp4AP4VKtckqvoUY3x19aZz29q7UNYCdGTt6Mp1qPO55x+bd6aWAAA=" },
    night: { still: "/banners/site-map-night.webp", alt: "A 3D model of a top-down map of the beach town streets, beach and ocean at night, windows lit",
      blur: "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADQAQCdASoQAAkAAoBCJYwCdAEO+LuSgAD+/EkxQ94RIgoWrAz8diLsuUAAAA==" },
  },
  "/react-maintenance": {
    focus: "50% 55%",
    day: { still: "/banners/react-maintenance-day.webp", alt: "A 3D model of a Northeast Florida beach town through a fisheye lens from high over the town: the hotel, beach houses, the dunes and the beach curving to the pier under a lavender sky",
      blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQAgCdASoQAAkAAoBCJZQCdAEegRHzvEBAAP5hb71fRH03j0gC7stLmzzD8cbO3+VK0dI4ScA81KIyWqKlpbwxLyno2DGiNJFDeiEfoAA=" },
    night: { still: "/banners/react-maintenance-night.webp", alt: "A 3D model of a Northeast Florida beach town at night through a fisheye lens from high over the town: windows and street lights lit, the dark beach curving to the pier under the stars",
      blur: "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoQAAkAAoBCJQBOgCP7qkvJOGAA/vpnK5ujwLyVDE27Q/lafFaBaz6+iriX1hrYgrd/4AAA" },
  },

  "/wordpress-maintenance": {
    focus: "50% 55%",
    day: { still: "/banners/wordpress-maintenance-day.webp", alt: "A 3D model of a Northeast Florida beach town through a fisheye lens from high over the town: the hotel, beach houses, the dunes and the beach curving to the pier under a lavender sky",
      blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQAgCdASoQAAkAAoBCJZQCdAEegRHzvEBAAP5hb71fRH03j0gC7stLmzzD8cbO3+VK0dI4ScA81KIyWqKlpbwxLyno2DGiNJFDeiEfoAA=" },
    night: { still: "/banners/wordpress-maintenance-night.webp", alt: "A 3D model of a Northeast Florida beach town at night through a fisheye lens from high over the town: windows and street lights lit, the dark beach curving to the pier under the stars",
      blur: "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoQAAkAAoBCJQBOgCP7qkvJOGAA/vpnK5ujwLyVDE27Q/lafFaBaz6+iriX1hrYgrd/4AAA" },
  },

  // Stills only (11-18-2026): Chris's framing, 6.5 for Sunlit and 18.75 for After dark.
  "/design-system": {
    focus: "45% 50%",
    day: { still: "/banners/design-system-day.webp", alt: "A 3D model of a three-story building with angled white fins from above the rooftops, a pool beside it and the town behind, in the morning",
      blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACwAQCdASoQAAkAAoBCJZQAAub0lRJIAP7Bh6pINe1wXeVxiajlq1Pwijr3qlMXmDzsmOsTqIV5KoY8IpKLnayqRT6i71PIxDga2gAA" },
    night: { still: "/banners/design-system-night.webp", alt: "A 3D model of a three-story building with angled white fins at dusk, a few windows lit, a pool beside it and the town behind",
      blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoQAAkAAoBCJZQC7AEOZ0BAAP713WOugUifYS8zsTkWmYlNgdbVQ2zuAKZ4CN9KR3AtbAOC8fwAAA==" },
  },
  "/admin-showcase": {
    focus: "75% 70%",
    day: { still: "/banners/admin-showcase-day.webp", alt: "A 3D model of the El Castillo resort hotel above the Atlantic at sunset",
      blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAQCdASoQAAkAAoBCJZQCdAEOqPP/AAD+8f5NLSUQavTkY+yVZojz8idUsUXe3gK7JfWKAnR3MLvSXNHU2HWwBpWBVIirriwAHPp9uwNG/AAA" },
    night: { still: "/banners/admin-showcase-night.webp", alt: "A 3D model of the El Castillo resort hotel above the Atlantic at night, windows lit",
      blur: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoQAAkAAoBCJQBOgCHfPL2oAP75xiiE4v6Rz+K11AZVM9k+7goAPaVAmxwxTu9EWxgAAA==" },
  },
};

export function SceneBanner({ scene, children }: { scene: BannerScene; children?: ReactNode }) {
  return (
    <div className={styles.view} style={{ "--scene-focus": scene.focus } as CSSProperties}>
      <SceneLoop scene={scene} sizes="(max-width: 1400px) 94vw, 1360px" className={styles.photo} />
      <div className={styles.shade} aria-hidden="true" />
      <Reveal className={styles.content}>{children}</Reveal>
    </div>
  );
}
