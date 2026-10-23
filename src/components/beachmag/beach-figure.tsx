import type { CSSProperties } from "react";

export type BeachFigureName = "beach-girl" | "lifeguard-stand" | "surfer-guy";

// Bump when the files in public/art change, so browsers fetch the new ones.
const ART_VERSION = "2";

/**
 * A figure cut from the beach line drawing (public/art): the file's alpha is
 * the ink, painted in whatever color the parent sets, the way the client
 * logos are. Decoration only, so screen readers skip it.
 * Styles: shell.css (.beach-figure).
 */
export function BeachFigure({ name, className = "" }: { name: BeachFigureName; className?: string }) {
  return (
    <span
      className={`beach-figure ${name} ${className}`.trim()}
      aria-hidden="true"
      style={{ "--art": `url("/art/${name}.png?v=${ART_VERSION}")` } as CSSProperties}
    />
  );
}
