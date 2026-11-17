// The content of /design-system. Every value here is copied from a
// stylesheet, and design-system.test.ts fails when a copy and its stylesheet
// disagree: `source` says which file, `css` is the text it must contain.

export type Section = { id: string; title: string };

export const SECTIONS: readonly Section[] = [
  { id: "principles", title: "Principles" },
  { id: "logo", title: "Logo" },
  { id: "colors", title: "Colors" },
  { id: "typography", title: "Typography" },
  { id: "spacing", title: "Spacing, rules and corners" },
  { id: "components", title: "Components" },
  { id: "motion", title: "Motion" },
  { id: "accessibility", title: "Accessibility" },
];

export const PRINCIPLES: readonly { title: string; body: string }[] = [
  { title: "It's a magazine", body: "Every page is a sheet of paper, 1240px wide at most, on a dark teal margin. Headlines are big, and a section opens with a thick rule." },
  { title: "Two editions", body: "Sunlit is cream paper with dark teal ink. After dark swaps them. One knob at the top of every page flips it, so every color comes as a pair." },
  { title: "Two typefaces", body: "Bodoni Moda, at its heaviest weight, sets the headlines. DM Sans sets everything else. There is no third." },
  { title: "One accent", body: "Rust orange on Sunlit paper, peach After dark. It marks the last word of a headline, a small label or a ribbon, and not much else." },
  { title: "Square corners, hard shadows", body: "Paper has square corners, so cards do too. Most shadows are a solid block of ink, a few pixels down and to the right." },
  { title: "A little crooked", body: "Polaroids, ribbons and the Let's meet link sit a few degrees off level, like things taped to a page. They move when you point at them." },
  { title: "Controls are hardware", body: "Buttons that do something look like parts of the radio on the home page: brushed-silver keys that press down, and a chicken-head knob that turns." },
];

// ── colors ───────────────────────────────────────────────────────────────

/** The four colors an inner page paints with. Set on `.interior` in interior.css as light-dark() pairs. */
export const PAGE_COLORS: readonly { token: string; light: string; dark: string; use: string }[] = [
  { token: "paper", light: "#eee5d2", dark: "#142224", use: "The sheet every inner page is printed on" },
  { token: "sheet", light: "#f8efdd", dark: "#263b3b", use: "A card or a polaroid lying on the paper" },
  { token: "ink", light: "#173437", dark: "#eee5d2", use: "Text, rules and hard shadows" },
  { token: "accent", light: "#a33620", dark: "#ffab80", use: "The last word of a headline, labels, the ribbon" },
];

export type Primitive = { token: string; value: string; use: string };

/** The fixed values in globals.css. Hand-written magazine styles read these. */
export const COLOR_GROUPS: readonly { title: string; note: string; tokens: readonly Primitive[] }[] = [
  {
    title: "Paper, ink and accent",
    note: "The fixed values behind both editions. New styles read these instead of a raw hex, and pnpm check:css counts the old ones that still don't.",
    tokens: [
      { token: "bm-cream", value: "#eee5d2", use: "Paper, Sunlit" },
      { token: "bm-cream-2", value: "#f1e7d4", use: "Paper, a little warmer" },
      { token: "bm-sheet", value: "#faf3e5", use: "A card on the paper" },
      { token: "bm-sand", value: "#e9dfc9", use: "The sand game" },
      { token: "bm-ink", value: "#152e31", use: "Ink, Sunlit" },
      { token: "bm-ink-2", value: "#173437", use: "Ink, and the footer's paper" },
      { token: "bm-ink-3", value: "#173e42", use: "Ink in the sand game" },
      { token: "bm-deep", value: "#172f32", use: "The margin behind the column" },
      { token: "bm-night", value: "#142224", use: "Paper, After dark" },
      { token: "bm-night-2", value: "#243638", use: "A card on the night paper" },
      { token: "bm-accent", value: "#a6321c", use: "Rust orange, Sunlit" },
      { token: "bm-accent-dark", value: "#ffab80", use: "Peach, After dark" },
      { token: "bm-accent-deep", value: "#a33620", use: "The footer's top rule" },
    ],
  },
  {
    title: "Radio hardware",
    note: "The silver, the lamp and the dial of the cassette radio on the home page.",
    tokens: [
      { token: "bm-silver-hi", value: "#e0e1d8", use: "Brushed silver, the light edge" },
      { token: "bm-silver", value: "#cfd2cb", use: "The silver body" },
      { token: "bm-silver-lo", value: "#b5b9b5", use: "Silver, the shaded edge" },
      { token: "bm-silver-rim", value: "#778174", use: "A key's outline" },
      { token: "bm-silver-edge", value: "#626d62", use: "A key's thick bottom edge" },
      { token: "bm-silver-warm", value: "#e2d7af", use: "A key under the pointer" },
      { token: "bm-silver-press", value: "#a9b99b", use: "A key pressed down" },
      { token: "bm-lamp", value: "#ff5a30", use: "A lit lamp" },
      { token: "bm-dial-tick", value: "#c8bf98", use: "The tuner's line and ticks" },
    ],
  },
  {
    title: "Sand game",
    note: "The bucket and shovel that show while the sand game loads.",
    tokens: [
      { token: "bm-toy-teal", value: "#4fa3a5", use: "The bucket" },
      { token: "bm-toy-teal-deep", value: "#3d8e91", use: "Its rim" },
      { token: "bm-toy-coral", value: "#e0573f", use: "The shovel" },
      { token: "bm-toy-sand", value: "#ead39f", use: "The sand heaped in it" },
      { token: "bm-toy-handle", value: "#f4f6f2", use: "The handle" },
    ],
  },
];

/** shell.css points the earlier beach site's variables at the magazine's colors. */
export const COAST_MAP: readonly { from: string; to: string; plain: string }[] = [
  { from: "coast-base", to: "var(--paper)", plain: "The paper" },
  { from: "coast-panel", to: "var(--sheet)", plain: "The card color" },
  { from: "coast-soft", to: "color-mix(in srgb, var(--ink) 7%, var(--paper))", plain: "Paper with a little ink in it" },
  { from: "coast-ink", to: "var(--ink)", plain: "The ink" },
  { from: "coast-muted", to: "color-mix(in srgb, var(--ink) 74%, var(--paper))", plain: "Ink, thinned for small print" },
  { from: "coast-accent", to: "var(--accent)", plain: "The accent" },
  { from: "coast-on-accent", to: "var(--paper)", plain: "Text on an accent fill" },
  { from: "coast-line", to: "color-mix(in srgb, var(--ink) 30%, transparent)", plain: "A faint divider" },
  { from: "coast-control-line", to: "color-mix(in srgb, var(--ink) 45%, transparent)", plain: "The edge of a form field" },
];

// ── typography ───────────────────────────────────────────────────────────

const INTERIOR = "src/components/beachmag/interior.css";
const SHELL = "src/components/beachmag/shell.css";
const HOME = "src/components/beachmag/beachmag.css";
const GLOBALS = "src/app/globals.css";

export type Sourced = { source: string; css: string };

export const TYPE_SCALE: readonly ({ cls: string; face: string; size: string; use: string } & Sourced)[] = [
  { cls: ".interior h1", face: "Bodoni Moda 900", size: "56 to 76px, line 0.94", use: "The page title", source: INTERIOR, css: ".interior h1{font:900 clamp(56px,7.6vw,76px)/.94 var(--font-bodoni-moda)" },
  { cls: ".article-hero h1", face: "Bodoni Moda 900", size: "40 to 58px, line 1.02", use: "A blog post's title, which is a sentence and not two words", source: INTERIOR, css: ".interior .article-hero h1{font-size:clamp(40px,5.2vw,58px);line-height:1.02" },
  { cls: ".interior h2", face: "Bodoni Moda 900", size: "36px, line 1.05", use: "Section headings", source: INTERIOR, css: ".interior h2{font:900 36px/1.05 var(--font-bodoni-moda)" },
  { cls: ".end-note p", face: "Bodoni Moda 900 italic", size: "28px, line 1.1", use: "The closing line of a page", source: INTERIOR, css: ".interior .end-note p{font:italic 900 28px/1.1 var(--font-bodoni-moda)" },
  { cls: ".page-polaroid figcaption", face: "Bodoni Moda 900 italic", size: "22px, line 1.1", use: "The caption under a polaroid", source: INTERIOR, css: ".interior .page-polaroid figcaption{font:italic 900 22px/1.1 var(--font-bodoni-moda)" },
  { cls: ".archive-prose", face: "DM Sans 400", size: "15px, line 1.85", use: "Long reading: blog posts and project write-ups", source: INTERIOR, css: ".interior .archive-prose{min-width:0;font-size:15px;line-height:1.85" },
  { cls: ".interior", face: "DM Sans 400", size: "14px, line 1.7", use: "Body copy", source: INTERIOR, css: "font:14px/1.7 var(--font-dm-sans)" },
  { cls: ".action-link", face: "DM Sans 700", size: "12px", use: "Links that look like buttons", source: INTERIOR, css: "padding:11px 16px;text-decoration:none;font-size:12px;font-weight:700" },
  { cls: ".page-kicker", face: "DM Sans 700", size: "10px, capitals, 0.14em apart", use: "The small line above a page title", source: INTERIOR, css: ".interior .page-kicker{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase" },
];

// ── spacing, rules and corners ───────────────────────────────────────────

export const SPACING: readonly ({ px: number; use: string } & Sourced)[] = [
  { px: 8, use: "Between filter tabs", source: INTERIOR, css: ".interior .filter-tabs{display:flex;gap:8px" },
  { px: 12, use: "Inside a tile, between its parts", source: INTERIOR, css: "flex-direction:column;gap:12px" },
  { px: 14, use: "A project card's padding", source: INTERIOR, css: "gap:14px;background:var(--sheet);padding:14px 14px 20px" },
  { px: 20, use: "The sheet's side padding on a phone", source: INTERIOR, css: "@media(max-width:640px){.interior{padding:22px 20px 35px}" },
  { px: 28, use: "Between columns of cards", source: INTERIOR, css: "column-gap:28px" },
  { px: 30, use: "The sheet's side padding on a desk", source: INTERIOR, css: "padding:26px 30px 42px" },
  { px: 35, use: "Between rows of cards and chapters", source: INTERIOR, css: "row-gap:35px" },
  { px: 45, use: "Above a page title", source: INTERIOR, css: "padding:45px 0 50px" },
];

export const LAYOUT: readonly ({ name: string; value: string; use: string } & Sourced)[] = [
  { name: "Column", value: "1240px", use: "The widest the sheet gets. Past that, the teal margin shows", source: SHELL, css: "max-width: 1240px;" },
  { name: "Margin", value: "--bm-deep", use: "The dark teal behind the column", source: SHELL, css: "background: var(--bm-deep);" },
  { name: "Breakpoint", value: "640px", use: "Below it, every grid on an inner page is one column", source: INTERIOR, css: "@media(max-width:640px)" },
  { name: "Intro measure", value: "36ch", use: "The line length of the intro beside a page title", source: INTERIOR, css: ".interior .page-intro{max-width:36ch" },
  { name: "Reading measure", value: "60ch", use: "The line length of a blog teaser", source: INTERIOR, css: "max-width:60ch" },
];

export const RULES: readonly ({ px: number; use: string } & Sourced)[] = [
  { px: 1, use: "Hairlines: under the top row, between list items", source: INTERIOR, css: "border-bottom:1px solid;padding-bottom:16px" },
  { px: 2, use: "A boxed link's border, and the line over a blog entry", source: INTERIOR, css: "min-height:48px;border:2px solid" },
  { px: 4, use: "Under the header", source: HOME, css: "border-bottom:4px solid var(--nav-ink)" },
  { px: 5, use: "The rule that opens a section", source: INTERIOR, css: ".interior .section-rule{border-top:5px solid" },
  { px: 7, use: "The top of the footer", source: "src/components/beachmag/footer.css", css: "border-top:7px solid" },
];

export const SHADOWS: readonly ({ name: string; value: string; use: string } & Sourced)[] = [
  { name: "Link", value: "3px 3px 0 var(--ink)", use: "A boxed link", source: INTERIOR, css: "box-shadow:3px 3px 0 var(--ink)" },
  { name: "Card", value: "4px 4px 0 var(--ink)", use: "A service card under the pointer", source: INTERIOR, css: "box-shadow:4px 4px 0 var(--ink)" },
  { name: "Polaroid", value: "5px 7px 0 var(--ink)", use: "The photo beside a page title", source: INTERIOR, css: "box-shadow:5px 7px 0 var(--ink)" },
];

export const TILTS: readonly ({ deg: number; use: string } & Sourced)[] = [
  { deg: 7, use: "The ribbon", source: SHELL, css: "transform: rotate(7deg);" },
  { deg: 4, use: "The polaroid beside a page title", source: INTERIOR, css: "padding:9px 9px 19px;transform:rotate(4deg)" },
  { deg: -3, use: "The Let's meet link", source: SHELL, css: "transform: rotate(-3deg);" },
  { deg: -2, use: "A photo in a story row. The next one leans 2 degrees the other way", source: INTERIOR, css: "padding:8px 8px 18px;transform:rotate(-2deg)" },
  { deg: -1, use: "The letter on the contact page", source: INTERIOR, css: "transform:rotate(-1deg)}" },
];

// ── components ───────────────────────────────────────────────────────────

export type ComponentId =
  | "radio-key" | "edition-knob" | "action-link" | "lets-meet" | "ribbon" | "section-rule"
  | "filter-tabs" | "conference-tile" | "end-note" | "event-row" | "tags";

export type ComponentEntry = { id: ComponentId; name: string; cls: string; what: string; where: string; live?: boolean } & Sourced;

/** Classes that work anywhere on an inner page. */
export const COMPONENTS: readonly ComponentEntry[] = [
  { id: "radio-key", name: "Radio key", cls: ".radio-key", what: "A brushed-silver key that presses down like the ones on the radio. Press one.", where: "The link page, the resume downloads, the Play button further down this page", source: SHELL, css: ".radio-key:active" },
  { id: "edition-knob", name: "Edition knob", cls: ".edition-switch", what: "A chicken-head knob that turns between Sunlit and After dark. This one is wired up, so it flips the whole site.", where: "The top row of every page", live: true, source: SHELL, css: ".edition-switch[aria-checked=\"true\"] .edition-knob" },
  { id: "action-link", name: "Action link", cls: ".action-link", what: "A boxed link with a hard shadow. It fills with ink when you point at it.", where: "Project cards, the contact letter, the end of this page", source: INTERIOR, css: ".interior .action-link:hover{background:var(--ink);color:var(--paper)}" },
  { id: "lets-meet", name: "Let's meet link", cls: ".menu-meet", what: "A boxed link that sits 3 degrees off level and straightens when you point at it.", where: "The bottom of the menu. The footer of this page has two more, as .footer-contact", source: SHELL, css: ".menu-meet:hover" },
  { id: "ribbon", name: "Ribbon", cls: ".sticker", what: "A tilted orange ribbon set in Bodoni italic. The inline kind tilts less, so a longer line stays readable.", where: "The home page photo, and the teaser under a blog post's title", source: SHELL, css: ".interior .sticker {" },
  { id: "section-rule", name: "Section rule", cls: ".section-rule", what: "A thick rule with a small label at each end.", where: "The top of every section on this page, and on About, Projects and Blog", source: INTERIOR, css: ".interior .section-rule{border-top:5px solid" },
  { id: "filter-tabs", name: "Filter tabs", cls: ".filter-tabs", what: "Outlined buttons in a row. The chosen one fills with ink.", where: "Projects, and the years on Conferences", source: INTERIOR, css: ".interior .filter-tabs button[aria-pressed=true]{background:var(--ink);color:var(--paper)}" },
  { id: "conference-tile", name: "Conference tile", cls: ".resource-tile", what: "Dates, a logo on a cream plate, the name and a short blurb. It lifts when you point at it. This one is a real link.", where: "Conferences", live: true, source: INTERIOR, css: ".interior .resource-tile{background:var(--sheet);border-top:3px solid" },
  { id: "end-note", name: "End note", cls: ".end-note", what: "An ink band that closes a page with one line and a way out.", where: "About, Projects, and the bottom of this page", source: INTERIOR, css: ".interior .end-note{padding:28px" },
];

/** Classes that belong to the home page's sheet, which Events shares. */
export const HOME_COMPONENTS: readonly ComponentEntry[] = [
  { id: "event-row", name: "Event row", cls: ".event", what: "The day, set big in Bodoni, beside the event's name and place. A meetup that repeats gets its series name as a small orange label.", where: "See you out there, on the home page, and the Events calendar", source: SHELL, css: "#coastal-art .event .event-series {" },
  { id: "tags", name: "Tags", cls: ".event-tags", what: "Small outlined labels in capitals.", where: "An event's page", source: SHELL, css: "#coastal-art .event-tags li {" },
];

// ── motion ───────────────────────────────────────────────────────────────

export const MOTION_TOKENS: readonly { token: string; value: string; use: string }[] = [
  { token: "motion-fast", value: "160ms", use: "Small arrivals: the skip link, a menu card" },
  { token: "ease-out", value: "cubic-bezier(0.16, 1, 0.3, 1)", use: "A thing arriving" },
  { token: "ease-standard", value: "cubic-bezier(0.4, 0, 0.2, 1)", use: "A change between two states" },
  { token: "ease-pop", value: "cubic-bezier(0.2, 1.5, 0.4, 1)", use: "The bouncy press: keys, knobs, the life preserver" },
  { token: "ease-snap", value: "cubic-bezier(0.7, 0, 0.15, 1)", use: "The menu taking over the screen" },
];

/** One lane of the demo: a real part, how long its move takes, and on which curve. */
export const MOTION_LANES: readonly ({ name: string; ms: number; easing: string } & Sourced)[] = [
  { name: "A radio key pressing down", ms: 70, easing: "ease", source: SHELL, css: "transition: transform 70ms, box-shadow 70ms;" },
  { name: "The skip link dropping in", ms: 160, easing: "ease", source: SHELL, css: "transition: transform var(--motion-fast) ease;" },
  { name: "Let's meet straightening", ms: 200, easing: "ease", source: SHELL, css: "transition: transform 200ms;" },
  { name: "A polaroid lifting", ms: 350, easing: "ease", source: INTERIOR, css: "transition:transform 350ms" },
  { name: "The edition knob turning", ms: 360, easing: "cubic-bezier(0.3, 1.45, 0.5, 1)", source: SHELL, css: "transition: transform 360ms cubic-bezier(0.3, 1.45, 0.5, 1);" },
  { name: "The menu taking over", ms: 700, easing: "var(--ease-snap)", source: HOME, css: "transition:clip-path 700ms cubic-bezier(.7,0,.15,1)" },
];

// ── accessibility ────────────────────────────────────────────────────────

export const A11Y_RULES: readonly { title: string; body: string }[] = [
  { title: "Focus you can see", body: "A 3px dark ring, 4px off the control, with a cream halo around it. One of the two shows on paper, on a photo and on the radio's metal." },
  { title: "Targets you can hit", body: "Keys, tabs and boxed links are at least 44px tall, the size a thumb needs." },
  { title: "Skip to the content", body: "The first Tab stop on every page is a link that jumps past the menu." },
  { title: "Reduce Motion is honored", body: "The tilts, the key presses and the menu takeover stop animating. Things still change. They just don't travel." },
  { title: "Both editions are measured", body: "The contrast ratios in the Colors section are worked out from the same values the stylesheet uses, once for Sunlit and once for After dark." },
  { title: "Examples stay out of the way", body: "An example that does nothing is hidden from screen readers, and the words beside it say what it is." },
];

/** Every stylesheet claim on the page, for the test that checks them. */
export const SOURCED: readonly Sourced[] = [
  ...TYPE_SCALE, ...SPACING, ...LAYOUT, ...RULES, ...SHADOWS, ...TILTS, ...COMPONENTS, ...HOME_COMPONENTS, ...MOTION_LANES,
];

export const TOKEN_FILES = { interior: INTERIOR, shell: SHELL, globals: GLOBALS } as const;

/** The count of named colors on the page, for the closing line. */
export const COLOR_TOKEN_COUNT = PAGE_COLORS.length + COLOR_GROUPS.reduce((sum, group) => sum + group.tokens.length, 0);
