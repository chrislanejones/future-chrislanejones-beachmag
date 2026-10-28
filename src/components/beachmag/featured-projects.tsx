"use client";

import Image from "next/image";
import Link from "next/link";
import { SeeAll } from "./see-all";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { projects as snapshot, type Project } from "@/data/projects-data";
import { projectHref } from "@/lib/projects";
import { isImageHorseApp } from "@/data/project-presentation";

type ProjectRow = Pick<Project, "title" | "description" | "image" | "category" | "featured" | "order" | "githubUrl" | "codebergUrl" | "vercelUrl" | "customUrl"> & { _id?: string };

// Which projects show, and in what order, is the admin's call: "Featured on
// home page" plus Featured Order (projects.order). These carry the magazine
// copy written for a project; any other featured project uses its own
// Convex text (category and the first sentence of its description).
const HOME_COPY = [
  {
    matches: isImageHorseApp,
    label: "A LITTLE PIXEL MAGIC",
    eyebrow: "IMAGE EDITOR · RUST / WASM / REACT",
    blurb: "A browser-based image editor. Rust does the pixel work; React brings it all together.",
  },
  {
    matches: (project: ProjectRow) => project.title.trim().toLowerCase() === "pga golf game",
    label: "JUST ONE MORE ROUND",
    eyebrow: "BROWSER GAME · REACT THREE FIBER",
    blurb: "Playful characters, little courses, and hand-written physics. A round of golf inside your browser.",
  },
];

const CATEGORY = { app: "APP / TOOL", website: "CLIENT WEBSITE" } as const;

function firstSentence(text: string) {
  const match = text.trim().match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : text.trim();
}

/** Featured rows in Featured Order; the snapshot stands in until Convex answers. */
function featured(rows: ProjectRow[]) {
  return rows.filter((row) => row.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function Spread({ rows }: { rows: ProjectRow[] }) {
  const cards = featured(rows).flatMap((project, index) => {
    if (!project.image) return [];
    const copy = HOME_COPY.find((entry) => entry.matches(project));
    return [{
      key: project._id ?? project.title,
      title: project.title,
      image: project.image,
      // Snapshot rows (no _id) have no page id yet; the projects list is the safe stop.
      href: project._id ? projectHref(project) : "/projects",
      label: `${String(index + 1).padStart(2, "0")} / ${copy?.label ?? "FEATURED WORK"}`,
      eyebrow: copy?.eyebrow ?? CATEGORY[project.category],
      blurb: copy?.blurb ?? firstSentence(project.description),
    }];
  });
  return (
    <div className="projects-spread">
      {cards.map((card) => (
        <article className="project-cutout" key={card.key}>
          {/* The photo repeats "Explore project" below for the mouse; keyboards and screen readers use that one. */}
          <Link className="project-print" href={card.href} tabIndex={-1} aria-hidden="true">
            <Image src={card.image} alt="" width={640} height={400} sizes="(max-width: 560px) 92vw, 560px" />
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
        <SeeAll href="/projects">All projects</SeeAll>
      </div>
      <ContentBoundary fallback={<Spread rows={initialRows.length ? initialRows : snapshot} />}>
        <LiveSpread initialRows={initialRows} />
      </ContentBoundary>
    </section>
  );
}
