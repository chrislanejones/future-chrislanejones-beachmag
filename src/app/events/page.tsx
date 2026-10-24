import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { EventsCalendar } from "@/components/beachmag/events-calendar";
import { getPageSEO } from "@/lib/seo";

// Like the other pages: SEO edits in the admin show up within a minute.
export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/events");
}

export default function EventsPage() {
  return (
    <BeachmagShell>
      <CoastalArt>
        <EventsCalendar />
      </CoastalArt>
    </BeachmagShell>
  );
}
