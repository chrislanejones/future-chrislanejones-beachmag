"use client";

import { useState } from "react";
import Link from "next/link";
import { ConferenceTile } from "@/components/beachmag/conference-tile";
import { conferenceYears, sortConferences, type Conference } from "@/lib/conferences";

// The conference archive: year tabs, a search, then the tiles.
export default function ConferencesPage({ conferences, year }: { conferences: Conference[]; year?: number }) {
  const [search, setSearch] = useState("");
  const years = conferenceYears(conferences);
  const query = search.trim().toLowerCase();
  const visible = sortConferences(conferences).filter((conference) =>
    (!year || conference.year === year) &&
    (!query || [conference.name, conference.city, conference.venue, conference.year, ...(conference.tags ?? [])].join(" ").toLowerCase().includes(query)),
  );

  return (
    <section aria-label="Conference archive">
      <nav className="filter-tabs" aria-label="Conference years">
        <Link className="action-link" href="/conferences" aria-current={!year ? "page" : undefined}>All years</Link>
        {years.map((item) => (
          <Link key={item} className="action-link" href={`/conferences/${item}`} aria-current={year === item ? "page" : undefined}>{item}</Link>
        ))}
      </nav>
      <div className="journal-search">
        <label>
          SEARCH THE TRAIL
          <input type="search" placeholder="Events, cities or topics" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <p role="status" aria-live="polite">{visible.length} conference{visible.length === 1 ? "" : "s"}{year ? ` in ${year}` : " through the years"}</p>
      </div>
      {visible.length ? (
        <div className="resource-grid">
          {visible.map((conference, index) => <ConferenceTile key={conference._id} conference={conference} priority={index < 2} />)}
        </div>
      ) : (
        <div className="no-articles">
          <h2>{query ? "No matching conferences." : "No conferences yet."}</h2>
          <p>{query ? "Try another event, city or topic." : "Conference details will appear here as they are added."}</p>
          {query && <button type="button" className="clear-search" onClick={() => setSearch("")}>Clear search</button>}
        </div>
      )}
    </section>
  );
}
