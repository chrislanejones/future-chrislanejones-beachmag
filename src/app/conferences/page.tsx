import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import ConferencesPage from "./ConferencesPage";
import { getPageSEO } from "@/lib/seo";
import { getConferences } from "@/lib/conferences-server";

export const revalidate = 86400; // once a day; admin saves refresh it at once (api/revalidate)
export async function generateMetadata() { return getPageSEO("/conferences"); }

export default async function ConferencesRoute() {
  const conferences = await getConferences();
  return (
    <CoastalPageShell>
      {/* The same header as /projects: title and intro beside the full-size scene polaroid. */}
      <PageHero
        kicker="FIELD NOTES / CHRIS LANE JONES"
        title={<>People, places<br /><em>&amp; good ideas.</em></>}
        intro="Highlights and notes from events I've attended: open source, web, and community conferences across the years."
        path="/conferences"
        caption="Notes from the hallway track. ↙"
      />
      <ConferencesPage conferences={conferences} />
    </CoastalPageShell>
  );
}
