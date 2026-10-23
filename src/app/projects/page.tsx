// app/projects/page.tsx
import { CoastalPageShell } from "@/components/coastal/page-shell";
import ProjectGrid from "@/app/projects/ProjectPage";
import { PageHero } from "@/components/beachmag/interior-parts";
import { getPageSEO } from "@/lib/seo";
import { getProjects } from "@/lib/projects-server";

export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/projects");
}

export default async function ProjectsPage() {
  const projects = await getProjects().catch(() => []);
  return (
    <CoastalPageShell>
      <PageHero
        kicker="SELECTED WORK"
        title={<>Built with<br /><em>salt &amp; grit.</em></>}
        intro="Image editing, browser games, websites, and tools for developers. A few ideas that escaped the notebook."
        path="/projects"
        caption="Small worlds. Real work. ↙"
      />
      <ProjectGrid initialProjects={projects} />
    </CoastalPageShell>
  );
}
