"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import type { api } from "../../../convex/_generated/api";
import { compareGroups, getLinkGroup } from "@/app/browser-tabs/link-groups";
import { setTheme, useTheme } from "@/lib/theme-store";

type TabLink = { href: string; label: string; domain: string; favicon?: string };

// The Convex favicon, then Google's favicon service, then the design's letter.
function SiteMark({ link }: { link: TabLink }) {
  const host = link.domain.replace(/^www\./, "");
  const sources = [link.favicon, `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`].filter(Boolean) as string[];
  const [attempt, setAttempt] = useState(0);
  return (
    <span className="site-mark" aria-hidden="true">
      {attempt < sources.length ? (
        // eslint-disable-next-line @next/next/no-img-element -- icons come from every linked host; next/image would need each one allowlisted
        <img
          key={sources[attempt]}
          className="resource-favicon"
          src={sources[attempt]}
          alt=""
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setAttempt(attempt + 1)}
        />
      ) : (
        link.label.charAt(0)
      )}
    </span>
  );
}

// "Chrome tabs I left open." The live Convex collection in the design's archive layout.
export function BrowserTabsArchive({ preloadedLinks }: { preloadedLinks: Preloaded<typeof api.browserLinks.getAll> }) {
  const links = usePreloadedQuery(preloadedLinks);
  const theme = useTheme();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const byGroup = new Map<string, TabLink[]>();
    for (const link of links) {
      const group = getLinkGroup(link);
      byGroup.set(group, [...(byGroup.get(group) ?? []), link]);
    }
    return [...byGroup.entries()]
      .sort(([a], [b]) => compareGroups(a, b))
      .map(([name, items], index) => ({ id: `category-${index + 1}`, number: index + 1, name, items }));
  }, [links]);

  const needle = query.trim().toLowerCase();
  const shown = groups.map((group) => ({
    ...group,
    visible: category !== "all" && category !== group.id
      ? []
      : group.items.filter((link) => `${link.label} ${link.domain} ${group.name}`.toLowerCase().includes(needle)),
  }));
  const total = links.length;
  const count = shown.reduce((sum, group) => sum + group.visible.length, 0);
  const clear = () => {
    setCategory("all");
    setQuery("");
    document.getElementById("tab-search")?.focus();
  };

  return (
    <article id="browser-tabs" data-palette={theme}>
      <div className="edition-strip">
        <span>FIELD NOTES / THE INTERNET EDITION</span>
        <div role="group" aria-label="Color scheme">
          <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Sunlit paper ☀</button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>After dark ☾</button>
        </div>
      </div>
      <header className="tabs-hero">
        <div>
          <p className="eyebrow">{total} LINKS. {groups.length === 11 ? "ELEVEN" : groups.length} RABBIT HOLES.</p>
          <h1>Chrome tabs<br /><em>I left open.</em></h1>
          <p className="intro">Tools, oddities & good ideas worth keeping around. A little collection from a very curious browser.</p>
        </div>
        <figure className="tabs-photo">
          <Image
            id="tabs-banner"
            src={theme === "dark" ? "/banners/browser-tabs-night.webp" : "/banners/browser-tabs-day.webp"}
            alt="A miniature 3D coastal world from the Browser Tabs collection"
            width={900}
            height={600}
            sizes="(max-width: 640px) 92vw, 520px"
            priority
          />
          <figcaption>Washed up on the internet. ↙</figcaption>
        </figure>
      </header>
      <div className="collection-bar">
        <p><strong id="result-count" role="status" aria-live="polite">{count} of {total} links</strong><br />Collected, not closed.</p>
        <label className="search-wrap" htmlFor="tab-search">
          FIND SOMETHING
          <input id="tab-search" type="search" placeholder="Search links or categories…" autoComplete="off" aria-controls="resource-results" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      <div className="archive-layout">
        <aside className="category-index" aria-label="Filter by category">
          <p>THE CONTENTS ↓</p>
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>All the tabs <span>{total}</span></button>
          {groups.map((group) => (
            <button type="button" key={group.id} aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>
              {group.name}<span>{String(group.items.length).padStart(2, "0")}</span>
            </button>
          ))}
        </aside>
        <div>
          <label className="mobile-category">
            EXPLORE A CATEGORY
            <select aria-controls="resource-results" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All the tabs · {total}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name} · {group.items.length}</option>
              ))}
            </select>
          </label>
          <div id="resource-results">
            {shown.map((group) => (
              <section className="resource-group" id={group.id} key={group.id} aria-labelledby={`heading-${group.number}`} hidden={!group.visible.length}>
                <div className="group-heading">
                  <span className="group-number">{String(group.number).padStart(2, "0")}</span>
                  <h2 id={`heading-${group.number}`}>{group.name}</h2>
                  <span className="group-count">{group.visible.length} links</span>
                </div>
                <ul>
                  {group.visible.map((link) => (
                    <li key={link.href}>
                      <a className="resource-link" href={link.href} target="_blank" rel="noopener noreferrer">
                        <SiteMark link={link} />
                        <span className="link-copy"><strong>{link.label}</strong><small>{link.domain.replace(/^www\./, "")}</small></span>
                        <span className="link-arrow" aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="no-results" hidden={count !== 0}>
              <h2>Nothing washed ashore.</h2>
              <p>Try another search or clear the category filter.</p>
              <button type="button" onClick={clear}>Show all the tabs ↗</button>
            </div>
          </div>
        </div>
      </div>
      <footer className="tabs-footer">
        <p>All links open in a new tab. Naturally.</p>
        <Link href="/"><em>Back to the beach. ↗</em></Link>
      </footer>
    </article>
  );
}
