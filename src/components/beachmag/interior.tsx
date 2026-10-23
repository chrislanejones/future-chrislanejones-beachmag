import type { ReactNode } from "react";
import { EditionRow } from "./edition-row";
import { BeachmagShell } from "./shell";
import "./interior.css";

/*
 * The inner-page layout from the 55-page design (design/site): a paper sheet
 * with the top row (breadcrumbs and the Sunlit / After dark knob), then
 * either a PageHero (main pages) or an ArchiveHero + ArchiveLayout
 * (articles, projects, conferences) from interior-parts.tsx, then the footer
 * (from BeachmagShell). An ArchiveHero brings its own top row with the full
 * crumbs, which hides this one (shell.css). interior.css is generated from
 * the design: `pnpm design:css`.
 */
export function InteriorPage({ children }: { children: ReactNode }) {
  return (
    <BeachmagShell>
      <article className="interior" id="interior-page">
        <EditionRow className="page-row" />
        {children}
      </article>
    </BeachmagShell>
  );
}
