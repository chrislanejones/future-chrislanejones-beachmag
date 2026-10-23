import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import AboutPage from "@/app/about/AboutPage";
import { getPageSEO } from "@/lib/seo";
import { getConferences } from "@/lib/conferences-server";

export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/about");
}

export default async function About() {
  const conferences = await getConferences().catch(() => []);
  return (
    <CoastalPageShell edition="THE PERSON BEHIND THE PIXELS / THE COASTAL EDITION">
      <PageHero
        kicker="THE PERSON BEHIND THE PIXELS"
        title={<>Made of<br /><em>curiosity.</em></>}
        intro="From video production to web development. From Virginia’s mountains back to Florida’s coast. Still making things, still learning."
        path="/about"
        caption="Same curiosity. A different coastline. ↙"
      />
      <AboutPage conferences={conferences} />
    </CoastalPageShell>
  );
}
