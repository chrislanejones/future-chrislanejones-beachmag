// Events Chris is going to. Add one entry per event: the homepage shows the
// next three under "See you out there.", and /events puts them all on a
// calendar. Past events stay in the calendar and archive, but leave the homepage.
// `start` and `end` are local Eastern time in ISO form, without an offset.
export type HomeEvent = {
  slug: string;
  start: string;
  end?: string;
  name: string;
  place: string;
  venue?: string;
  description: string;
  details?: string[];
  organizer?: string;
  speaker?: string;
  schedule?: { time: string; activity: string }[];
  note?: string;
  url?: string;
  /** Not announced yet: shown in its own color, with no details. */
  secret?: boolean;
};

export const HOME_EVENTS: HomeEvent[] = [
  {
    slug: "buildweek-jacksonville-kickoff-2026-10-19",
    start: "2026-10-19T17:30",
    end: "2026-10-19T19:30",
    name: "BuildWeek //02 Jacksonville Kickoff",
    place: "Overkill Gaming · Jacksonville Beach, FL · 5:30–7:30 PM ET",
    venue: "Overkill Gaming, 1250 Shetter Ave. STE 4, Jacksonville Beach, FL",
    description: "BuildWeek Jacksonville was epic. Night one brought builders together to find collaborators, join a project, or take part in the community build with Kady Yellow. A free event for builders ready to compete, with experts available to help begin planning.",
    organizer: "The Code Alliance Incubator · Hosted by Lucas W. and Brendan L.",
    details: [
      "Bring your idea: an invention, product, or something you can build and demo.",
      "Community Mission Track: build for Kady Yellow.",
      "Enhancement: meaningfully modify an existing physical or software product that can be demoed on Proof Night.",
    ],
    url: "https://buildweek.net",
  },
  {
    slug: "ai-connect-inpatient-critical-care-2026-10-20",
    start: "2026-10-20T17:30",
    end: "2026-10-20T19:00",
    name: "NLP Logix hosts AI Connect: Intelligent Tech in Inpatient & Critical Care",
    place: "Legacy Ale Works · Jacksonville, FL · 5:30–7 PM ET",
    venue: "Legacy Ale Works, Jacksonville, FL",
    description: "Spent Tuesday evening at AI Connect Jax listening to Dr. Dileep Raman, co-founder of Cloudphysician, discuss how AI, computer vision, and ambient intelligence are being used in inpatient and critical care.",
    organizer: "NLP Logix (AI Connect), with The King Tide Foundation",
    speaker: "Dr. Dileep Raman, Co-Founder and Chief of Healthcare, Cloudphysician",
    schedule: [
      { time: "5:30–6 PM", activity: "Socializing & beers" },
      { time: "6–6:45 PM", activity: "Presentation" },
      { time: "6:45–7 PM", activity: "Q&A" },
    ],
  },
  {
    slug: "buildweek-proof-night-2026-10-26",
    start: "2026-10-26T17:30",
    end: "2026-10-26T20:00",
    name: "BuildWeek //02 Proof Night: Live Demos and Winners",
    place: "1250 Shetter Ave · Jacksonville Beach, FL 32250 · 5:30–8 PM ET · Free, RSVP required",
    venue: "1250 Shetter Ave, Jacksonville Beach, FL 32250",
    description: "Monday night was Proof Night at a maker shop: graffiti on every wall, a honeycomb of lights on the ceiling, and a chrome robot parked by the stage like it was waiting for its turn to pitch. People got up in front of a packed room and showed what they'd built, live, on a big screen, which is the bravest way to demo anything. \"Proof\" is the right word for it. A slide can say whatever you want. A working app in front of a full room has to actually work.",
    organizer: "The Code Alliance Incubator",
    note: "The Meetup header lists 5:30–7:30 PM and its description lists 6–8 PM. This calendar uses 5:30–8 PM to cover both.",
    url: "https://www.meetup.com/the-code-alliance-incubator/events/316841340/",
  },
  {
    slug: "jitc-breakfast-meeting-2026-10-27",
    start: "2026-10-27T07:30",
    end: "2026-10-27T09:30",
    name: "Jacksonville IT Council (JITC) Breakfast Meeting",
    place: "Keiser University · Jacksonville, FL · 7:30–9:30 AM ET",
    venue: "Keiser University, 6430 Southpoint Parkway, Jacksonville, FL 32216",
    description: "Tuesday morning was the Jacksonville IT Council breakfast: drop ceiling, projector, coffee in hand, about as far from the night before's lighting as you can get. Two talks stuck with me. One was about renting event space at VyStar Ballpark, home of the Jumbo Shrimp, a team named after an oxymoron and somehow better for it. The other came from the team at Phoenix Sky Harbor airport. They count people walking up to security on the camera feeds, then feed those counts to a model that predicts how many passengers are coming, so the lanes are open before the line reaches the parking garage. That's machine learning you can explain to anyone stuck in that line: count the people, guess the rush, open the lanes.",
    organizer: "Jacksonville IT Council (JITC), with the JAX Chamber",
    speaker: "Jorge A. Sefair, Ph.D., Associate Professor, Industrial and Systems Engineering, University of Florida",
    schedule: [
      { time: "7:30 AM", activity: "Registration, networking & breakfast" },
      { time: "8 AM", activity: "Presenting sponsor and keynote" },
      { time: "9:30 AM", activity: "Meeting adjourns" },
    ],
    details: [
      "Free for JITC members, $10 for Chamber members, $12 for non-Chamber members.",
      "Register on the JAX Chamber IT Council page.",
    ],
    url: "https://jacksonvilleitcouncil.com/about-jitc/#meetings",
  },
  {
    slug: "st-augustine-cowork-coffee-2026-10-29",
    start: "2026-10-29T09:00",
    name: "Saint Augustine Cowork and Coffee",
    place: "Dos Coffee & Wine · St. Augustine · 9 AM · I'm hosting",
    venue: "Dos Coffee & Wine, St. Augustine, FL",
    description: "A coworking and coffee morning in St. Augustine, hosted by Chris Lane Jones.",
    organizer: "Chris Lane Jones",
  },
  {
    slug: "jaxjug-ai-agents-tools-mcp-2026-11-02",
    start: "2026-11-02T18:00",
    end: "2026-11-02T19:30",
    name: "JaxJUG: Next-level AI Concepts for Devs: Agents, Tools, and MCP",
    place: "Interactive Resources · Jacksonville, FL · 6–7:30 PM ET · Hybrid",
    venue: "Interactive Resources LLC, 4901 Belfort Rd #130, Jacksonville, FL 32256",
    description: "Jennifer Reif, a Developer Advocate at Neo4j, covers AI agents, tool integrations, and MCP with code and demos at the Jacksonville Java User Group.",
    organizer: "Jacksonville Java User Group (JaxJUG) · Hosted by Eyal Wirsansky",
    speaker: "Jennifer Reif, Developer Advocate, Neo4j",
    note: "Hybrid: join online at 6:30 PM at meetn.com/eyalscommunity.",
    url: "https://www.meetup.com/jacksonville-java-user-group-jaxjug/events/316919468/",
  },
  {
    slug: "ai-connect-signals-closed-loops-2026-11-10",
    start: "2026-11-10T17:30",
    name: "AI Connect Jax: From Signals to Closed Loops",
    place: "Legacy Ale Works · Jacksonville · 5:30 PM",
    venue: "Legacy Ale Works, Jacksonville, FL",
    description: "AI Connect Jax: From Signals to Closed Loops, at Legacy Ale Works in Jacksonville.",
    url: "https://www.meetup.com/aiconnect/events/316373251/",
  },
  {
    slug: "secret-podcast-event-2026-12-08",
    start: "2026-12-08T10:15",
    name: "Secret Podcast Event",
    place: "Coming soon",
    description: "Details will be shared when this event is announced.",
    secret: true,
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const eventHref = (event: Pick<HomeEvent, "slug">) => `/events/${event.slug}`;
export const findEvent = (slug: string) => HOME_EVENTS.find((event) => event.slug === slug);

export function calendarEvents() {
  return [...HOME_EVENTS].sort((a, b) => a.start.localeCompare(b.start)).map((event) => ({
    ...event,
    month: MONTHS[Number(event.start.slice(5, 7)) - 1],
    day: event.start.slice(8, 10),
  }));
}

/** `now` as YYYY-MM-DD in local time, to compare with `start`. */
export const localDay = (now: Date) =>
  [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, "0")).join("-");

/** The next events still ahead of `now`, soonest first, with the date split for the design's tile. */
export function upcomingEvents(now: Date, limit = 3) {
  const today = localDay(now);
  return calendarEvents().filter((event) => event.start.slice(0, 10) >= today).slice(0, limit);
}

export function pastEvents(now: Date) {
  return calendarEvents().filter((event) => event.start.slice(0, 10) < localDay(now)).reverse();
}
