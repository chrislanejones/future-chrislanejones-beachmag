// Hidden SVG filters for the Vice edition (vice.css points at them by id).
// Rendered once per page; they cost nothing while the edition is off, since
// no rule refers to them then. Colors match the --vice-* tokens in globals.css.

const NEON_INK = "#ff5cae"; // --vice-neon-ink
const DECO_INK = "#2a1a5e"; // --vice-deco-ink

// A board with "VI" for the lifeguard stand's railing.
function viBoard(board: string, numeral: string) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100"><g transform="rotate(3 110 50)">' +
    `<rect x="8" y="9" width="204" height="82" fill="${board}" stroke="${numeral}" stroke-width="6"/>` +
    `<path d="M62 24h19l15 42 15-42h19L105 80H87ZM142 24h18v56h-18Z" fill="${numeral}"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Paints a line drawing (public/art: black ink on transparent) one solid color,
 * optionally hangs the VI board on the stand's railing and adds a halo. */
function InkFilter({ id, ink, glow, board }: { id: string; ink: string; glow?: number; board?: [string, string] }) {
  return (
    <filter id={id} primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB" x="-8%" y="-8%" width="116%" height="116%">
      <feFlood floodColor={ink} result="paint" />
      <feComposite in="paint" in2="SourceAlpha" operator="in" result={board ? "inked" : "art"} />
      {board && (
        <>
          <feFlood floodColor="#000" x=".4" y=".4" width=".22" height=".11" result="hole" />
          <feComposite in="inked" in2="hole" operator="out" result="cut" />
          <feImage href={viBoard(...board)} x=".395" y=".398" width=".23" height=".115" preserveAspectRatio="none" result="sign" />
          <feMerge result="art">
            <feMergeNode in="cut" />
            <feMergeNode in="sign" />
          </feMerge>
        </>
      )}
      {glow && (
        <>
          <feGaussianBlur in="art" stdDeviation={glow} result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="halo" />
            <feMergeNode in="art" />
          </feMerge>
        </>
      )}
    </filter>
  );
}

// The night photo grade: brightness becomes an indigo, magenta, pink, ice ramp,
// then some of the photo's own color comes back so lit windows stay warm and
// water stays blue. Any photo or video swapped in later gets the same look.
const RAMP = {
  r: "0.055 0.092 0.128 0.165 0.201 0.238 0.275 0.387 0.500 0.613 0.726 0.839 0.871 0.904 0.936 0.968 1.000 0.966 0.931 0.897 0.863",
  g: "0.016 0.025 0.034 0.043 0.052 0.061 0.071 0.088 0.105 0.122 0.140 0.157 0.243 0.329 0.416 0.502 0.588 0.691 0.794 0.897 1.000",
  b: "0.180 0.242 0.303 0.365 0.426 0.488 0.549 0.573 0.596 0.620 0.643 0.667 0.690 0.714 0.737 0.761 0.784 0.838 0.892 0.946 1.000",
};

export function ViceFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="vice-neon-photo" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix in="SourceGraphic" type="saturate" values="1.7" result="own" />
          <feColorMatrix in="SourceGraphic" type="matrix" values=".3 .5 .2 0 0  .3 .5 .2 0 0  .3 .5 .2 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="1.75" exponent=".9" offset="-.03" />
            <feFuncG type="gamma" amplitude="1.75" exponent=".9" offset="-.03" />
            <feFuncB type="gamma" amplitude="1.75" exponent=".9" offset="-.03" />
          </feComponentTransfer>
          <feComponentTransfer result="toned">
            <feFuncR type="table" tableValues={RAMP.r} />
            <feFuncG type="table" tableValues={RAMP.g} />
            <feFuncB type="table" tableValues={RAMP.b} />
          </feComponentTransfer>
          <feComposite in="toned" in2="own" operator="arithmetic" k1="0" k2=".88" k3=".34" k4="0" />
        </filter>
        <InkFilter id="vice-ink-neon" ink={NEON_INK} glow={0.012} />
        <InkFilter id="vice-tower-neon" ink={NEON_INK} glow={0.012} board={["#0b0220", "#1ff0ff"]} />
        <InkFilter id="vice-tower-deco" ink={DECO_INK} board={[DECO_INK, "#ff8cc6"]} />
      </defs>
    </svg>
  );
}
