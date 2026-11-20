"use client";

import { createPortal } from "react-dom";

/** Beach City only: when Clear beach floods the castle, the screen goes gray and
 *  "wasted" comes up across it, the way a bad day ends in that game. It's a
 *  joke on top of the wave, so screen readers keep the sandbox's own notice. */
export function Wasted({ show }: { show: boolean }) {
  if (!show) return null;
  // Into the shell, not <body>: the edition's fonts and colors live on [data-beachmag].
  const host = document.querySelector("[data-beachmag]");
  if (!host) return null;
  return createPortal(
    <div className="vice-wasted" aria-hidden="true">
      <span>wasted</span>
    </div>,
    host,
  );
}
