import type { ReactNode } from "react";
import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";
import { CoastalFooter } from "./navigation";
import styles from "./coastal.module.css";

// Inner pages wear the coastal-magazine skin: the homepage's nav and paper
// column around the beach site's content. shell.css maps the beach site's
// --coast-* colors onto the magazine palette.
export function CoastalPageShell({ children }: { children: ReactNode }) {
  return (
    <BeachmagShell>
      <CoastalArt>
        <div className={styles.coastalPage} data-coastal-theme data-coastal-page>
          <div id="main-content" tabIndex={-1} className={styles.container}>
            {children}
          </div>
          <CoastalFooter />
        </div>
      </CoastalArt>
    </BeachmagShell>
  );
}
