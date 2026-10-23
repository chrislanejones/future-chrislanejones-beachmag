import Link from "next/link";
import { Waves } from "lucide-react";
import { BeachFigure } from "./beach-figure";
import "./footer.css";

const SOCIAL = [
  { href: "https://x.com/cljwebdev", label: "X.com" },
  { href: "https://github.com/chrislanejones", label: "GitHub" },
  { href: "https://codeberg.org/chrislanejones", label: "Codeberg" },
  { href: "https://www.linkedin.com/in/chrislanejones", label: "LinkedIn" },
  { href: "https://codepen.io/chrislanejones", label: "CodePen" },
];

type Column = { title: string; label: string; links: { href: string; label: string }[]; figures?: boolean };

const DIRECTORY: Column[] = [
  {
    title: "01 / About",
    label: "Footer about",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/link-page", label: "Link Page" },
      { href: "/browser-tabs", label: "Browser Tabs" },
      { href: "/events", label: "Events" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "02 / Work",
    label: "Footer work",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/career-and-resume", label: "Career & Resume" },
      { href: "/blog", label: "Blog" },
      { href: "/react-maintenance", label: "React Services" },
      { href: "/wordpress-maintenance", label: "WordPress Services" },
      { href: "/conferences", label: "Conferences" },
    ],
  },
  {
    title: "03 / Resources",
    label: "Footer resources",
    figures: true,
    links: [
      { href: "/site-history", label: "History of This Site" },
      { href: "/logo-page", label: "About the Logo" },
      { href: "/site-map", label: "Change Log / Site Map" },
      { href: "/404", label: "404 Music Lounge" },
      { href: "/admin-showcase", label: "Admin Showcase" },
    ],
  },
];

// The coastal-magazine footer: a send-off, then the whole site in three columns.
export function SiteFooter() {
  return (
    <footer id="coastal-footer" aria-label="Site footer">
      <div className="footer-sendoff">
        <div>
          <p className="footer-kicker">THE COASTAL EDITION / UNTIL NEXT TIME</p>
          <h2>See you<br /><em>out there.</em></h2>
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
            {SOCIAL.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </div>
        {DIRECTORY.map((column) => (
          <nav key={column.title} aria-label={column.label}>
            {/* The girl from the beach drawing stands behind this column,
                the lifeguard stand off to her right at the footer's edge. */}
            {column.figures && (
              <span className="footer-figures">
                <BeachFigure name="beach-girl" />
                <BeachFigure name="lifeguard-stand" />
              </span>
            )}
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              // The 404 Music Lounge is the not-found page: a prefetch of it always returns 404.
              <Link key={link.href} href={link.href} prefetch={link.href === "/404" ? false : undefined}>{link.label}</Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-colophon">
        <p>© {new Date().getFullYear()} Chris Lane Jones. All rights reserved.</p>
        <a href="#site-nav">Back to top ↑</a>
      </div>
    </footer>
  );
}
