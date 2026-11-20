"use client";

import { setVice, useVicePreview } from "@/lib/vice";

/** Shown while the Beach City edition is on as a preview (a ?vice=on link, like
 *  the one in the launch-day blog post), so a visitor isn't stuck in it for the
 *  rest of the tab. "Back" turns it off and drops ?vice=on from the address. */
export function VicePreviewBar() {
  const preview = useVicePreview();
  if (!preview) return null;
  return (
    <div className="vice-preview-bar" role="region" aria-label="Beach City edition preview">
      <p>You&apos;re viewing the Beach City edition.</p>
      <button
        type="button"
        onClick={() => {
          setVice(false);
          const url = new URL(window.location.href);
          url.searchParams.delete("vice");
          window.history.replaceState(window.history.state, "", url);
        }}
      >
        Back to the regular site
      </button>
    </div>
  );
}
