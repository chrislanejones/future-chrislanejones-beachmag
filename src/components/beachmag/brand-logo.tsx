// The site's mark: a sun setting over two waves, a dune and sea oats, redrawn
// as flat shapes from Chris's sketch. Its colors are CSS variables (shell.css,
// .brand-logo) so it follows Sunlit / After dark; the footer pins the night set.
// Beach City swaps it for the sunset palm (vice.css).
export function BrandLogo({ className, width = 52, height = 43 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg className={`brand-logo${className ? ` ${className}` : ""}`} viewBox="0 0 100 82" width={width} height={height} aria-hidden="true" focusable="false">
      <g className="logo-rays">
        <path transform="rotate(-82 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(-55 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(-27.5 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(0 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(27.5 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(55 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
        <path transform="rotate(82 50 50)" d="M50 24.5 Q53.6 16 50 7.5 Q46.4 16 50 24.5Z" />
      </g>
      <path className="logo-sun" d="M27.75 59A24 24 0 1 1 71.8 60Q50 62 27.75 59Z" />
      <path className="logo-deep" d="M2 72C16 61 32 55 50 56.5C64 57.5 74 61 86 53C76 62 64 66.5 50 66C34 65.5 18 66 2 72Z" />
      <path className="logo-shallow" d="M8 78C20 71 34 68.5 50 70C58 70.8 64 71 72 67.5C66 74 56 76 46 75.6C32 75 20 75.5 8 78Z" />
      <path className="logo-dune" d="M38 82C52 77.5 66 73.5 80 72.5C88 72 94 73.5 99 76.5C90 76 80 76.5 70 78.5C60 80.5 50 82 38 82Z" />
      <g className="logo-grass">
        <path d="M81 73Q81 60 95 47" />
        <path d="M83.5 72.6Q83 63 87.5 55.5" />
        <path d="M86 72.4Q90 64.5 99 62" />
        <path d="M79 73.4Q76.5 67 78.5 60.5" />
      </g>
    </svg>
  );
}
