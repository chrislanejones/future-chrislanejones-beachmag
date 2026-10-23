"use client";

import { setTheme, useTheme } from "@/lib/theme-store";

// "Sunlit paper / After dark" in the edition row: the site's theme switch.
export function EditionButtons() {
  const theme = useTheme();
  return (
    <div role="group" aria-label="Color scheme">
      <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Sunlit paper ☀</button>
      <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>After dark ☾</button>
    </div>
  );
}
