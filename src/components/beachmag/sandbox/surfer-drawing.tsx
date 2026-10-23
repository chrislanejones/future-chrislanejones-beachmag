/**
 * A surfer on a longboard, drawn in the same thin ink lines as the lifeguard
 * stand at the top of the page: a few plain shapes, nothing shaded. It is
 * decoration only, so screen readers skip it. Styles: shell.css (.surfer-drawing).
 */
export function SurferDrawing() {
  return (
    <svg className="surfer-drawing" viewBox="0 0 280 300" aria-hidden="true" focusable="false">
      {/* The wave behind: one sweep up from the left, curling over at the lip. */}
      <path d="M14 238 C 64 226 112 176 150 118 C 186 64 232 40 268 52 C 250 62 242 82 254 104" />
      <path d="M254 104 C 240 100 232 108 236 120" />
      {/* Spray off the lip. */}
      <path d="M262 36 L 268 24" />
      <path d="M274 48 L 288 44" />
      {/* The longboard: a lens with a stringer down the middle and a fin at the tail. */}
      <path d="M26 232 C 50 196 190 164 262 176 C 236 212 100 244 26 232 Z" />
      <path d="M40 228 L 250 182" />
      <path d="M62 236 L 56 254 L 82 232" />
      {/* The surfer: standing, knees bent, arms out for balance. */}
      <circle cx="142" cy="74" r="12" />
      <path d="M142 86 L 134 142" />
      <path d="M140 100 L 92 112" />
      <path d="M140 100 L 192 86" />
      <path d="M134 142 L 108 172 L 100 206" />
      <path d="M134 142 L 164 170 L 178 198" />
      {/* Flat water out front, like the ground line under the stand. */}
      <path d="M10 264 L 272 252" />
      <path d="M48 282 L 232 274" />
    </svg>
  );
}
