// src/data/navigation-seed.ts

import type { NavLink } from "../components/page/links";

// Original static structure for header navigation items
export interface SeedHeaderNavItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  children?: NavLink[];
}

export const staticHeaderNavItems: SeedHeaderNavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { href: "/about", label: "About" },
      { href: "/browser-tabs", label: "Browser Tabs" },
      { href: "/design-system", label: "Design System" },
      { href: "/site-history", label: "History of This Site" },
    ],
  },
  {
    label: "Work",
    children: [
      { href: "/projects", label: "Projects" },
      { href: "/career-and-resume", label: "Career & Resume" },
      { href: "/conferences", label: "Conferences" },
      { href: "/react-maintenance", label: "React Services" },
      { href: "/wordpress-maintenance", label: "WordPress Services" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Original static structure for footer navigation sections
export interface SeedFooterNavSection {
  title: string;
  links: NavLink[];
}

export const staticFooterNavLinks: SeedFooterNavSection[] = [
  {
    title: "About",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/browser-tabs", label: "Browser Tabs" },
      { href: "/design-system", label: "Design System" },
      { href: "/events", label: "Events" },
      { href: "/site-history", label: "Site History" },
    ],
  },
  {
    title: "Work",
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
    title: "Resources",
    links: [
      { href: "/site-map", label: "Change Log / Site Map" },
      { href: "/link-page", label: "Link Page" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/lets-meet", label: "Let's Meet" },
    ],
  },
];
