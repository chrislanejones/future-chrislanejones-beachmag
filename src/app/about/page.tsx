import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import AboutPage from "@/app/about/AboutPage";
import { getPageSEO } from "@/lib/seo";
import { getConferences } from "@/lib/conferences-server";

export const revalidate = 86400; // once a day; admin saves refresh it at once (api/revalidate)

export async function generateMetadata() {
  return await getPageSEO("/about");
}

export default async function About() {
  const conferences = await getConferences();
  return (
    <CoastalPageShell>
      <PageHero
        kicker="THE PERSON BEHIND THE PIXELS"
        title={<>Still making<br /><em>things.</em></>}
        intro="From video production to web development. From Virginia’s mountains back to Florida’s coast. Still learning."
        path="/about"
        caption="Same curiosity. A different coastline. ↙"
      />
      <AboutPage conferences={conferences} />
    </CoastalPageShell>
  );
}
