"use client";

import { useId } from "react";

/** Paint a black-on-white sketch with the page's ink. The luminance mask
 * lets paper show through white areas as well as the image's transparency. */
export function InkSketch({ src, width, height, className }: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const mask = `${id}-ink`;
  const invert = `${id}-invert`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true" focusable="false">
      <defs>
        <filter id={invert} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" />
        </filter>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height} style={{ maskType: "luminance" }}>
          <image href={src} width={width} height={height} filter={`url(#${invert})`} />
        </mask>
      </defs>
      <rect width={width} height={height} fill="currentColor" mask={`url(#${mask})`} />
    </svg>
  );
}
