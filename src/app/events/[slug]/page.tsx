import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { HOME_EVENTS, findEvent, eventHref } from "@/components/beachmag/events";
import { EventGallery } from "@/components/beachmag/event-gallery";
import { SITE_URL } from "@/lib/structured-data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => HOME_EVENTS.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = findEvent((await params).slug);
  if (!event) return {};
  return {
    title: event.name,
    description: event.description,
    alternates: { canonical: `${SITE_URL}${eventHref(event)}` },
    openGraph: { title: event.name, description: event.description, url: `${SITE_URL}${eventHref(event)}` },
  };
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
  const mapsUrl = event.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}` : undefined;
  return <BeachmagShell><CoastalArt>
    <article className="event-detail">
      <nav className="top" aria-label="Breadcrumb"><Link href="/events">← ALL EVENTS</Link><span>NORTHEAST FLORIDA / FIELD NOTES</span></nav>
      <header className="event-detail-heading"><p className="label">ON THE CALENDAR</p><h1>{event.name}</h1></header>
      <section className="event-ticket" aria-label="Date and location">
        <time className="event-ticket-stamp" dateTime={event.start}><span>{new Date(`${event.start}Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</span><b>{event.start.slice(8, 10)}</b><span>{event.start.slice(0, 4)}</span></time>
        <div className="event-ticket-when"><p className="label"><CalendarDays size={16} aria-hidden="true" /> WHEN</p><h2>{dateLabel(event.start)}</h2><p>{timeLabel(event.start)}{event.end ? ` – ${timeLabel(event.end)}` : ""} Eastern</p></div>
        <div className="event-ticket-where"><p className="label"><MapPin size={16} aria-hidden="true" /> WHERE</p><h2>{event.venue ?? "Location to be announced"}</h2>{mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>}</div>
      </section>
      <div className="event-detail-copy">
        <div><p className="event-detail-intro">{event.description}</p>
          {event.details && <><h2>What to build</h2><ol>{event.details.map((detail) => <li key={detail}>{detail}</li>)}</ol></>}
          {event.speaker && <p><strong>Speaker</strong><br />{event.speaker}</p>}
          {event.schedule && <><h2>The evening</h2><dl className="event-schedule">{event.schedule.map((item) => <div key={item.time}><dt>{item.time}</dt><dd>{item.activity}</dd></div>)}</dl></>}
        </div>
        <aside>{event.organizer && <><p className="label">HOSTED BY</p><p>{event.organizer}</p></>}
          {event.url && <a className="event-source" href={event.url} target="_blank" rel="noopener noreferrer">Event website / RSVP ↗</a>}
          {event.note && <p className="event-detail-note">{event.note}</p>}
        </aside>
      </div>
      <EventGallery slug={event.slug} name={event.name} />
      <Link className="event-back" href="/events">← Back to the calendar</Link>
    </article>
  </CoastalArt></BeachmagShell>;
}
