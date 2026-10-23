"use client";

import Link from "next/link";
import { localDay, upcomingEvents } from "./events";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = [
  { short: "S", long: "Sunday" },
  { short: "M", long: "Monday" },
  { short: "T", long: "Tuesday" },
  { short: "W", long: "Wednesday" },
  { short: "T", long: "Thursday" },
  { short: "F", long: "Friday" },
  { short: "S", long: "Saturday" },
];

type Upcoming = ReturnType<typeof upcomingEvents>[number];

const eventId = (event: Upcoming) => `event-${event.start.replace(/[^0-9]/g, "")}`;

/** Weeks of a month as rows of day numbers, with null for the blanks around them. */
function monthWeeks(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

function Month({ year, month, today, events }: { year: number; month: number; today: string; events: Upcoming[] }) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return (
    <table className="calendar-month">
      <caption>{MONTH_NAMES[month]} <span>{year}</span></caption>
      <thead>
        <tr>
          {WEEKDAYS.map((day) => (
            <th scope="col" key={day.long}><abbr title={day.long}>{day.short}</abbr></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthWeeks(year, month).map((week, row) => (
          <tr key={row}>
            {week.map((day, column) => {
              if (!day) return <td key={column} className="calendar-blank" />;
              const date = prefix + String(day).padStart(2, "0");
              const onDay = events.filter((event) => event.start.startsWith(date));
              const classes = [onDay.length && "has-event", date === today && "is-today"].filter(Boolean).join(" ");
              return (
                <td key={column} className={classes || undefined}>
                  <time dateTime={date}>{day}</time>
                  {onDay.map((event) => (
                    <a key={event.start} href={`#${eventId(event)}`}>{event.name}</a>
                  ))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// /events: every month from this one to the last event on the books, then the
// full list. Months with nothing on them in between still show, like a real
// wall calendar.
export function EventsCalendar() {
  const now = new Date();
  const today = localDay(now);
  const events = upcomingEvents(now, Infinity);
  const last = events.at(-1);
  const end = last ? new Date(Number(last.start.slice(0, 4)), Number(last.start.slice(5, 7)) - 1, 1) : now;
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <>
      <div className="top">
        <span>EVENTS / WHERE I&apos;LL BE</span>
        <span>ST. AUGUSTINE · JACKSONVILLE</span>
      </div>
      <h1 className="mast">See you<br /><em>out there.</em></h1>
      <div className="sub">
        <span>Meetups, coworking mornings and the odd conference around Northeast Florida. Come say hi.</span>
        <Link href="/conferences">Past conferences ↗</Link>
      </div>
      <div className="columns events-calendar">
        <article>
          <div className="label">THE CALENDAR</div>
          {months.map(({ year, month }) => (
            <Month key={`${year}-${month}`} year={year} month={month} today={today} events={events} />
          ))}
        </article>
        <aside className="events">
          <h2>Coming up.</h2>
          {events.length ? (
            events.map((event) => (
              <div className="event" id={eventId(event)} key={event.start + event.name}>
                <time dateTime={event.start}>{event.month}<b>{event.day}</b></time>
                <div>
                  <strong>
                    {event.url ? (
                      <a href={event.url} target="_blank" rel="noopener noreferrer">
                        {event.name}<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      event.name
                    )}
                  </strong>
                  <small>{event.place}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="copy">Nothing on the calendar yet.</p>
          )}
        </aside>
      </div>
    </>
  );
}
