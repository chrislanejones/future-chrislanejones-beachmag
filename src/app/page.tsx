import { getPageSEO } from "@/lib/seo";
import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { JournalHero } from "@/components/beachmag/journal-hero";
import { FeaturedProjects } from "@/components/beachmag/featured-projects";
import { BeachOffline } from "@/components/beachmag/beach-offline";
import { ToolGallery } from "@/components/beachmag/tool-gallery";
import { Sandbox } from "@/components/beachmag/sandbox/sandbox";
import { getProjects } from "@/lib/projects-server";

export const revalidate = 60;
export async function generateMetadata() {
  return await getPageSEO("/");
}

export default async function Home() {
  // Read on the server so the project cards link to their pages on first paint.
  const projects = await getProjects().catch(() => []);
  return (
    <BeachmagShell>
      <CoastalArt>
        <JournalHero />
        <FeaturedProjects initialRows={projects} />
        <BeachOffline />
        <ToolGallery />
      </CoastalArt>
      <Sandbox />
    </BeachmagShell>
  );
}
