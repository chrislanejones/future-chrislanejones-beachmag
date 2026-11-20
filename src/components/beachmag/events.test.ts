import { expect, test } from "vitest";
import { HOME_EVENTS, applyTitles, calendarEvents, eventHref, eventTitle, findEvent, laterEvents, pastEvents, todayEvents, upcomingEvents } from "./events";

test("homepage has only the three nearest upcoming events while the archive keeps attended events", () => {
  const today = new Date(2026, 9, 26, 12);
  expect(upcomingEvents(today).map((event) => event.start.slice(0, 10))).toEqual(["2026-10-26", "2026-10-27", "2026-10-29"]);
  expect(pastEvents(today).map((event) => event.start.slice(0, 10))).toEqual(["2026-10-20", "2026-10-19"]);
  expect(calendarEvents()).toHaveLength(HOME_EVENTS.length);
});

test("each event has a stable, unique detail route", () => {
  expect(new Set(HOME_EVENTS.map((event) => event.slug)).size).toBe(HOME_EVENTS.length);
  for (const event of HOME_EVENTS) {
    expect(findEvent(event.slug)).toEqual(event);
    expect(eventHref(event)).toBe(`/events/${event.slug}`);
  }
  expect(findEvent("not-an-event")).toBeUndefined();
});

test("past events drop from upcoming without disappearing from the calendar", () => {
  const later = new Date(2027, 0, 1);
  expect(upcomingEvents(later)).toHaveLength(0);
  expect(pastEvents(later)).toHaveLength(HOME_EVENTS.length);
  expect(calendarEvents().some((event) => event.start.startsWith("2026-10-19"))).toBe(true);
});

test("a recurring meetup keeps its series apart from the month's episode title", () => {
  const tonight = findEvent("ai-connect-signals-closed-loops-2026-11-10")!;
  expect(tonight.series).toBe("AI Connect Jax");
  expect(tonight.name).toBe("From Signals to Closed Loops: Building an AI Agent That Actually Fixes Your Data");
  expect(eventTitle(tonight)).toBe("AI Connect Jax: From Signals to Closed Loops: Building an AI Agent That Actually Fixes Your Data");
  // The series is only the label: no event repeats it inside its own title.
  for (const event of HOME_EVENTS) if (event.series) expect(event.name.startsWith(event.series)).toBe(false);
  expect(eventTitle({ name: "Saint Augustine Cowork and Coffee" })).toBe("Saint Augustine Cowork and Coffee");
});

test("titles saved in the admin replace the code's series and title, nothing else", () => {
  const coded = findEvent("ai-connect-signals-closed-loops-2026-11-10")!;
  const cowork = findEvent("st-augustine-cowork-coffee-2026-11-05")!;
  const [renamed, untouched] = applyTitles([coded, cowork], [{ eventSlug: coded.slug, series: "AI Connect", name: "Closed Loops" }]);
  expect(renamed).toEqual({ ...coded, series: "AI Connect", name: "Closed Loops" });
  expect(untouched).toBe(cowork);
  // Switched off in the admin: an empty series means a single title.
  const [single] = applyTitles([coded], [{ eventSlug: coded.slug, series: "", name: "Signals night" }]);
  expect(single.series).toBeUndefined();
  expect(eventTitle(single)).toBe("Signals night");
  expect(applyTitles([coded], undefined)[0]).toBe(coded);
});

test("/events splits today's events from the ones on later days", () => {
  const morning = new Date(2026, 10, 20, 8);
  expect(todayEvents(morning).map((event) => event.slug)).toEqual(["roundtable-event-2026-11-20"]);
  expect(laterEvents(morning).every((event) => event.start.slice(0, 10) > "2026-11-20")).toBe(true);
  expect(laterEvents(morning).some((event) => event.slug === "roundtable-event-2026-11-20")).toBe(false);
  // Together they are exactly what the homepage counts as upcoming.
  expect([...todayEvents(morning), ...laterEvents(morning)]).toEqual(upcomingEvents(morning, Infinity));
  expect(todayEvents(new Date(2026, 10, 21, 8))).toEqual([]);
});
