"use client";

import type { MouseEvent } from "react";
import { setTheme, useTheme } from "@/lib/theme-store";

// "Sunlit paper / After dark" as a rotary panel switch: a chicken-head
// bakelite knob turns 90° across a ticked scale between the two labels.
// Click a label to go to that side, or the knob (or press Space / Enter)
// to flip it. Styles: shell.css.
export function EditionButtons() {
  const dark = useTheme() === "dark";
  function choose(event: MouseEvent<HTMLButtonElement>) {
    const side = (event.target as HTMLElement).closest("[data-side]")?.getAttribute("data-side");
    setTheme(side === "light" || side === "dark" ? side : dark ? "light" : "dark");
  }
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="After dark" className="edition-switch" onClick={choose}>
      <span className="edition-side" data-side="light" aria-hidden="true">☀ SUNLIT</span>
      <span className="edition-dial" aria-hidden="true">
        <span className="edition-scale"></span>
        <span className="edition-knob">
          <span className="edition-bar"></span>
          <span className="edition-hub"></span>
          <span className="edition-pointer"></span>
        </span>
      </span>
      <span className="edition-side" data-side="dark" aria-hidden="true">AFTER DARK ☾</span>
    </button>
  );
}
