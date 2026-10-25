"use client";

import { useEffect, useRef, useState } from "react";

// The sand game's loading screen, from the beach site: an outlined bucket and
// shovel that fill with color from the bottom while the 3D beach downloads,
// counting 1% to 100%. Styles: sandbox.css (.bucket-loader).

/** Every fill takes at least this long, even when the scene is already cached. */
const MIN_FILL_MS = 1000;
/** After the download lands, the last stretch to 100% takes at least this long. */
const FINISH_MS = 450;

// Bucket and shovel drawn once, used twice: as the colored fill and as the outline.
const BUCKET_BODY = "M26 42 L34 99 Q35 105 41 105 L79 105 Q85 105 86 99 L94 42 Z";
const BUCKET_HANDLE = "M89 50 C109 49 113 70 100 79 C95 82 89 81 86 78";
const SAND = "M27 31 Q31 20 44 21 Q51 12 62 17 Q73 12 82 19 Q93 21 93 31";
// The shovel is drawn upright around x = 0, then leaned against the bucket.
const SHOVEL_LEAN = "translate(47 49) rotate(28) scale(.82)";
const SHOVEL_GRIP = "M-8 3Q-8 0-5 0H5Q8 0 8 3V11Q8 14 5 14H-5Q-8 14-8 11ZM-4 4H4V10H-4Z";
const SHOVEL_SHAFT = "M-3 14H3V51H-3Z";
const SHOVEL_BLADE = "M-4 50H4Q13 54 13 66Q13 80 0 84Q-13 80-13 66Q-13 54-4 50Z";

/**
 * `running` starts the fill (the game is on screen); `ready` says the scene's
 * code has arrived. A browser can't report a script's download progress, so
 * the count eases toward 90% while it waits, then runs to 100% once `ready`,
 * never sooner than MIN_FILL_MS after it started. `onFull` fires at 100%.
 */
export function BucketLoader({ running, ready, onFull }: { running: boolean; ready: boolean; onFull: () => void }) {
  const [percent, setPercent] = useState(1);
  const readyAt = useRef<number | null>(null);
  const readyRef = useRef(ready);
  const fullRef = useRef(onFull);
  useEffect(() => {
    readyRef.current = ready;
    fullRef.current = onFull;
  });
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let from = 1;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (readyRef.current && readyAt.current === null) readyAt.current = now;
      let next: number;
      if (readyAt.current === null) {
        // Waiting: a quick start that slows as it nears 90%.
        next = 1 + 89 * (1 - Math.exp(-elapsed / 1400));
        from = next;
      } else {
        const end = Math.max(start + MIN_FILL_MS, readyAt.current + FINISH_MS);
        const t = Math.min(1, (now - readyAt.current) / (end - readyAt.current));
        next = from + (100 - from) * t;
      }
      setPercent(Math.min(100, next));
      if (next >= 100) {
        fullRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  const shown = Math.max(1, Math.round(percent));
  return (
    <div className="bucket-loader" role="progressbar" aria-label="Getting the beach ready" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shown}>
      <svg className="bucket-loader-art" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          {/* The shovel stands in front: hide the bucket's outline behind it. */}
          <mask id="sand-bucket-behind-shovel" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
            <rect width="120" height="120" fill="white" />
            <g transform={SHOVEL_LEAN} fill="black" stroke="black" strokeWidth="3.2">
              <path d={SHOVEL_GRIP} />
              <path d={SHOVEL_SHAFT} />
              <path d={SHOVEL_BLADE} />
            </g>
          </mask>
          <clipPath id="sand-bucket-fill">
            <rect className="bucket-loader-fill" x="0" y="0" width="120" height="120" style={{ transform: `translateY(${100 - percent}%)` }} />
          </clipPath>
        </defs>
        <g className="bucket-loader-colors" clipPath="url(#sand-bucket-fill)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path className="toy-sand" d={`${SAND}Z`} stroke="currentColor" />
          <path className="toy-handle" d={BUCKET_HANDLE} fill="none" strokeWidth="5" />
          <path className="toy-bucket" d={BUCKET_BODY} />
          <rect className="toy-rim" x="21" y="30" width="78" height="13" rx="5" />
          <path className="toy-shine" d="M33 50 L38 92" fill="none" strokeWidth="4" />
          <g className="toy-shovel" transform={SHOVEL_LEAN} fillRule="evenodd">
            <path d={SHOVEL_GRIP} />
            <path d={SHOVEL_SHAFT} />
            <path d={SHOVEL_BLADE} />
          </g>
        </g>
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <g mask="url(#sand-bucket-behind-shovel)">
            <path d={BUCKET_BODY} />
            <rect x="21" y="30" width="78" height="13" rx="5" />
            <path d={BUCKET_HANDLE} />
            <circle cx="88" cy="50" r="3" />
          </g>
          {/* 3.2 at the shovel's .82 scale draws the same 2.6 line as the bucket. */}
          <g transform={SHOVEL_LEAN} strokeWidth="3.2">
            <path d={SHOVEL_GRIP} />
            <path d="M-3 14V50M3 14V50" />
            <path d={SHOVEL_BLADE} />
          </g>
        </g>
      </svg>
      <p>Getting the beach ready… <span className="bucket-loader-count">{shown}%</span></p>
    </div>
  );
}
