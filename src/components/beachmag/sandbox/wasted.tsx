/** Beach City only: when Clear beach floods the castle, the beach goes gray and
 *  "wasted" comes up across it, the way a bad day ends in that game. It sits
 *  inside the 3D stage, not over the page. It's a joke on top of the wave, so
 *  screen readers keep the sandbox's own notice. */
export function Wasted({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="vice-wasted" aria-hidden="true">
      <span>wasted</span>
    </div>
  );
}
