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
    day: { still: "/banners/events-day.webp", video: "/banners/events-day.mp4", alt: "A 3D model of a St. Augustine Beach rooftop deck: people at picnic tables under teal umbrellas and palms, string lights overhead and a hotel behind, late in the afternoon",
      blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAQCdASoQAAkAAoBCJZQCsAEU2Cpjr4AA/smGMpEfiF/t1PYzHGb6TBuNzDvBHkf7nERoLR+PzicvF5UWibDWILhaCfiZEKdReSwExjGcrnTHARmPDAAA" },
    night: { still: "/banners/events-night.webp", video: "/banners/events-night.mp4", alt: "A 3D model of a St. Augustine Beach rooftop deck at dusk: the string lights on over people at picnic tables under teal umbrellas, the hotel windows lit behind",
      blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAkAAoBCJZwCsAEO569e/AAAzhBfTNpVWqxqbgI1bPm0Q6Lsuo9YLnNaDyIuCzzHVkQx41NTIvTz4LBViooY+yCb+93BKAE2AAAA" },
  },
  "/browser-tabs": {
    focus: "50% 60%",
    day: { still: "/banners/browser-tabs-day.webp", video: "/banners/browser-tabs-day.mp4", alt: "A 3D model of a rooftop restaurant deck on A1A, diners at picnic tables under teal umbrellas, teal lounge sofas and people leaning on the cable railing, a beach hotel across the street",
      blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAABQAgCdASoQAAkAAoBCJZwAD43uL5VmTTbI/AAA/rd5rj4b25zUE5aD1EaQx2sWHBwS/ZvcWp0qyWOxubMrOMBvc0p3f89ALFEc0Dt3JSjI4AljAAA=" },
    night: { still: "/banners/browser-tabs-night.webp", video: "/banners/browser-tabs-night.mp4", alt: "A 3D model of a rooftop restaurant deck on A1A at night, lanterns on the tables and string lights over diners under teal umbrellas, hotel windows lit across the street",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAkAAoBCJYwCdAERB8IgP4AA/vn8ExBWww507ypB93bLtHZb0xxJJwM41Yn7NsafxjXcHnGay16LJwsVl0xcoYAAAA==" },
  },
  "/contact": {
    focus: "60% 60%",
    day: { still: "/banners/contact-day.webp", video: "/banners/contact-day.mp4", alt: "A 3D model of the beach from above the dunes, a dune walkover, beachgoers on the sand and a fishing boat offshore at sunrise",
      blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAQCdASoQAAkAAoBCJZQCdAD0LkJsAP7wF34ZbvMXxRn29W+/rH/6bvvieuVfTluiz3xeJb7RONmoUdD9/jo1OzX/p/T/AAA=" },
    night: { still: "/banners/contact-night.webp", video: "/banners/contact-night.mp4", alt: "A 3D model of the beach from above the dunes, a dune walkover, beachgoers on the sand and a fishing boat offshore under the moon",
      blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoQAAkAAoBCJQBOgB7HXICAAP76ZXpMcqem1UVgy5vp+rmU51U2GzWYEN4LE6JHuk/mj6Wg7bgAAA==" },
  },
  "/blog": {
    focus: "68% 70%",
    day: { still: "/banners/blog-day.webp", video: "/banners/blog-day.mp4", alt: "A 3D model of a Northeast Florida beach town seen from the water at dawn, a fishing boat offshore, beachgoers and dune walkovers below the beach houses and hotels under a lavender sky",
      blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAkAAoBCJZACdAEPQ3aEAAD+1Nkx89LrzqPor5tQ3mNjknNAaSxlmukPRhzGa2hT6yLCKbyeJAAA" },
    night: { still: "/banners/blog-night.webp", video: "/banners/blog-night.mp4", alt: "A 3D model of a Northeast Florida beach town seen from the water at night, a fishing boat offshore, windows lit in the beach houses and hotels under the stars",
      blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAkAAoBCJQBOgCHh16BgAAD++mD3yVgx1N11rj294EbVm8ZyhcrjDReXgAAA" },
  },

  "/conferences": {
    focus: "75% 55%",
    day: { still: "/banners/conferences-day.webp", video: "/banners/conferences-day.mp4", alt: "A 3D model of the pier reaching into the Atlantic at sunset",
      blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAkAAoBCJZgCsAEUov5jgzgA+p/5vBk125haQUsTwACul/9w/Dr64WKEJ6HqlUSeYNzfsTTo2sd44ecPf+J5UAA=" },
    night: { still: "/banners/conferences-night.webp", video: "/banners/conferences-night.mp4", alt: "A 3D model of the pier reaching into the Atlantic at night, windows lit",
      blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAQCdASoQAAkAAoBCJYgCdAF1AAD+9vTyTNqPe/v3yXz6fRBugKWCw443DIUlhftpTlP0svVe+KeAZDPgxd8SO2QAAA==" },
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
  "/career-and-resume": {
    focus: "60% 55%",
    day: { still: "/banners/career-and-resume-day.webp", video: "/banners/career-and-resume-day.mp4", alt: "A 3D model of a beachfront resort beside the pier, a sailboat offshore and the beach town along the shore at sunset",
      blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoQAAkAAoBCJZQCdAEOgjSTcyAA/tUXv1hht0W/P8IJVV8V8g/d5nOslDH97kbLcmkAhV8XBpsUgOj/HVFZWgAA" },
    night: { still: "/banners/career-and-resume-night.webp", video: "/banners/career-and-resume-night.mp4", alt: "A 3D model of a beachfront resort beside the pier, a sailboat offshore and the beach town along the shore at night, windows lit",
      blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoQAAkAAoBCJQBOgCGgnADgAP76b2cWJSW6t1d/63ACRSh7XCSZaZYgXky8qBBUUjg7ePiIRbGAAA==" },
  },
  "/projects": {
    focus: "50% 62%",
    day: { still: "/banners/projects-day.webp", video: "/banners/projects-day.mp4", alt: "A 3D model of the pier from the water, beachgoers on the sand and the beach town and hotels along the shore at sunrise",
      blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoQAAkAAoBCJZgCdAEOO30oAAD+6yWzl9hefHH6s4NMJVMeiVPDipP0SZL1g5flOuXKp2ZQN16vOZz6iS/Kn083TAAAAA==" },
    night: { still: "/banners/projects-night.webp", video: "/banners/projects-night.mp4", alt: "A 3D model of the pier from the water, beachgoers on the sand and the beach town and hotels along the shore at night, windows lit",
      blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAkAAoBCJQBOgCP/5MWHwAD++dgWU1YNC/OF5IUc7P3kFxAviUxxGR1GJwAA" },
  },
  "/site-history": {
    focus: "65% 50%",
    day: { still: "/banners/site-history-day.webp", alt: "A 3D model of a Northeast Florida beach town from the air, the town, its dune walkovers and the pier running along the Atlantic in the early morning",
      blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAQCdASoQAAkAAoBCJQBWACHQBH3D4AD+6soOSNhOh5VFppgnLPLyPAEZ/dwtm3FMNUzH8TT1FLGZmro2V8rEkSSROrIWYGQx6RchREAAAA==" },
    night: { still: "/banners/site-history-night.webp", alt: "A 3D model of a Northeast Florida beach town from the air, the town, its dune walkovers and the pier running along the Atlantic at night, windows lit",
      blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoQAAkAAoBCJQBOgCP7q5RCHwAA/vnJDZP/xGrWd4oTanavWgWc0K+SZuOKcJnzcMUWXqweehAAAA==" },
  },
  "/site-map": {
    focus: "68% 50%",
    day: { still: "/banners/site-map-day.webp", video: "/banners/site-map-day.mp4", alt: "A 3D model of a top-down map of the beach town streets, beach and ocean at midday",
      blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoQAAkAAoBCJQBOgBjsndp4AP4VKtckqvoUY3x19aZz29q7UNYCdGTt6Mp1qPO55x+bd6aWAAA=" },
    night: { still: "/banners/site-map-night.webp", video: "/banners/site-map-night.mp4", alt: "A 3D model of a top-down map of the beach town streets, beach and ocean at night, windows lit",
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

  // The banner was shot for the logo page, so its files keep that name.
  "/design-system": {
    focus: "60% 55%",
    day: { still: "/banners/logo-page-day.webp", video: "/banners/logo-page-day.mp4", alt: "A 3D model of St. Augustine Beach from above the houses: dune walkovers cross to the sand, the beach runs north to the pier and a boat sits offshore under a pink evening sky",
      blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAQCdASoQAAkAAoBCJZQC7AELXCV3R3AA/pG/qSAxOxelqZf4qusGcuVp1qEBhR3todL+4MaYXzXmPRTjXbb5RM3WmF6qo/NnzUAA" },
    night: { still: "/banners/logo-page-night.webp", video: "/banners/logo-page-night.mp4", alt: "A 3D model of St. Augustine Beach at dusk from above the houses: the first windows lit, dune walkovers crossing to the sand and the beach running north to the pier",
      blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoQAAkAAoBCJZQC7AEWUOrFwM3gAP1T+Zz87atr4X3BCC0HcPAJjKZIje5+c94ivVp2qx5MmtkbwvyFAx2gAA==" },
  },
  "/admin-showcase": {
    focus: "75% 70%",
    day: { still: "/banners/admin-showcase-day.webp", video: "/banners/admin-showcase-day.mp4", alt: "A 3D model of the El Castillo resort hotel above the Atlantic at sunset",
      blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAQCdASoQAAkAAoBCJZQCdAEOqPP/AAD+8f5NLSUQavTkY+yVZojz8idUsUXe3gK7JfWKAnR3MLvSXNHU2HWwBpWBVIirriwAHPp9uwNG/AAA" },
    night: { still: "/banners/admin-showcase-night.webp", video: "/banners/admin-showcase-night.mp4", alt: "A 3D model of the El Castillo resort hotel above the Atlantic at night, windows lit",
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
