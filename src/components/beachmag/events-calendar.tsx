"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { calendarEvents, eventHref, localDay, pastEvents, upcomingEvents } from "./events";

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
      <caption className="sr-only">{MONTH_NAMES[month]} {year}</caption>
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
              const classes = [
                onDay.length && "has-event",
                onDay.some((event) => event.secret) && "is-secret",
                date === today && "is-today",
              ].filter(Boolean).join(" ");
              return (
                <td key={column} className={classes || undefined}>
                  <time dateTime={date}>{day}</time>
                  {onDay.map((event) => (
                    <Link key={event.slug} href={eventHref(event)}>{event.name}</Link>
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

function MiniMonth({ year, month, selected, today, events, onSelect }: {
  year: number; month: number; selected: boolean; today: string; events: Upcoming[]; onSelect: () => void;
}) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const monthEvents = events.filter((event) => event.start.startsWith(prefix));
  const cells = monthWeeks(year, month).flat();
  while (cells.length < 42) cells.push(null);
  return (
    <button type="button" className="calendar-mini" aria-pressed={selected}
      aria-label={`${MONTH_NAMES[month]} ${year}, ${monthEvents.length} ${monthEvents.length === 1 ? "event" : "events"}`}
      aria-controls="selected-month" onClick={onSelect}>
      <span className="calendar-mini-title">{MONTH_NAMES[month]}</span>
      <span className="calendar-mini-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => <span key={day.long}>{day.short}</span>)}
      </span>
      <span className="calendar-mini-days" aria-hidden="true">
        {cells.map((day, index) => {
          const date = day ? prefix + String(day).padStart(2, "0") : "";
          const onDay = day ? monthEvents.filter((event) => event.start.startsWith(date)) : [];
          return <span key={index} data-date={date || undefined}
            className={["calendar-mini-day", !day && "is-blank", day && onDay.length && "has-event", date === today && "is-today"].filter(Boolean).join(" ")}
            title={day ? `${MONTH_NAMES[month]} ${day}${onDay.length ? `: ${onDay.map((event) => event.name).join("; ")}` : ""}` : undefined}>{day}</span>;
        })}
      </span>
    </button>
  );
}

function EventList({ events }: { events: Upcoming[] }) {
  return events.map((event) => (
    <div className={event.secret ? "event is-secret" : "event"} key={event.slug}>
      <time dateTime={event.start}>{event.month}<b>{event.day}</b></time>
      <div>
        <strong><Link href={eventHref(event)}>{event.name}</Link></strong>
        <small>{event.place}</small>
      </div>
    </div>
  ));
}

// Every month from January 2026 through the current/last event year is reachable.
// Open on the current month, with the upcoming list beside it.
export function EventsCalendar() {
  const [shown, setShown] = useState(() => {
    const today = new Date();
    return Math.max(0, (today.getFullYear() - 2026) * 12 + today.getMonth());
  });
  const now = new Date();
  const today = localDay(now);
  const events = upcomingEvents(now, Infinity);
  const archive = pastEvents(now);
  const allEvents = calendarEvents();
  const last = allEvents.at(-1);
  const detail = useRef<HTMLElement>(null);
  const endYear = Math.max(2026, now.getFullYear(), Number(last?.start.slice(0, 4) ?? 2026));
  const end = new Date(endYear, 11, 1);
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(2026, 0, 1);
  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const current = months[Math.min(shown, months.length - 1)];

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
        <article id="selected-month" ref={detail} tabIndex={-1} aria-label="Selected month calendar">
          <div className="label">THE CALENDAR</div>
          {/* One month at a time; the silver keys turn the page. */}
          <div className="calendar-head">
            <p className="calendar-title" aria-live="polite">{MONTH_NAMES[current.month]} <span>{current.year}</span></p>
            <div className="client-controls">
              <button type="button" aria-label="Previous month" disabled={shown === 0} onClick={() => setShown(shown - 1)}>←</button>
              <button type="button" aria-label="Next month" disabled={shown >= months.length - 1} onClick={() => setShown(shown + 1)}>→</button>
            </div>
          </div>
          <Month year={current.year} month={current.month} today={today} events={allEvents} />

          <section className="calendar-year" aria-label={`${current.year} year overview`}>
            <div className="calendar-year-head">
              <h2>{current.year}<span> / THE YEAR AT A GLANCE</span></h2>
              <div className="client-controls">
                <button type="button" aria-label="Previous year" disabled={current.year === 2026} onClick={() => setShown(shown - 12)}>←</button>
                <button type="button" aria-label="Next year" disabled={current.year === endYear} onClick={() => setShown(shown + 12)}>→</button>
              </div>
            </div>
            <p className="calendar-legend"><span className="calendar-event-dot" aria-hidden="true" /> An event on that day. Choose a month to explore.</p>
            <div className="calendar-year-grid">
              {MONTH_NAMES.map((name, month) => <MiniMonth key={name} year={current.year} month={month}
                selected={month === current.month} today={today} events={allEvents}
                onSelect={() => {
                  setShown((current.year - 2026) * 12 + month);
                  detail.current?.focus({ preventScroll: true });
                  detail.current?.scrollIntoView({ block: "start", behavior: "instant" });
                }} />)}
            </div>
          </section>
        </article>
        <aside className="events">
          <h2>Coming up.</h2>
          {events.length ? <EventList events={events} /> : (
            <p className="copy">Nothing on the calendar yet.</p>
          )}
          <h2 className="past-events-heading">Past Events</h2>
          {archive.length ? <EventList events={archive} /> : <p className="copy">No past events listed yet.</p>}
        </aside>
      </div>
    </>
  );
}
