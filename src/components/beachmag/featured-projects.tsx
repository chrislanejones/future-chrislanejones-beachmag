"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { projects as snapshot, type Project } from "@/data/projects-data";
import { projectHref, projectSiteUrl } from "@/lib/projects";
import { isImageHorseApp } from "@/data/project-presentation";

type ProjectRow = Pick<Project, "title" | "description" | "image" | "githubUrl" | "codebergUrl" | "vercelUrl" | "customUrl"> & { _id?: string };

// The homepage spread is curated: Convex supplies the project (image, link),
// the design supplies the short magazine copy around it. A project in Convex
// links to its own page here; one missing from Convex (PGA Golf Game, today)
// falls back to the static snapshot and its live site, since it has no page.
const HOME_PROJECTS = [
  {
    title: "Image Horse",
    matches: isImageHorseApp,
    label: "01 / A LITTLE PIXEL MAGIC",
    eyebrow: "IMAGE EDITOR · RUST / WASM / REACT",
    blurb: "A browser-based image editor. Rust does the pixel work; React brings it all together.",
    cta: "Try the editor",
    verb: "Open",
    alt: "Image Horse browser image editor",
  },
  {
    title: "PGA Golf Game",
    matches: (project: ProjectRow) => project.title.trim().toLowerCase() === "pga golf game",
    label: "02 / JUST ONE MORE ROUND",
    eyebrow: "BROWSER GAME · REACT THREE FIBER",
    blurb: "Playful characters, little courses, and hand-written physics. A round of golf inside your browser.",
    cta: "Play a round",
    verb: "Play",
    alt: "PGA Golf Game with a miniature three-dimensional golf course",
  },
];

function Spread({ rows }: { rows: ProjectRow[] }) {
  const cards = HOME_PROJECTS.flatMap((copy) => {
    const stored = rows.find((row) => row._id && copy.matches(row));
    const project = stored ?? snapshot.find(copy.matches);
    const href = stored ? projectHref(stored) : project && projectSiteUrl(project);
    return project?.image && href ? [{ ...copy, image: project.image, href, internal: Boolean(stored) }] : [];
  });
  return (
    <div className="projects-spread">
      {cards.map((card) => (
        <article className="project-cutout" key={card.title}>
          {card.internal ? (
            <Link className="project-print" href={card.href} aria-label={`Explore ${card.title}`}>
              <Image src={card.image} alt={card.alt} width={640} height={400} sizes="(max-width: 560px) 92vw, 560px" />
              <span>{card.label}</span>
            </Link>
          ) : (
            <a className="project-print" href={card.href} target="_blank" rel="noopener noreferrer" aria-label={`${card.verb} ${card.title} in a new tab`}>
              <Image src={card.image} alt={card.alt} width={640} height={400} sizes="(max-width: 560px) 92vw, 560px" />
              <span>{card.label}</span>
            </a>
          )}
          <div className="project-copy">
            <p className="projects-eyebrow">{card.eyebrow}</p>
            <h3>{card.title}</h3>
            <p>{card.blurb}</p>
            {card.internal ? (
              <Link className="project-go" href={card.href}>
                Explore project <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <a className="project-go" href={card.href} target="_blank" rel="noopener noreferrer">
                {card.cta} <span aria-hidden="true">↗</span><span className="project-sr"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function LiveSpread() {
  const rows = useQuery(api.projects.getAll);
  return <Spread rows={rows?.length ? rows : snapshot} />;
}

export function FeaturedProjects() {
  return (
    <section id="featured-projects" aria-labelledby="featured-projects-title">
      <div className="projects-masthead">
        <div>
          <p className="projects-eyebrow">SELECTED WORK / BUILT WITH CURIOSITY</p>
          <h2 id="featured-projects-title">Made on<br /><em>the shore.</em></h2>
        </div>
        <Link className="projects-all" href="/projects">All projects <span aria-hidden="true">↗</span></Link>
      </div>
      <ContentBoundary fallback={<Spread rows={snapshot} />}>
        <LiveSpread />
      </ContentBoundary>
    </section>
  );
}
