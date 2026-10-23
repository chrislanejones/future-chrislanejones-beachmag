import type { ReactNode } from "react";
import { InteriorPage } from "@/components/beachmag/interior";
import styles from "./coastal.module.css";

// Inner pages wear the coastal-magazine layout (design/site): the paper sheet,
// edition row and footer from InteriorPage, around the beach site's content.
// shell.css maps the beach site's --coast-* colors onto the sheet's palette.
export function CoastalPageShell({ edition, children }: { edition?: string; children: ReactNode }) {
  return (
    <InteriorPage edition={edition}>
      <div className={styles.coastalPage} data-coastal-theme data-coastal-page id="main-content" tabIndex={-1}>
        {children}
      </div>
    </InteriorPage>
  );
}
