import { CoastalPageShell } from "@/components/coastal/page-shell";
import { ArchiveHero } from "@/components/beachmag/interior-parts";
import ConferencesPage from "./ConferencesPage";
import { getPageSEO } from "@/lib/seo";
import { getConferences } from "@/lib/conferences-server";

export const revalidate = 60;
export async function generateMetadata() { return getPageSEO("/conferences"); }

export default async function ConferencesRoute() {
  const conferences = await getConferences();
  return (
    <CoastalPageShell>
      <ArchiveHero
        crumbs={[{ href: "/", label: "Home" }, { label: "Conferences" }]}
        kicker="FIELD NOTES / CHRIS LANE JONES"
        title="People, places & good ideas."
        intro="Highlights and notes from events I've attended: open source, web, and community conferences across the years."
        path="/conferences"
      />
      <ConferencesPage conferences={conferences} />
    </CoastalPageShell>
  );
}
