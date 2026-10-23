"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { ClientStrip } from "./client-strip";
import { upcomingEvents } from "./events";

type Entry = { title: string; excerpt: string; href: string; date?: number };

// Shown while Convex loads, or if the query fails.
const FALLBACK_ENTRY: Entry = {
  title: "A little world. A big rabbit hole.",
  excerpt: "Building the beach, one small detail at a time. Inside the 3D world behind this website.",
  href: "/blog",
};

const readableDate = (time: number) => {
  const d = new Date(time);
  return [d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, "0")).join("-") + "-" + d.getFullYear();
};

function EntryView({ entry }: { entry: Entry }) {
  return (
    <article>
      <div className="label">LATEST ENTRY{entry.date ? ` / ${readableDate(entry.date)}` : ""}</div>
      <h2>{entry.title}</h2>
      <p className="copy">{entry.excerpt}</p>
      <Link href={entry.href}>{entry.date ? "Read the entry ↗" : "Explore the journal ↗"}</Link>
    </article>
  );
}

function LiveEntry() {
  const posts = useQuery(api.blogPosts.getAllPosts);
  const post = posts?.[0];
  return (
    <EntryView
      entry={post ? { title: post.title, excerpt: post.excerpt, href: `/blog/${post.slug}`, date: post.createdAt } : FALLBACK_ENTRY}
    />
  );
}

export function JournalHero() {
  const events = upcomingEvents(new Date());
  return (
    <>
      <div className="lifeguard-drawing" aria-hidden="true">
        <div className="station-roof"></div>
        <div className="station-room"><span></span><span></span></div>
        <div className="station-deck"></div>
        <div className="station-post left-post"></div>
        <div className="station-post right-post"></div>
        <div className="station-brace"></div>
        <div className="station-ladder"></div>
        <div className="station-flagpole"></div>
        <div className="station-flag"></div>
        <div className="station-ground"></div>
      </div>
      {/* Hero copy from the beach site, in the design's masthead. */}
      <div className="top"><span>REACT, TYPESCRIPT &amp; RUST/WEBASSEMBLY | AI AUTOMATION | ENTERPRISE CMS &amp; WCAG ACCESSIBILITY</span></div>
      <h1 className="mast">Senior web<br /><em>engineer.</em></h1>
      <div className="sub">
        <span>I consult, design, and develop web interfaces for businesses and government agencies.</span>
        <a href="#featured-projects">Explore my work ↘</a>
      </div>
      <div className="map-wrap">
        <Image
          className="map"
          src="/hero/coast-day.webp"
          alt="3D map of a beach town, framed as an angled journal photograph"
          width={1280}
          height={622}
          sizes="(max-width: 1240px) 92vw, 1120px"
          priority
        />
        <span className="edge">JACKSONVILLE, FL</span>
        <span className="sticker">Made of curiosity.</span>
      </div>
      <div className="columns">
        <ContentBoundary fallback={<EntryView entry={FALLBACK_ENTRY} />}>
          <LiveEntry />
        </ContentBoundary>
        <aside className="events">
          <h2>See you out there.</h2>
          {events.length ? (
            events.map((event) => (
              <div className="event" key={event.start + event.name}>
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
      <ClientStrip />
    </>
  );
}
