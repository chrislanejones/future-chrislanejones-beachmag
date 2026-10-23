"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditionButtons } from "./edition-buttons";

export type Crumb = { href?: string; label: string };

// Names for the first part of a page's address, where it isn't just the word.
const SECTION_LABELS: Record<string, string> = {
  "career-and-resume": "Career & Resume",
  "react-maintenance": "React Services",
  "wordpress-maintenance": "WordPress Services",
  "site-history": "Site History",
  "logo-page": "About the Logo",
  "link-page": "Link Page",
  "site-map": "Site Map",
  "color-guide": "Color Guide",
  "admin-showcase": "Admin Showcase",
};

const titleCase = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Home / Section, from the address: the default for pages without their own crumbs. */
function crumbsFromPath(pathname: string): Crumb[] {
  const section = pathname.split("/").filter(Boolean)[0];
  return section ? [{ href: "/", label: "Home" }, { label: SECTION_LABELS[section] ?? titleCase(section) }] : [{ label: "Home" }];
}

// The top row of every inner page: where you are on the left, the
// Sunlit / After dark knob on the right. Articles pass their own crumbs
// (with the page title); other pages build them from the address.
export function EditionRow({ crumbs, className = "" }: { crumbs?: Crumb[]; className?: string }) {
  const pathname = usePathname();
  const trail = crumbs ?? crumbsFromPath(pathname);
  return (
    <div className={`edition-row ${className}`.trim()}>
      <nav className="archive-crumbs" aria-label="Breadcrumb">
        {trail.map((crumb, index) => (
          <span key={`${index}-${crumb.label}`}>
            {index > 0 && <span aria-hidden="true">/ </span>}
            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
          </span>
        ))}
      </nav>
      <EditionButtons />
    </div>
  );
}
