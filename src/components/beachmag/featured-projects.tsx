"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { projects as snapshot, type Project } from "@/data/projects-data";
import { projectHref } from "@/lib/projects";
import { isImageHorseApp } from "@/data/project-presentation";

type ProjectRow = Pick<Project, "title" | "description" | "image" | "githubUrl" | "codebergUrl" | "vercelUrl" | "customUrl"> & { _id?: string };

// The homepage spread is curated: Convex supplies the project (image, link),
// the design supplies the short magazine copy around it. Each card links to
// the project's own page here; one missing from Convex (PGA Golf Game, today)
// takes its image from the static snapshot and a placeholder link.
const HOME_PROJECTS = [
  {
    title: "Image Horse",
    matches: isImageHorseApp,
    label: "01 / A LITTLE PIXEL MAGIC",
    eyebrow: "IMAGE EDITOR · RUST / WASM / REACT",
    blurb: "A browser-based image editor. Rust does the pixel work; React brings it all together.",
    alt: "Image Horse browser image editor",
  },
  {
    title: "PGA Golf Game",
    matches: (project: ProjectRow) => project.title.trim().toLowerCase() === "pga golf game",
    label: "02 / JUST ONE MORE ROUND",
    eyebrow: "BROWSER GAME · REACT THREE FIBER",
    blurb: "Playful characters, little courses, and hand-written physics. A round of golf inside your browser.",
    alt: "PGA Golf Game with a miniature three-dimensional golf course",
  },
];

function Spread({ rows }: { rows: ProjectRow[] }) {
  const cards = HOME_PROJECTS.flatMap((copy) => {
    const stored = rows.find((row) => row._id && copy.matches(row));
    const project = stored ?? snapshot.find(copy.matches);
    // A project with no page on this site yet (PGA Golf Game, until it's in
    // Convex) holds a placeholder link that stays on this section.
    const href = stored ? projectHref(stored) : "#featured-projects";
    return project?.image ? [{ ...copy, image: project.image, href }] : [];
  });
  return (
    <div className="projects-spread">
      {cards.map((card) => (
        <article className="project-cutout" key={card.title}>
          {/* The photo repeats "Explore project" below for the mouse; keyboards and screen readers use that one. */}
          <Link className="project-print" href={card.href} tabIndex={-1} aria-hidden="true">
            <Image src={card.image} alt={card.alt} width={640} height={400} sizes="(max-width: 560px) 92vw, 560px" />
            <span>{card.label}</span>
          </Link>
          <div className="project-copy">
            <p className="projects-eyebrow">{card.eyebrow}</p>
            <h3>{card.title}</h3>
            <p>{card.blurb}</p>
            <Link className="project-go radio-key" href={card.href}>
              Explore project <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function LiveSpread({ initialRows }: { initialRows: ProjectRow[] }) {
  const rows = useQuery(api.projects.getAll);
  return <Spread rows={rows?.length ? rows : initialRows.length ? initialRows : snapshot} />;
}

// The server passes its Convex read so the cards link to their own pages on
// first paint; the live query takes over once it connects.
export function FeaturedProjects({ initialRows = [] }: { initialRows?: ProjectRow[] }) {
  return (
    <section id="featured-projects" aria-labelledby="featured-projects-title">
      <div className="projects-masthead">
        <div>
          <p className="projects-eyebrow">SELECTED WORK / BUILT WITH CURIOSITY</p>
          <h2 id="featured-projects-title">Made on<br /><em>the shore.</em></h2>
        </div>
        <Link className="projects-all" href="/projects">All projects <span aria-hidden="true">↗</span></Link>
      </div>
      <ContentBoundary fallback={<Spread rows={initialRows.length ? initialRows : snapshot} />}>
        <LiveSpread initialRows={initialRows} />
      </ContentBoundary>
    </section>
  );
}
