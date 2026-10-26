"use client";

import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { ClientStrip } from "./client-strip";
import { BeachFigure } from "./beach-figure";
import { EditionButtons } from "./edition-buttons";
import { eventHref, upcomingEvents } from "./events";

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

// The homepage hero: Chris's 10-24-2026 framing of St. Augustine Beach
// (3d-world, Regular lens), 5:30 PM and 9 PM.
const HERO = {
  day: "/hero/home-day.webp",
  night: "/hero/home-night.webp",
  alt: "A 3D model of St. Augustine Beach: a white condo, beach cottages and the dune walkovers, with the pier and a sailboat down the shore",
};
const HERO_SIZES = "(max-width: 1240px) 92vw, 1120px";

function preloadHero() {
  for (const [src, media] of [[HERO.day, "(prefers-color-scheme: light)"], [HERO.night, "(prefers-color-scheme: dark)"]] as const) {
    const { props } = getImageProps({ src, alt: "", width: 1520, height: 739, sizes: HERO_SIZES });
    preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high", media });
  }
}

export function JournalHero() {
  preloadHero();
  const events = upcomingEvents(new Date());
  return (
    <>
      {/* The lifeguard stand from the beach drawing, faint behind the masthead. */}
      <BeachFigure name="lifeguard-stand" className="lifeguard-drawing" />
      {/* Hero copy from the beach site, in the design's masthead. */}
      <div className="top">
        <span>REACT, TYPESCRIPT &amp; RUST/WEBASSEMBLY | AI AUTOMATION | ENTERPRISE CMS &amp; WCAG ACCESSIBILITY</span>
        <EditionButtons />
      </div>
      <h1 className="mast">Senior web<br /><em>engineer.</em></h1>
      <div className="sub">
        <span>I consult, design, and develop web interfaces for businesses and government agencies.</span>
        <a href="#featured-projects">Explore my work ↘</a>
      </div>
      <div className="map-wrap">
        {/* Day in Sunlit, night in After dark (CSS picks by html.dark). Both
            stay lazy so only the visible one downloads; the preloads above
            start the OS theme's still early. Stills only, no video yet. */}
        <Image className="map map-day" src={HERO.day} alt={HERO.alt} width={1520} height={739} sizes={HERO_SIZES} />
        <Image className="map map-night" src={HERO.night} alt={HERO.alt} width={1520} height={739} sizes={HERO_SIZES} />
        <span className="edge">JACKSONVILLE, FL • ST AUGUSTINE BEACH, FL</span>
        <span className="sticker">Still making things.</span>
      </div>
      <div className="columns">
        <ContentBoundary fallback={<EntryView entry={FALLBACK_ENTRY} />}>
          <LiveEntry />
        </ContentBoundary>
        <aside className="events">
          <h2>See you out there.</h2>
          {events.length ? (
            events.map((event) => (
              <div className={event.secret ? "event is-secret" : "event"} key={event.start + event.name}>
                <time dateTime={event.start}>{event.month}<b>{event.day}</b></time>
                <div>
                  <strong>
                    <Link href={eventHref(event)}>{event.name}</Link>
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
