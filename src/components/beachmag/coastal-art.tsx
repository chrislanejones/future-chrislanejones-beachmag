"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme-store";

// beachmag.css paints with light-dark(); shell.css turns data-palette into
// the color scheme, driven by the site's theme store.
export function CoastalArt({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <div id="coastal-art" data-palette={theme}>
      <div className="chosen-direction">
        <section>
          <div className="direction">{children}</div>
        </section>
      </div>
    </div>
  );
}
