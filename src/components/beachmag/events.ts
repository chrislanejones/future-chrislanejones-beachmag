// "See you out there." on the homepage. Placeholder rows from the design
// until Chris sends the real events.
export type HomeEvent = { month: string; day: string; name: string; place: string };

export const HOME_EVENTS: HomeEvent[] = [
  { month: "NOV", day: "05", name: "Community meetup", place: "Jacksonville · Sample event" },
  { month: "NOV", day: "12", name: "Frontend workshop", place: "Online · Sample event" },
  { month: "NOV", day: "21", name: "Developer conference", place: "Location TBD · Sample event" },
];
