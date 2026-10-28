import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BANNER_SCENES } from "@/components/coastal/scene-banner";
import { SceneLoop } from "@/components/coastal/scene-loop";
import { EditionRow, type Crumb } from "./edition-row";

// The pieces inner pages are built from (design/site). Styles: interior.css.

/** A page's 3D beach scene (day and night, looping when allowed) in the taped polaroid. */
export function ScenePolaroid({ path, caption, className = "" }: { path: string; caption: ReactNode; className?: string }) {
  const scene = BANNER_SCENES[path] ?? BANNER_SCENES["/about"];
  return (
    <figure className={`page-polaroid ${className}`.trim()} data-scene-path={path}>
      <div className="polaroid-scene" style={{ "--scene-focus": scene.focus } as CSSProperties}>
        <SceneLoop scene={scene} sizes="(max-width: 640px) 90vw, 520px" preload />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Main pages: kicker, headline and intro beside the scene polaroid. Blog
 *  posts use it too, with their breadcrumbs in the top row and `article`
 *  set so a long title steps down a size. */
export function PageHero({ kicker, title, intro, path, caption, crumbs, article = false }: {
  kicker: string;
  title: ReactNode;
  intro: ReactNode;
  path: string;
  caption: ReactNode;
  crumbs?: Crumb[];
  article?: boolean;
}) {
  return (
    <>
      {crumbs && <EditionRow crumbs={crumbs} className="hero-row" />}
      <header className={article ? "page-hero article-hero" : "page-hero"}>
        <div>
          <p className="page-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="page-intro">{intro}</p>
        </div>
        <ScenePolaroid path={path} caption={caption} />
      </header>
    </>
  );
}

export type { Crumb };

/** Articles, projects and conferences: the top row with full breadcrumbs, then the title beside a small polaroid. */
export function ArchiveHero({ crumbs, kicker, title, intro, path, caption = "A little world. A big rabbit hole." }: {
  crumbs: Crumb[];
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  path: string;
  caption?: ReactNode;
}) {
  return (
    <>
      <EditionRow crumbs={crumbs} className="hero-row" />
      <header className="archive-hero">
        <p className="page-kicker">{kicker}</p>
        <div>
          <h1>{title}</h1>
          {intro && <p className="page-intro">{intro}</p>}
        </div>
        <ScenePolaroid path={path} caption={caption} className="archive-banner" />
      </header>
    </>
  );
}

export type IndexEntry = { id: string; label: string };

/** "In this edition": a jump list beside the prose. Without entries the prose runs full width. */
export function ArchiveLayout({ index, children }: { index: IndexEntry[]; children: ReactNode }) {
  if (!index.length) return <div className="archive-prose">{children}</div>;
  return (
    <div className="archive-layout-wide">
      <nav className="article-index" aria-label="In this edition">
        <p>IN THIS EDITION ↓</p>
        {index.map((entry) => (
          <a key={entry.id} href={`#${entry.id}`}>{entry.label}</a>
        ))}
      </nav>
      <div className="archive-prose">{children}</div>
    </div>
  );
}

/** The closing ink band: a line, and where to go next. */
export function EndNote({ line, href, label }: { line: ReactNode; href: string; label: string }) {
  return (
    <div className="end-note">
      <p>{line}</p>
      <Link href={href}>{label} ↗</Link>
    </div>
  );
}
