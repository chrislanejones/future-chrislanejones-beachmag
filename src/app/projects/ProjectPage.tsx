"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { EndNote } from "@/components/beachmag/interior-parts";
import type { ProjectCardData } from "@/components/coastal/project-card";
import { projectPresentation } from "@/data/project-presentation";
import { projects as fallbackProjects } from "@/data/projects-data";
import { projectHref, projectSiteUrl } from "@/lib/projects";
import { api } from "../../../convex/_generated/api";

type Project = ProjectCardData & { _id?: string; category: string };
type Filter = "all" | "app" | "website";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "app", label: "App projects" },
  { id: "website", label: "Website projects" },
];

const plain = (text: string) => text.replace(/[–—]/g, "-");

function WorkCard({ project, priority }: { project: Project; priority: boolean }) {
  const presentation = projectPresentation(project);
  const title = plain(presentation.title);
  const site = projectSiteUrl(project);
  return (
    <article className="work-card">
      <figure>
        {presentation.image ? (
          <Image src={presentation.image} alt={title} width={640} height={400} sizes="(max-width: 640px) 86vw, 560px" priority={priority} />
        ) : (
          <span className="work-card-blank" aria-hidden="true" />
        )}
        <figcaption>{project.category === "app" ? "APP" : "WEBSITE"} / SELECTED WORK</figcaption>
      </figure>
      <h2>{title}</h2>
      <p>{plain(presentation.description)}</p>
      <div className="work-actions">
        <Link className="action-link" href={projectHref(project)}>Explore project <span aria-hidden="true">↗</span></Link>
        {site && (
          <a href={site} target="_blank" rel="noopener noreferrer">
            Visit ↗<span className="sr-only"> {title} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

// "Built with salt & grit.": every project in one grid, filtered by kind.
// The server passes its Convex read so the first paint links to real pages;
// the live query takes over once it connects.
export default function ProjectGrid({ initialProjects }: { initialProjects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const apps = useQuery(api.projects.getByCategory, { category: "app" });
  const websites = useQuery(api.projects.getByCategory, { category: "website" });
  const all: Project[] = apps && websites ? [...apps, ...websites] : initialProjects.length ? initialProjects : fallbackProjects;
  const visible = filter === "all" ? all : all.filter((project) => project.category === filter);

  return (
    <>
      <div className="section-rule">
        <p>THE WORK / APPLICATIONS &amp; WEBSITES</p>
        <p role="status">{visible.length} project{visible.length === 1 ? "" : "s"}</p>
      </div>
      <div className="filter-tabs" role="group" aria-label="Project category">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {visible.map((project, index) => (
          <WorkCard key={project._id ?? project.title} project={project} priority={index === 0} />
        ))}
      </div>
      <EndNote line="Something on your mind?" href="/contact" label="Let’s build it" />
    </>
  );
}
