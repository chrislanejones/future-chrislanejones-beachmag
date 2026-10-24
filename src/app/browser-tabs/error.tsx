"use client";
import { BeachmagShell } from "@/components/beachmag/shell";
import { CoastalArt } from "@/components/beachmag/coastal-art";

export default function BrowserTabsError({ reset }: { reset: () => void }) {
  return (
    <BeachmagShell>
      <CoastalArt>
        <section className="sandbox-heading" aria-label="Browser tabs unavailable">
          <div className="sandbox-words">
            <p className="game-kicker">BROWSER TABS / UNAVAILABLE</p>
            <h2>The tabs<br /><em>are closed.</em></h2>
            <p>The link archive couldn’t load. Please try again.</p>
            <button type="button" className="radio-key" onClick={reset}>Try again <span aria-hidden="true">↗</span></button>
          </div>
        </section>
      </CoastalArt>
    </BeachmagShell>
  );
}
