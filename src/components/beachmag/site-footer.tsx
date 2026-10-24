"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useFooterNavSections } from "@/components/page/links";
import { Waves } from "lucide-react";
import { BeachFigure } from "./beach-figure";
import "./footer.css";

// The social row follows Profile & Social → "Site footer pulls this order";
// this list stands in until Convex answers.
const SOCIAL = [
  { href: "https://x.com/cljwebdev", label: "X.com" },
  { href: "https://github.com/chrislanejones", label: "GitHub" },
  { href: "https://codeberg.org/chrislanejones", label: "Codeberg" },
  { href: "https://www.linkedin.com/in/chrislanejones", label: "LinkedIn" },
  { href: "https://codepen.io/chrislanejones", label: "CodePen" },
];

function useSocial(live: boolean) {
  const rows = useQuery(api.socialLinks.getForFooter, live ? {} : "skip");
  if (!rows?.length) return SOCIAL;
  return [...rows].sort((a, b) => (a.footerOrder ?? 999) - (b.footerOrder ?? 999)).map((row) => ({ href: row.href, label: row.label }));
}

// The three columns come from the admin (Pages & Menu → Footer Sections);
// the "01 /" numbering is the magazine's and is added here. Events exists only
// on this site, so it joins the first column until the admin lists it, the
// same way the header re-adds it (site-nav.tsx).
const EVENTS = { href: "/events", label: "Events", order: 99 };

function useColumns(live: boolean) {
  const sections = useFooterNavSections(live);
  if (sections.some((section) => section.links.some((link) => link.href === EVENTS.href))) return sections;
  return sections.map((section, index) => {
    if (index !== 0) return section;
    const at = section.links.findIndex((link) => link.href === "/contact");
    const links = at < 0 ? [...section.links, EVENTS] : [...section.links.slice(0, at), EVENTS, ...section.links.slice(at)];
    return { ...section, links };
  });
}

function Directory({ live }: { live: boolean }) {
  const columns = useColumns(live);
  return (
    <>
      {columns.map((column, index) => (
        <nav key={column._id ?? column.title} aria-label={`Footer ${column.title.toLowerCase()}`}>
          <h3>{String(index + 1).padStart(2, "0")} / {column.title}</h3>
          {column.links.map((link) => (
            // The 404 Music Lounge is the not-found page: a prefetch of it always returns 404.
            <Link key={link.href} href={link.href} prefetch={link.href === "/404" ? false : undefined}>{link.label}</Link>
          ))}
        </nav>
      ))}
    </>
  );
}

// The coastal-magazine footer: a send-off, then the whole site in three columns.
export function SiteFooter({ offline = false }: { offline?: boolean }) {
  // offline: static columns and social row (the shell renders this if the live footer throws).
  const social = useSocial(!offline);
  return (
    <footer id="coastal-footer" aria-label="Site footer">
      <div className="footer-sendoff">
        <div>
          <p className="footer-kicker">THE COASTAL EDITION / UNTIL NEXT TIME</p>
          <h2>
            See you<br /><em>out there.</em>
            <svg className="footer-umbrella" viewBox="0 0 64 64" aria-hidden="true">
              
<path d="M32 34 L5.0 34.0 A27 27 0 0 1 8.6 20.5 Z" fill="var(--footer-accent)" />              <path d="M32 34 L8.6 20.5 A27 27 0 0 1 18.5 10.6 Z" fill="var(--footer-ink)" />              <path d="M32 34 L18.5 10.6 A27 27 0 0 1 32.0 7.0 Z" fill="var(--footer-accent)" />              <path d="M32 34 L32.0 7.0 A27 27 0 0 1 45.5 10.6 Z" fill="var(--footer-ink)" />              <path d="M32 34 L45.5 10.6 A27 27 0 0 1 55.4 20.5 Z" fill="var(--footer-accent)" />              <path d="M32 34 L55.4 20.5 A27 27 0 0 1 59.0 34.0 Z" fill="var(--footer-ink)" />
              <path d="M5 34 A27 27 0 0 1 59 34" fill="none" stroke="var(--footer-paper)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M32 34 V58 a4 4 0 0 0 8 0" fill="none" stroke="var(--footer-ink)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="6" r="2.5" fill="var(--footer-ink)" />
            </svg>
          </h2>
        </div>
        <Link className="footer-contact" href="/contact">LET’S MAKE SOMETHING <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="footer-directory">
        <div className="footer-bio">
          <Link className="footer-name" href="/">
            <Waves className="footer-wave" size={34} strokeWidth={1.5} aria-hidden="true" />
            Chris Lane Jones
          </Link>
          <p className="footer-role">Senior web engineer</p>
          <p>I consult, design, and develop web interfaces for businesses and government agencies.</p>
          <nav className="footer-social" aria-label="Social profiles">
            {social.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </div>
        <Directory live={!offline} />
        {/* The last column: the girl from the beach drawing, rising past the send-off. */}
        <div className="footer-figures" aria-hidden="true">
          <BeachFigure name="surfer-guy" />
        </div>
      </div>
      <div className="footer-colophon">
        <p>© {new Date().getFullYear()} Chris Lane Jones. All rights reserved.</p>
        <a href="#site-nav">Back to top ↑</a>
      </div>
    </footer>
  );
}
