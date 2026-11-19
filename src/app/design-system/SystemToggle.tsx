"use client";

import { setVice, useVice } from "@/lib/vice";

/** Beachmag or Beach City: flips the edition for this tab (setVice), and the
 *  page shows that design system (design-system.css hides the other one). */
export function SystemToggle() {
  const vice = useVice();
  return (
    <div className="ds-system-toggle" role="group" aria-label="Which design system">
      <button type="button" aria-pressed={!vice} onClick={() => setVice(false)}>Beachmag</button>
      <button type="button" aria-pressed={vice} onClick={() => setVice(true)}>Beach City</button>
    </div>
  );
}
