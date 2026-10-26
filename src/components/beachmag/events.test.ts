import { expect, test } from "vitest";
import { HOME_EVENTS, calendarEvents, eventHref, findEvent, pastEvents, upcomingEvents } from "./events";

test("homepage has only the three nearest upcoming events while the archive keeps attended events", () => {
  const today = new Date(2026, 9, 26, 12);
  expect(upcomingEvents(today).map((event) => event.start.slice(0, 10))).toEqual(["2026-10-26", "2026-10-29", "2026-11-10"]);
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
