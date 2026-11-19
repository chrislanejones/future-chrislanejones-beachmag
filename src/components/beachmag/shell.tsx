import type { ReactNode } from "react";
import { bodoniModa, dmSans, limelight, monoton, yellowtail } from "./fonts";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { ViceFavicon } from "./vice-favicon";
import { ViceFilters } from "./vice-filters";
import { ContentBoundary } from "@/components/coastal/live-content";
import "./beachmag.css";
import "./shell.css";
import "./vice.css";

// The frame every coastal-magazine page shares: fonts, the skip link, the
// life-preserver nav, the footer, and #page-content, which the open menu makes
// inert. The header and footer sit outside <main> so they stay their own landmarks.
export function BeachmagShell({ children }: { children: ReactNode }) {
  return (
    <div data-beachmag className={`${bodoniModa.variable} ${dmSans.variable} ${monoton.variable} ${limelight.variable} ${yellowtail.variable}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ViceFilters />
      <ViceFavicon />
      {/* If the live nav or footer throws (a Convex error), the static copy renders instead.
          data-nosnippet keeps Google from quoting the menu and footer as a page's search
          snippet; Google only honors it on div, span and section, hence the wrappers. */}
      <div data-nosnippet>
        <ContentBoundary fallback={<SiteNav offline />}>
          <SiteNav />
        </ContentBoundary>
      </div>
      <div id="page-content">
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <div data-nosnippet>
          <ContentBoundary fallback={<SiteFooter offline />}>
            <SiteFooter />
          </ContentBoundary>
        </div>
      </div>
    </div>
  );
}
