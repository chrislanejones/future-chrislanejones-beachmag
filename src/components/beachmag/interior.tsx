import type { ReactNode } from "react";
import { EditionButtons } from "./edition-buttons";
import { BeachmagShell } from "./shell";
import "./interior.css";

/*
 * The inner-page layout from the 55-page design (design/site): a paper sheet
 * with an edition row on top, then either a PageHero (main pages) or an
 * ArchiveHero + ArchiveLayout (articles, projects, conferences) from
 * interior-parts.tsx, then the footer (from BeachmagShell). interior.css is generated from the design: `pnpm design:css`.
 */
export function InteriorPage({ edition = "THE COASTAL EDITION", children }: { edition?: string; children: ReactNode }) {
  return (
    <BeachmagShell>
      <article className="interior" id="interior-page">
        <div className="edition-row">
          <span>{edition}</span>
          <EditionButtons />
        </div>
        {children}
      </article>
    </BeachmagShell>
  );
}
