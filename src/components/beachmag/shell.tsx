import type { ReactNode } from "react";
import { bodoniModa, dmSans } from "./fonts";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { ContentBoundary } from "@/components/coastal/live-content";
import "./beachmag.css";
import "./shell.css";

// The frame every coastal-magazine page shares: fonts, the skip link, the
// life-preserver nav, the footer, and #page-content, which the open menu makes
// inert. The header and footer sit outside <main> so they stay their own landmarks.
export function BeachmagShell({ children }: { children: ReactNode }) {
  return (
    <div data-beachmag className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {/* If the live nav or footer throws (a Convex error), the static copy renders instead. */}
      <ContentBoundary fallback={<SiteNav offline />}>
        <SiteNav />
      </ContentBoundary>
      <div id="page-content">
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <ContentBoundary fallback={<SiteFooter offline />}>
          <SiteFooter />
        </ContentBoundary>
      </div>
    </div>
  );
}
