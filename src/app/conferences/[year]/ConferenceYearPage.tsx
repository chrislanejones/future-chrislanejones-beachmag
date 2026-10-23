import { ArchiveHero } from "@/components/beachmag/interior-parts";
import ConferencesPage from "../ConferencesPage";
import type { Conference } from "@/lib/conferences";

export default function ConferenceYearPage({ conferences, year }: { conferences: Conference[]; year: string }) {
  return (
    <>
      <ArchiveHero
        crumbs={[{ href: "/", label: "Home" }, { href: "/conferences", label: "Conferences" }, { label: year }]}
        kicker="CONFERENCES / CHRIS LANE JONES"
        title={`Conferences in ${year}.`}
        intro="The events, places, and communities that brought me away from the keyboard."
        path="/conferences"
      />
      <ConferencesPage conferences={conferences} year={Number(year)} />
    </>
  );
}
