import type { ReactNode } from "react";
import { InteriorPage } from "@/components/beachmag/interior";
import styles from "./coastal.module.css";

// Inner pages wear the coastal-magazine layout (design/site): the paper sheet,
// top row and footer from InteriorPage, around the beach site's content.
// shell.css maps the beach site's --coast-* colors onto the sheet's palette.
export function CoastalPageShell({ children }: { children: ReactNode }) {
  return (
    <InteriorPage>
      <div className={styles.coastalPage} data-coastal-theme data-coastal-page>
        {children}
      </div>
    </InteriorPage>
  );
}
