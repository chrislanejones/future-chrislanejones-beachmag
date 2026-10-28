import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { HOME_EVENTS, findEvent, eventHref } from "@/components/beachmag/events";
import { EventHero } from "@/components/beachmag/event-gallery";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { DEFAULT_OG_IMAGE, metaDescription } from "@/lib/seo";
import { PERSON, SITE_URL, jsonLd } from "@/lib/structured-data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => HOME_EVENTS.map(({ slug }) => ({ slug }));

const eventPhotos = (slug: string) => new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  .query(api.eventPhotos.list, { eventSlug: slug }).catch(() => []);
const absolute = (url: string) => (url.startsWith("/") ? `${SITE_URL}${url}` : url);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = findEvent((await params).slug);
  if (!event) return {};
  const url = `${SITE_URL}${eventHref(event)}`;
  const description = metaDescription(event.description);
  // The event's first gallery photo is its social card.
  const photo = (await eventPhotos(event.slug))[0];
  const images = [{ url: photo?.url ?? DEFAULT_OG_IMAGE, alt: photo?.alt ?? event.name }];
  return {
    title: event.name,
    description,
    alternates: { canonical: url },
    // Unannounced events stay out of search until they have details.
    robots: event.secret ? { index: false, follow: true } : undefined,
    openGraph: { title: event.name, description, url, type: "website", images },
    twitter: { card: "summary_large_image", title: event.name, description, images },
  };
}

// schema.org dates need an offset; the registry stores Eastern wall-clock time.
function easternIso(local: string) {
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "longOffset" })
    .formatToParts(new Date(`${local}Z`)).find((part) => part.type === "timeZoneName")?.value.replace("GMT", "");
  return `${local}:00${offset || "-05:00"}`;
}

// Dates in the event registry are Eastern wall-clock values. Format the parts
// in UTC to keep the displayed date/time identical for visitors in every zone.
const dateLabel = (start: string) => new Date(`${start}Z`).toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});
const timeLabel = (start: string) => new Date(`${start}Z`).toLocaleTimeString("en-US", {
  hour: "numeric", minute: "2-digit", timeZone: "UTC",
});

export default async function EventPage({ params }: Props) {
  const event = findEvent((await params).slug);
  if (!event) notFound();
  const photos = await eventPhotos(event.slug);
  const mapsUrl = event.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}` : undefined;
  const schema = event.secret ? null : {
    "@context": "https://schema.org", "@type": "Event",
    name: event.name, description: event.description,
    startDate: easternIso(event.start), endDate: event.end ? easternIso(event.end) : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.venue ? { "@type": "Place", name: event.venue.split(",")[0], address: event.venue } : undefined,
    image: photos.length ? photos.map((photo) => absolute(photo.url)) : undefined,
    organizer: event.organizer ? { "@type": event.organizer === PERSON.name ? "Person" : "Organization", name: event.organizer } : undefined,
    url: `${SITE_URL}${eventHref(event)}`,
  };
  return <BeachmagShell><CoastalArt>
    {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
    <article className="event-detail">
      <nav className="top" aria-label="Breadcrumb"><Link href="/events">← ALL EVENTS</Link><span>NORTHEAST FLORIDA / FIELD NOTES</span></nav>
      <EventHero slug={event.slug} name={event.name} description={event.description} initialPhotos={photos} />
      <section className="event-ticket" aria-label="Date and location">
        <time className="event-ticket-stamp" dateTime={event.start}><span>{new Date(`${event.start}Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</span><b>{event.start.slice(8, 10)}</b><span>{event.start.slice(0, 4)}</span></time>
        <div className="event-ticket-when"><p className="label"><CalendarDays size={16} aria-hidden="true" /> WHEN</p><h2>{dateLabel(event.start)}</h2><p>{timeLabel(event.start)}{event.end ? ` – ${timeLabel(event.end)}` : ""} Eastern</p></div>
        <div className="event-ticket-where"><p className="label"><MapPin size={16} aria-hidden="true" /> WHERE</p><h2>{event.venue ?? "Location to be announced"}</h2>{mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>}</div>
      </section>
      <div className="event-detail-copy">
        <div>
          {event.details && <><h2>What to build</h2><ol>{event.details.map((detail) => <li key={detail}>{detail}</li>)}</ol></>}
          {event.speaker && <p><strong>Speaker</strong><br />{event.speaker}</p>}
          {event.schedule && <><h2>The evening</h2><dl className="event-schedule">{event.schedule.map((item) => <div key={item.time}><dt>{item.time}</dt><dd>{item.activity}</dd></div>)}</dl></>}
        </div>
        <aside>{event.organizer && <><p className="label">HOSTED BY</p><p>{event.organizer}</p></>}
          {event.url && <a className="event-source" href={event.url} target="_blank" rel="noopener noreferrer">Event website / RSVP ↗</a>}
          {event.note && <p className="event-detail-note">{event.note}</p>}
        </aside>
      </div>
      <Link className="event-back" href="/events">← Back to the calendar</Link>
    </article>
  </CoastalArt></BeachmagShell>;
}
