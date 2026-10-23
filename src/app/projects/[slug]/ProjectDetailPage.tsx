import Link from "next/link";
import { ArchiveHero, ArchiveLayout } from "@/components/beachmag/interior-parts";
import type { ProjectCardData } from "@/components/coastal/project-card";
import { ProjectPreview } from "@/components/coastal/project-preview";
import { projectPresentation } from "@/data/project-presentation";
import { projectAddress, projectHref, projectOutboundLinks } from "@/lib/projects";
import { jsonLd, SITE_URL } from "@/lib/structured-data";

type Project = ProjectCardData & { _id: string; category: string };

const plain = (text: string) => text.replace(/[–—]/g, "-");

export default function ProjectDetailPage({ project, projects }: { project: Project; projects: Project[] }) {
  const presentation = projectPresentation(project);
  const title = plain(presentation.title);
  const address = projectAddress(project);
  const links = projectOutboundLinks(project);
  // Same kind first (apps with apps), keeping the admin's order within each.
  const others = projects
    .filter((item) => item._id !== project._id)
    .sort((a, b) => Number(b.category === project.category) - Number(a.category === project.category));
  const image = presentation.image;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: presentation.description,
    url: `${SITE_URL}${projectHref(project)}`,
    ...(image && { image: image.startsWith("http") ? image : `${SITE_URL}${image}` }),
    ...(links.length > 0 && { sameAs: links.map((link) => link.href) }),
    author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "Chris Lane Jones", url: SITE_URL },
  };

  const crumbs = [{ href: "/", label: "Home" }, { href: "/projects", label: "Projects" }, { label: title }];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <ArchiveHero
        crumbs={crumbs}
        kicker={`${project.category === "app" ? "APP PROJECT" : "WEBSITE PROJECT"} / CHRIS LANE JONES`}
        title={title}
        intro={address}
        path="/projects"
      />
      <ArchiveLayout index={[{ id: "about-the-project", label: "About the project" }]}>
        <ProjectPreview
          title={title}
          image={image}
          imageFit={presentation.imageFit}
          imageAspectRatio={presentation.imageAspectRatio}
          address={address}
          sizes="(max-width: 767px) 90vw, 55vw"
          priority
        />
        <h2 id="about-the-project">About the project</h2>
        <p>{plain(presentation.description)}</p>
        {(project.features ?? []).length > 0 && (
          <ul>
            {project.features!.map((feature) => (
              <li key={feature}>{plain(feature)}</li>
            ))}
          </ul>
        )}
        {links.length > 0 && (
          <p className="work-actions">
            {links.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={link.key === "site" ? "action-link" : undefined}
                aria-label={link.key === "site" ? `Visit ${title} (opens in a new tab)` : `${title} on ${link.label} (opens in a new tab)`}
              >
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </p>
        )}
      </ArchiveLayout>
      {others.length > 0 && (
        <section aria-labelledby="more-projects-title">
          <div className="section-rule">
            <p id="more-projects-title">MORE PROJECTS</p>
            <p><Link href="/projects">ALL PROJECTS ↗</Link></p>
          </div>
          <div className="resource-grid">
            {others.map((item) => (
              <Link key={item._id} className="resource-tile" href={projectHref(item)}>
                <small>{item.category === "app" ? "APP PROJECT" : "WEBSITE PROJECT"}</small>
                <strong>{plain(projectPresentation(item).title)}</strong>
                <p>{plain(projectPresentation(item).description)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
