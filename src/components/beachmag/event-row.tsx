import Link from "next/link";
import { eventHref, eventTitle, type HomeEvent } from "./events";

type RowEvent = Pick<HomeEvent, "slug" | "start" | "name" | "series" | "place" | "secret"> & { month: string; day: string };

// One event in the home "See you out there." list and the /events lists:
// the date, the details, and a "See event" arrow on the right.
export function EventRow({ event }: { event: RowEvent }) {
  const title = eventTitle(event);
  return (
    <div className={event.secret ? "event is-secret" : "event"}>
      <time dateTime={event.start}>{event.month}<b>{event.day}</b></time>
      <div>
        {event.series && <span className="event-series">{event.series}</span>}
        <strong><Link href={eventHref(event)} aria-label={title}>{event.name}</Link></strong>
        <small>{event.place}</small>
      </div>
      <Link className="see-event" href={eventHref(event)} aria-label={`See event: ${title}`}>
        See event <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
