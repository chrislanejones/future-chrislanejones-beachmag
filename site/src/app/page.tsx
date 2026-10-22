import { getPageSEO } from "@/lib/seo";
import { bodoniModa, dmSans } from "@/components/beachmag/fonts";
import { SiteNav } from "@/components/beachmag/site-nav";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { JournalHero } from "@/components/beachmag/journal-hero";
import { FeaturedProjects } from "@/components/beachmag/featured-projects";
import "@/components/beachmag/beachmag.css";
import "@/components/beachmag/shell.css";

export const revalidate = 60;
export async function generateMetadata() {
  return await getPageSEO("/");
}

export default function Home() {
  return (
    <main data-beachmag className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <SiteNav />
      <div id="page-content">
        <CoastalArt>
          <JournalHero />
          <FeaturedProjects />
        </CoastalArt>
      </div>
    </main>
  );
}
