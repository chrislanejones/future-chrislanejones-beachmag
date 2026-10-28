import type { Metadata } from "next";
import { PERSON, SITE_URL } from "./structured-data";

// Fallback SEO per page, used when Convex has no row or is unreachable. The
// admin's SEO tab also lists these paths, prefilled, so a page without a row
// yet (like /events) can be saved into Convex. Kept free of the Convex client
// so the admin bundle can import it.
export const DEFAULT_SEO: Record<string, Metadata> = {
  "/": {
    title: "Chris Lane Jones | Senior Web Engineer, React & Rust/WASM",
    description: PERSON.description,
    alternates: { canonical: SITE_URL },
  },
  "/about": {
    title: "About Chris Lane Jones | Developer, Hiker & Community Leader",
    description:
      "From video production to web engineering, leading the Richmond WordPress meetup, and trading Virginia's mountains for Florida's beaches in 2026.",
    alternates: { canonical: `${SITE_URL}/about` },
  },
  "/blog": {
    title: "Blog: React, Rust & Web Engineering",
    description:
      "Notes on React, Next.js, Rust/WebAssembly, and WordPress from real client work and side projects, like moving an image engine into a web worker.",
    alternates: { canonical: `${SITE_URL}/blog` },
  },
  "/contact": {
    title: "Contact Chris Lane Jones | Web Development Services",
    description:
      "Get in touch about web projects, WordPress maintenance, React consulting, or speaking at a meetup. Based in Jacksonville, FL, and available for remote work.",
    alternates: { canonical: `${SITE_URL}/contact` },
  },
  "/events": {
    title: "Events: Meetups & Coworking in Northeast Florida",
    description:
      "Where I'll be: meetups, coworking mornings and conferences around Jacksonville and the First Coast. Come say hi.",
    alternates: { canonical: `${SITE_URL}/events` },
  },
  "/projects": {
    title: "Projects: Apps, Tools & Client Websites",
    description:
      "Apps, tools, and client sites I've built with React, Next.js, TypeScript, Rust/WASM, and WordPress, including Image Horse, an in-browser image editor.",
    alternates: { canonical: `${SITE_URL}/projects` },
  },
  "/career-and-resume": {
    title: "Career & Resume | Chris Lane Jones, Senior Web Engineer",
    description:
      "Following the trail from video production to senior web engineer: React frameworks, open-source communities, and a decade of client work.",
    alternates: { canonical: `${SITE_URL}/career-and-resume` },
  },
  "/browser-tabs": {
    title: "Chrome Tabs I Left Open: Dev Resources",
    description:
      "The tabs I keep coming back to: React libraries, design systems, icon sets, and learning resources for web developers, sorted and searchable.",
    alternates: { canonical: `${SITE_URL}/browser-tabs` },
  },
  "/conferences": {
    title: "Conference Notes: All Things Open & More",
    description:
      "Notes and photos from the web and open-source conferences I've attended: All Things Open, WordCamp US, THAT Conference, RenderATL, and RVAJS.",
    alternates: { canonical: `${SITE_URL}/conferences` },
  },
  "/link-page": {
    title: "Links | Find Chris Lane Jones Online",
    description:
      "GitHub, Codeberg, LinkedIn, X, Bluesky, and more: all my links in one place, plus my portfolio, blog, and web development services.",
    alternates: { canonical: `${SITE_URL}/link-page` },
  },
  "/logo-page": {
    title: "About the Logo: From Mountains to Waves",
    description:
      "My logo went from a Shenandoah mountain to three ocean waves when we moved back to Florida in 2026. The story behind each design, plus downloads.",
    alternates: { canonical: `${SITE_URL}/logo-page` },
  },
  "/site-history": {
    title: "Site History: WordPress 2.1 to Next.js",
    description:
      "How chrislanejones.com changed over the years, from a Kubrick WordPress theme in 2007 to the 2026 beach redesign built on Next.js and Convex.",
    alternates: { canonical: `${SITE_URL}/site-history` },
  },
  "/site-map": {
    title: "Site Map & Changelog",
    description:
      "Every page on chrislanejones.com in one list, plus a changelog of new features, design changes, and content added to the site over time.",
    alternates: { canonical: `${SITE_URL}/site-map` },
  },
  "/wordpress-maintenance": {
    title: "WordPress Maintenance, Monthly Plan",
    description:
      "Three hours of site changes a month: copy edits, plugin updates, security scans, performance tuning, and US-based support for your WordPress site.",
    alternates: { canonical: `${SITE_URL}/wordpress-maintenance` },
  },
  "/react-maintenance": {
    title: "React App Maintenance, Monthly Plan",
    description:
      "Three hours of React app changes a month: component updates, dependency management, security audits, and performance reviews for Next.js apps.",
    alternates: { canonical: `${SITE_URL}/react-maintenance` },
  },
  "/admin-showcase": {
    title: "Admin Showcase: The Portfolio CMS",
    description:
      "A tour of the custom admin behind chrislanejones.com: pages, navigation, blog posts, media, redirects, and data reseeding on Next.js and Convex.",
    alternates: { canonical: `${SITE_URL}/admin-showcase` },
  },
};
