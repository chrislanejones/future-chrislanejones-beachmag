"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme-store";

// The home page's rules are written under #coastal-art, and its colors flip
// on data-palette (see coastal-art.tsx). No other #coastal-art is on this
// page, so the id is this group's to use.
export function HomeSheet({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <div className="ds-group" id="coastal-art" data-palette={theme}>
      {children}
    </div>
  );
}
