import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Download } from "lucide-react";
import { EditionButtons } from "@/components/beachmag/edition-buttons";
import { EndNote } from "@/components/beachmag/interior-parts";
import { Ribbon } from "@/components/beachmag/ribbon";
import {
  A11Y_RULES, BC_CHANGES, BC_COLOR_GROUPS, BC_FACES, BC_SECTIONS, COAST_MAP, COLOR_GROUPS, COLOR_TOKEN_COUNT,
  COMPONENTS, HOME_COMPONENTS, LAYOUT, LOGO_MARKS, MOTION_TOKENS, PAGE_COLORS, PRINCIPLES, RULES, SECTIONS, SHADOWS,
  SPACING, TILTS, TYPE_SCALE, type ComponentEntry, type ComponentId, type Section,
} from "@/data/design-system";
import { contrastRatio } from "@/lib/color-contrast";
import { HomeSheet } from "./HomeSheet";
import { MotionDemo } from "./MotionDemo";
import { SystemToggle } from "./SystemToggle";
import "@/components/beachmag/design-system.css";

/* /design-system: the magazine skin, written down.
 *
 * The page is built from the parts it describes: every section opens with a
 * .section-rule, the index is the article index, the Play button is a
 * .radio-key and the page closes with an .end-note. The examples are the real
 * classes too, so they can't drift from the site. One that does nothing is
 * hidden from assistive tech and described in the words beside it.
 *
 * The values printed here live in src/data/design-system.ts, which a test
 * checks against the stylesheets. */

const file = (path: string) => path.split("/").pop();
const number = (id: string, sections: readonly Section[]) =>
  String(sections.findIndex((section) => section.id === id) + 1).padStart(2, "0");

/** A section's opening: the rule, the heading with its last word in the accent, and a deck. */
function SectionHead({ id, tag, children, sections = SECTIONS }: { id: string; tag: string; children: ReactNode; sections?: readonly Section[] }) {
  const title = sections.find((section) => section.id === id)!.title;
  const split = title.lastIndexOf(" ");
  return (
    <header className="ds-head">
      <div className="section-rule">
        <p>SECTION {number(id, sections)}</p>
        <p>{tag}</p>
      </div>
      <h2 id={`${id}-h`}>
        {split < 0 ? <em>{title}.</em> : <>{title.slice(0, split)} <em>{title.slice(split + 1)}.</em></>}
      </h2>
      <p className="ds-deck">{children}</p>
    </header>
  );
}

/** An example in its frame. Hidden from assistive tech unless it's a working control. */
function Live({ caption, children, working = false }: { caption: ReactNode; children: ReactNode; working?: boolean }) {
  return (
    <div className="ds-live" aria-hidden={working ? undefined : true}>
      <div className="ds-live__body">{children}</div>
      <p className="ds-live__cap">{caption}</p>
    </div>
  );
}

function Principles() {
  return (
    <section className="ds-sec" id="principles" aria-labelledby="principles-h">
      <SectionHead id="principles" tag="SEVEN RULES">
        Seven rules the pages follow. You can check each one against this page.
      </SectionHead>
      <ol className="ds-cards">
        {PRINCIPLES.map((principle, index) => (
          <li key={principle.title} className="ds-card">
            <p className="ds-card__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="ds-h3">{principle.title}</h3>
            <p>{principle.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The two marks: the wave for Beachmag, the sunset palm for the Beach City edition. */
function Logo({ id = "logo", sections = SECTIONS }: { id?: string; sections?: readonly Section[] }) {
  return (
    <section className="ds-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHead id={id} tag={`${LOGO_MARKS.length} MARKS`} sections={sections}>
        Three waves for the magazine, and a sunset palm for the Beach City edition. Both are here to download.
      </SectionHead>
      <ul className="ds-logos ds-logos--two">
        {LOGO_MARKS.map((mark) => (
          <li key={mark.title} className="ds-logo">
            <div className="ds-logo__plate">
              <Image src={mark.image} alt={mark.alt} fill sizes="(max-width: 640px) 90vw, 480px" />
            </div>
            <h3 className="ds-h3">{mark.title}</h3>
            <p>{mark.description}</p>
            <a className="action-link" href={mark.image} download aria-label={`Download image: ${mark.title}`}>
              Download image <Download size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Text and background pairs the pages use, measured in both editions. */
const PAIRS: readonly { text: string; on: string; use: string }[] = [
  { text: "ink", on: "paper", use: "Body copy" },
  { text: "ink", on: "sheet", use: "Copy on a card" },
  { text: "accent", on: "paper", use: "A headline's last word, small labels" },
  { text: "accent", on: "sheet", use: "Labels on a card" },
  { text: "paper", on: "ink", use: "A chosen tab, the end note" },
  { text: "paper", on: "accent", use: "The ribbon" },
];

const pageColor = (token: string) => PAGE_COLORS.find((color) => color.token === token)!;

function Ratio({ text, on, edition }: { text: string; on: string; edition: "light" | "dark" }) {
  const ratio = contrastRatio(pageColor(text)[edition], pageColor(on)[edition]);
  if (ratio === null) return null;
  // WCAG 2.1 AA: 4.5:1 for body text, 3:1 for large text.
  return <>{ratio.toFixed(1)}:1 <span className="ds-verdict">{ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA, large text" : "too low"}</span></>;
}

function Colors() {
  return (
    <section className="ds-sec" id="colors" aria-labelledby="colors-h">
      <SectionHead id="colors" tag={`${COLOR_TOKEN_COUNT} NAMED COLORS`}>
        Four colors paint an inner page, and each has a Sunlit value and an After dark value. The swatches are painted
        by the variables themselves, so turn the knob and they flip.
      </SectionHead>

      <div className="ds-group">
        <div className="ds-group__head">
          <h3 className="ds-h3">The page</h3>
          <EditionButtons />
        </div>
        <p className="ds-note">Set on <code>.interior</code> in <code>interior.css</code>. Other names on the site point back at these four.</p>
        <ul className="ds-swatches ds-swatches--page">
          {PAGE_COLORS.map((color) => (
            <li key={color.token} className="ds-swatch">
              <span className="ds-swatch__chip" style={{ background: `var(--${color.token})` }} aria-hidden="true" />
              <code className="ds-swatch__name">--{color.token}</code>
              <p className="ds-swatch__use">{color.use}</p>
              <dl className="ds-swatch__vals">
                <div><dt>Sunlit</dt><dd><code>{color.light}</code></dd></div>
                <div><dt>After dark</dt><dd><code>{color.dark}</code></dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="ds-scroll">
          <table className="ds-table">
            <caption>Contrast of the pairs that carry text</caption>
            <thead>
              <tr><th scope="col">Pair</th><th scope="col">Sunlit</th><th scope="col">After dark</th><th scope="col">Used for</th></tr>
            </thead>
            <tbody>
              {PAIRS.map((pair) => (
                <tr key={`${pair.text}-${pair.on}`}>
                  <th scope="row">
                    <span className="ds-pair" style={{ color: `var(--${pair.text})`, background: `var(--${pair.on})` }} aria-hidden="true">Aa</span>
                    {pair.text} on {pair.on}
                  </th>
                  <td><Ratio text={pair.text} on={pair.on} edition="light" /></td>
                  <td><Ratio text={pair.text} on={pair.on} edition="dark" /></td>
                  <td>{pair.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {COLOR_GROUPS.map((group) => (
        <div key={group.title} className="ds-group">
          <h3 className="ds-h3">{group.title}</h3>
          <p className="ds-note">{group.note}</p>
          <ul className="ds-swatches">
            {group.tokens.map((token) => (
              <li key={token.token} className="ds-swatch">
                <span className="ds-swatch__chip" style={{ background: `var(--${token.token})` }} aria-hidden="true" />
                <code className="ds-swatch__name">--{token.token}</code>
                <p className="ds-swatch__use">{token.use}</p>
                <p className="ds-swatch__vals"><code>{token.value}</code></p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="ds-group">
        <h3 className="ds-h3">Old names, new paint</h3>
        <p className="ds-note">
          Some inner pages still hold content from the beach site that came before this one, and that content paints
          with <code>--coast-*</code> variables. <code>shell.css</code> points each of them at the magazine&rsquo;s
          colors, so old content wears the new palette without a rewrite.
        </p>
        <div className="ds-scroll">
          <table className="ds-table">
            <caption>What each --coast-* variable reads now</caption>
            <thead><tr><th scope="col">Old name</th><th scope="col">Reads</th><th scope="col">In plain words</th></tr></thead>
            <tbody>
              {COAST_MAP.map((row) => (
                <tr key={row.from}><th scope="row"><code>--{row.from}</code></th><td><code>{row.to}</code></td><td>{row.plain}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Typography() {
  return (
    <section className="ds-sec" id="typography" aria-labelledby="typography-h">
      <SectionHead id="typography" tag="2 TYPEFACES">
        Bodoni Moda sets the headlines, in one weight: 900, upright and italic. DM Sans sets everything else, in 400,
        500 and 700. Both are served from this site.
      </SectionHead>
      <div className="ds-faces" aria-hidden="true">
        <div className="ds-face">
          <p className="ds-face__glyphs ds-face__glyphs--display">Aa <em>Aa</em></p>
          <p className="ds-face__name">Bodoni Moda 900</p>
          <p className="ds-face__line ds-face__line--display">See you <em>out there.</em></p>
        </div>
        <div className="ds-face">
          <p className="ds-face__glyphs"><span>Aa</span> <span>Aa</span> <span>Aa</span></p>
          <p className="ds-face__name">DM Sans 400 / 500 / 700</p>
          <p className="ds-face__line">I consult, design, and develop web interfaces.</p>
        </div>
      </div>
      <Live caption="A kicker, an intro, body copy and an end note, as the stylesheet sets them">
        <div className="ds-typeset">
          <p className="page-kicker">Field notes</p>
          <p className="page-intro">The intro beside a page title runs 36 characters wide, so it reads like a caption.</p>
          <p>Body copy is DM Sans at 14px, with 1.7 between the lines.</p>
          <div className="end-note"><p>Good people. Good conversations.</p></div>
        </div>
      </Live>
      <div className="ds-scroll">
        <table className="ds-table">
          <caption>The type scale</caption>
          <thead><tr><th scope="col">Class</th><th scope="col">Face</th><th scope="col">Size</th><th scope="col">Used for</th></tr></thead>
          <tbody>
            {TYPE_SCALE.map((row) => (
              <tr key={row.cls}><th scope="row"><code>{row.cls}</code></th><td>{row.face}</td><td>{row.size}</td><td>{row.use}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ds-note">
        Sizes are set on the class, not in tokens. Only the titles are fluid. The title at the top of this page is
        the <code>h1</code>, and every section heading here is the <code>h2</code>.
      </p>
    </section>
  );
}

function Spacing() {
  return (
    <section className="ds-sec" id="spacing" aria-labelledby="spacing-h">
      <SectionHead id="spacing" tag="NO TOKENS YET">
        There are no spacing tokens yet. These are the gaps the sheet uses most, read out of <code>interior.css</code>.
      </SectionHead>

      <div className="ds-group">
        <h3 className="ds-h3">Spacing</h3>
        <ul className="ds-scale">
          {SPACING.map((step) => (
            <li key={step.px}>
              <span className="ds-scale__bar" style={{ "--ds-w": step.px } as CSSProperties} aria-hidden="true" />
              <span className="ds-scale__px">{step.px}px</span>
              <span className="ds-scale__use">{step.use}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="ds-group">
        <h3 className="ds-h3">Layout</h3>
        <div className="ds-scroll">
          <table className="ds-table">
            <caption>Layout measures</caption>
            <thead><tr><th scope="col">Measure</th><th scope="col">Value</th><th scope="col">Used for</th></tr></thead>
            <tbody>
              {LAYOUT.map((row) => (
                <tr key={row.name}><th scope="row">{row.name}</th><td><code>{row.value}</code></td><td>{row.use}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ds-group">
        <h3 className="ds-h3">Rules</h3>
        <p className="ds-note">A line&rsquo;s weight says how big a break it is.</p>
        <ul className="ds-rules">
          {RULES.map((rule) => (
            <li key={rule.px}>
              <span className="ds-rules__line" style={{ borderTopWidth: rule.px }} aria-hidden="true" />
              <span className="ds-scale__px">{rule.px}px</span>
              <span className="ds-scale__use">{rule.use}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="ds-group">
        <h3 className="ds-h3">Corners, shadows and tilt</h3>
        <p className="ds-note">
          Corners are square. The only curves are on the hardware: a radio key has a 3px corner and a knob is a circle.
        </p>
        <div className="ds-pairgrid">
          <div>
            <Live caption="The three hard shadows">
              <div className="ds-row">
                {SHADOWS.map((shadow) => (
                  <span key={shadow.name} className="ds-box" style={{ boxShadow: shadow.value }}>{shadow.name}</span>
                ))}
              </div>
            </Live>
            <ul className="ds-list">
              {SHADOWS.map((shadow) => (
                <li key={shadow.name}><code>{shadow.value}</code> {shadow.use}</li>
              ))}
            </ul>
          </div>
          <div>
            <Live caption="Five tilts, from the ribbon to the contact letter">
              <div className="ds-row">
                {TILTS.map((tilt) => (
                  <span key={tilt.deg} className="ds-box" style={{ transform: `rotate(${tilt.deg}deg)` }}>{tilt.deg}&deg;</span>
                ))}
              </div>
            </Live>
            <ul className="ds-list">
              {TILTS.map((tilt) => (
                <li key={tilt.deg}><code>{tilt.deg}deg</code> {tilt.use}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The real classes, with a line of real copy from the page each one lives on. */
function Specimen({ id }: { id: ComponentId }) {
  switch (id) {
    case "radio-key":
      return (
        <div className="ds-keys">
          <span className="radio-key"><Download size={16} aria-hidden="true" /> Resume, PDF</span>
          <span className="radio-key">GitHub</span>
        </div>
      );
    case "edition-knob":
      return <EditionButtons />;
    case "action-link":
      return <span className="action-link">Read the write-up <span>↗</span></span>;
    case "lets-meet":
      return <span className="menu-meet">LET’S MEET <span>↗</span></span>;
    case "ribbon":
      return (
        <div className="ds-ribbons">
          <Ribbon>Now on the First Coast.</Ribbon>
          <Ribbon inline>The inline kind runs longer and tilts less.</Ribbon>
        </div>
      );
    case "section-rule":
      return (
        <div className="section-rule">
          <p>A FEW CHAPTERS OF MY LIFE</p>
          <p>FLORIDA / VIRGINIA / BACK AGAIN</p>
        </div>
      );
    case "filter-tabs":
      // Real buttons, because the stylesheet styles buttons. inert keeps them out of the tab order.
      return (
        <div className="filter-tabs" inert>
          <button type="button" aria-pressed="true">All</button>
          <button type="button" aria-pressed="false">Apps</button>
          <button type="button" aria-pressed="false">Websites</button>
        </div>
      );
    case "conference-tile":
      return (
        <Link className="resource-tile" href="/conferences">
          <small>Oct 26 – 28, 2025</small>
          <span className="tile-logo">
            <Image src="/conferences/All-Things-Open-2025.webp" alt="All Things Open logo" fill sizes="(max-width: 640px) 90vw, 480px" />
          </span>
          <strong>All Things Open <span aria-hidden="true">↗</span></strong>
          <p>Open source, cloud and AI at the Raleigh Convention Center. Every conference is on the Conferences page.</p>
        </Link>
      );
    case "end-note":
      return (
        <div className="end-note">
          <p>Something on your mind?</p>
          <span className="ds-end-link">Let’s build it ↗</span>
        </div>
      );
    case "event-row":
      return (
        <div className="ds-events">
          <div className="event">
            <time dateTime="2026-11-10">NOV<b>10</b></time>
            <div>
              <span className="event-series">AI Connect Jax</span>
              <strong>From Signals to Closed Loops</strong>
              <small>Legacy Ale Works · Jacksonville, FL · 5:30–7 PM ET</small>
            </div>
          </div>
          <div className="event">
            <time dateTime="2026-11-12">NOV<b>12</b></time>
            <div>
              <strong>Saint Augustine Cowork and Coffee</strong>
              <small>Dos Coffee &amp; Wine · St. Augustine · 9 AM–noon ET</small>
            </div>
          </div>
        </div>
      );
    case "tags":
      return (
        <ul className="event-tags">
          <li>St. Aug</li>
          <li>Bayard</li>
        </ul>
      );
  }
}

function ComponentList({ entries }: { entries: readonly ComponentEntry[] }) {
  return (
    <ul className="ds-comps">
      {entries.map((entry) => (
        <li key={entry.id} className="ds-comp">
          <Live caption={<code>{entry.cls}</code>} working={entry.live}>
            <Specimen id={entry.id} />
          </Live>
          <h4 className="ds-comp__name">{entry.name}</h4>
          <p>{entry.what}</p>
          <p className="ds-comp__where"><b>Where:</b> {entry.where}.</p>
          <p className="ds-comp__src"><code>{file(entry.source)}</code></p>
        </li>
      ))}
    </ul>
  );
}

function Components() {
  return (
    <section className="ds-sec" id="components" aria-labelledby="components-h">
      <SectionHead id="components" tag={`${COMPONENTS.length + HOME_COMPONENTS.length} PARTS`}>
        The classes the pages are built from. These are the real ones, not pictures, so point at them and press them.
      </SectionHead>
      <div className="ds-group">
        <h3 className="ds-h3">On every inner page</h3>
        <ComponentList entries={COMPONENTS} />
      </div>
      <HomeSheet>
        <h3 className="ds-h3">On the home page and Events</h3>
        <p className="ds-note">
          The home page is its own sheet, with its own stylesheet. Its paper is a shade warmer than an inner
          page&rsquo;s.
        </p>
        <ComponentList entries={HOME_COMPONENTS} />
      </HomeSheet>
    </section>
  );
}

function Motion() {
  return (
    <section className="ds-sec" id="motion" aria-labelledby="motion-h">
      <SectionHead id="motion" tag="SHORT AND ON REQUEST">
        Most motion answers you: press a key, turn the knob, open the menu. The moves are short. Press Play to run
        six of them side by side.
      </SectionHead>
      <MotionDemo />
      <div className="ds-scroll">
        <table className="ds-table">
          <caption>Motion tokens in globals.css</caption>
          <thead><tr><th scope="col">Token</th><th scope="col">Value</th><th scope="col">Used for</th></tr></thead>
          <tbody>
            {MOTION_TOKENS.map((row) => (
              <tr key={row.token}><th scope="row"><code>--{row.token}</code></th><td><code>{row.value}</code></td><td>{row.use}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Accessibility() {
  return (
    <section className="ds-sec" id="accessibility" aria-labelledby="accessibility-h">
      <SectionHead id="accessibility" tag="WCAG 2.1 AA">
        What every page does, whatever it&rsquo;s about.
      </SectionHead>
      <ul className="ds-cards">
        {A11Y_RULES.map((rule) => (
          <li key={rule.title} className="ds-card">
            <h3 className="ds-h3">{rule.title}</h3>
            <p>{rule.body}</p>
          </li>
        ))}
      </ul>
      <p className="ds-note">
        <code>pnpm check:a11y</code> runs axe over the pages in both editions, at desk and phone widths.
      </p>
    </section>
  );
}

function Coda() {
  return (
    <section className="ds-coda" aria-labelledby="coda-h">
      <div>
        <h2 id="coda-h">Why write it <em>down.</em></h2>
        <p className="ds-deck">
          Because I forget. Six months from now I&rsquo;ll need a button, and I won&rsquo;t remember what the last one
          looked like. Now there&rsquo;s a page for that.
        </p>
        <p className="ds-note">
          Everything above comes from the site&rsquo;s own stylesheets: <code>globals.css</code>,{" "}
          <code>interior.css</code> and <code>shell.css</code>. A test fails when this page and a stylesheet disagree.
        </p>
      </div>
      <div className="ds-coda__actions">
        <Link className="action-link" href="/site-history">History of this site <span aria-hidden="true">↗</span></Link>
        <Link className="action-link" href="/site-map">Change log and site map <span aria-hidden="true">↗</span></Link>
        <p className="ds-coda__foot">
          <b>{COLOR_TOKEN_COUNT}</b> named colors · <b>{COMPONENTS.length + HOME_COMPONENTS.length}</b> components ·{" "}
          <b>2</b> typefaces · <b>2</b> editions
        </p>
      </div>
    </section>
  );
}

/* ── Beach City: the short version ────────────────────────────────────── */

function BcColors() {
  return (
    <section className="ds-sec" id="bc-colors" aria-labelledby="bc-colors-h">
      <SectionHead id="bc-colors" tag={`${BC_COLOR_GROUPS.reduce((sum, group) => sum + group.tokens.length, 0)} NAMED COLORS`} sections={BC_SECTIONS}>
        The edition repoints the page&rsquo;s colors at these. Turn the knob to see BC days and BC nights.
      </SectionHead>
      {BC_COLOR_GROUPS.map((group) => (
        <div key={group.title} className="ds-group">
          <div className="ds-group__head">
            <h3 className="ds-h3">{group.title}</h3>
          </div>
          <p className="ds-note">{group.note}</p>
          <ul className="ds-swatches">
            {group.tokens.map((token) => (
              <li key={token.token} className="ds-swatch">
                <span className="ds-swatch__chip" style={{ background: `var(--${token.token})` }} aria-hidden="true" />
                <code className="ds-swatch__name">--{token.token}</code>
                <p className="ds-swatch__use">{token.use}</p>
                <p className="ds-swatch__vals"><code>{token.value}</code></p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function BcTypography() {
  return (
    <section className="ds-sec" id="bc-typography" aria-labelledby="bc-typography-h">
      <SectionHead id="bc-typography" tag={`${BC_FACES.length} DISPLAY FACES`} sections={BC_SECTIONS}>
        Three display faces take over the headlines. DM Sans still sets everything else. They load only while the
        edition is on.
      </SectionHead>
      <div className="ds-faces ds-faces--bc">
        {BC_FACES.map((face) => (
          <div key={face.name} className="ds-face">
            <p className="ds-face__line ds-face__line--bc" style={{ fontFamily: `var(${face.variable}), cursive` }} aria-hidden="true">
              {face.sample}
            </p>
            <p className="ds-face__name">{face.name}</p>
            <p className="ds-note">{face.use}. <code>{face.variable}</code></p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BcChanges() {
  return (
    <section className="ds-sec" id="bc-changes" aria-labelledby="bc-changes-h">
      <SectionHead id="bc-changes" tag={`${BC_CHANGES.length} PARTS`} sections={BC_SECTIONS}>
        It&rsquo;s a layer, not a second site: the sections keep their markup and read new colors.
      </SectionHead>
      <div className="ds-scroll">
        <table className="ds-table">
          <caption>What the Beach City edition changes</caption>
          <thead><tr><th scope="col">Part</th><th scope="col">Change</th><th scope="col">Where</th></tr></thead>
          <tbody>
            {BC_CHANGES.map((row) => (
              <tr key={row.part}><th scope="row">{row.part}</th><td>{row.change}</td><td><code>{row.file}</code></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BcSwitch() {
  return (
    <section className="ds-sec" id="bc-switch" aria-labelledby="bc-switch-h">
      <SectionHead id="bc-switch" tag="THREE WAYS" sections={BC_SECTIONS}>
        A script in the page&rsquo;s head sets the edition before anything paints, so it never flashes the beach look.
      </SectionHead>
      <ol className="ds-cards">
        <li className="ds-card">
          <h3 className="ds-h3">On the day</h3>
          <p>It turns on by itself for 11-19-2026 on Eastern time (<code>src/lib/vice-day.ts</code>).</p>
        </li>
        <li className="ds-card">
          <h3 className="ds-h3">In the address</h3>
          <p>Add <code>?vice=on</code> to any page to see it, or <code>?vice=off</code> to hide it, for the rest of the tab.</p>
        </li>
        <li className="ds-card">
          <h3 className="ds-h3">On this page</h3>
          <p>The Beachmag / Beach City toggle at the top does the same thing.</p>
        </li>
      </ol>
      <p className="ds-note">
        In the code it&rsquo;s still called <code>vice</code>: the class <code>html.vice</code>, the{" "}
        <code>--vice-*</code> tokens and <code>vice.css</code>.
      </p>
    </section>
  );
}

function Index({ sections }: { sections: readonly Section[] }) {
  return (
    <nav className="article-index" aria-label="On this page">
      <p>ON THIS PAGE ↓</p>
      {sections.map((section) => (
        <a key={section.id} href={`#${section.id}`}>{section.title}</a>
      ))}
    </nav>
  );
}

export default function DesignSystem() {
  return (
    <div className="ds">
      <div className="ds-system-bar">
        <p>DESIGN SYSTEM</p>
        <SystemToggle />
      </div>
      {/* Both systems render; design-system.css shows the one that matches html.vice,
          so the head script picks the right one before first paint. */}
      <div className="archive-layout-wide ds-edition ds-edition--beachmag">
        <Index sections={SECTIONS} />
        <div className="ds-body">
          <Principles />
          <Logo />
          <Colors />
          <Typography />
          <Spacing />
          <Components />
          <Motion />
          <Accessibility />
          <Coda />
        </div>
      </div>
      <div className="archive-layout-wide ds-edition ds-edition--beachcity">
        <Index sections={BC_SECTIONS} />
        <div className="ds-body">
          <Logo id="bc-logo" sections={BC_SECTIONS} />
          <BcColors />
          <BcTypography />
          <BcChanges />
          <BcSwitch />
        </div>
      </div>
      <EndNote line="That's the whole kit." href="/" label="Back to the front page" />
    </div>
  );
}
