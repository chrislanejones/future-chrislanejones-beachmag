// "See you out there." on the homepage: events Chris is going to.
// Add one entry per event; the homepage sorts them, hides past ones and
// shows the next three. `start` is local time in ISO form.
export type HomeEvent = { start: string; name: string; place: string; url?: string };

export const HOME_EVENTS: HomeEvent[] = [
  {
    start: "2026-10-29T09:00",
    name: "Saint Augustine Cowork and Coffee",
    place: "Dos Coffee & Wine · St. Augustine · 9 AM · I'm hosting",
  },
  {
    start: "2026-11-10T17:30",
    name: "AI Connect Jax: From Signals to Closed Loops",
    place: "Legacy Ale Works · Jacksonville · 5:30 PM",
    url: "https://www.meetup.com/aiconnect/events/316373251/",
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** The next events still ahead of `now`, soonest first, with the date split for the design's tile. */
export function upcomingEvents(now: Date, limit = 3) {
  const today = now.toISOString().slice(0, 10);
  return HOME_EVENTS.filter((event) => event.start.slice(0, 10) >= today)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, limit)
    .map((event) => ({
      ...event,
      month: MONTHS[Number(event.start.slice(5, 7)) - 1],
      day: event.start.slice(8, 10),
    }));
}
