import type { ReactNode } from "react";
import { bodoniModa, dmSans } from "./fonts";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import "./beachmag.css";
import "./shell.css";

// The frame every coastal-magazine page shares: fonts, the life-preserver nav,
// the footer, and #page-content, which the open menu makes inert.
export function BeachmagShell({ children }: { children: ReactNode }) {
  return (
    <main data-beachmag className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <SiteNav />
      <div id="page-content">
        {children}
        <SiteFooter />
      </div>
    </main>
  );
}
