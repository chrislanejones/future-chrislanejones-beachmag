import { useMemo } from "react";
import { DoubleSide, Path, Shape } from "three";
import { ABOVE_WAVE } from "./incoming-wave";

// The Beach City edition's flag (src/lib/vice-day.ts): the sandbox's pennant,
// a size up so the letters read, in the painted lifeguard hut's colors with
// "BC" by the pole. Drawn in the planted flag's units: the hoist runs from
// y 0 to -.32 and the point sits at x .56.
const BLUE = "#1f4fd6";
const PINK = "#ff3d9a";

function pennant() {
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(.56, -.16); shape.lineTo(0, -.32); shape.closePath();
  return shape;
}

// "BC" where the pennant is tallest, between y -.09 and -.23. The B is a stem
// with two round lobes and two counters (holes); the C is a ring open to the fly.
function letters() {
  const top = -.09, bottom = -.23, mid = -.16, lobe = .035;
  const b = new Shape();
  b.moveTo(.05, top); b.lineTo(.1, top);
  b.absarc(.1, top - lobe, lobe, Math.PI / 2, -Math.PI / 2, true);
  b.absarc(.1, mid - lobe, lobe, Math.PI / 2, -Math.PI / 2, true);
  b.lineTo(.05, bottom); b.closePath();
  for (const cy of [top - lobe, mid - lobe]) {
    const hole = new Path();
    hole.moveTo(.08, cy + .011); hole.lineTo(.1, cy + .011);
    hole.absarc(.1, cy, .011, Math.PI / 2, -Math.PI / 2, true);
    hole.lineTo(.08, cy - .011); hole.closePath();
    b.holes.push(hole);
  }
  const cx = .215, cy = mid, outer = .066, inner = .034, open = .75;
  const c = new Shape();
  c.absarc(cx, cy, outer, open, Math.PI * 2 - open, false);
  c.absarc(cx, cy, inner, Math.PI * 2 - open, open, true);
  c.closePath();
  return [b, c];
}

/** The pennant with "BC" on both faces. `scale` 1 is the planted flag's size. */
export function ViceFlag({ dark, position, scale = 1 }: { dark: boolean; position: [number, number, number]; scale?: number }) {
  const cloth = useMemo(() => pennant(), []);
  const mark = useMemo(() => letters(), []);
  // At night the letters glow a little, like the rest of the neon.
  const glow = dark ? .55 : 0;
  return (
    <group position={position} scale={scale * 1.4}>
      <mesh castShadow renderOrder={ABOVE_WAVE}>
        <shapeGeometry args={[cloth]} /><meshStandardMaterial color={BLUE} side={DoubleSide} roughness={.85} transparent />
      </mesh>
      {[.003, -.003].map(z => (
        <mesh key={z} position={[0, 0, z]} renderOrder={ABOVE_WAVE}>
          <shapeGeometry args={[mark]} /><meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={glow} side={DoubleSide} roughness={.7} transparent />
        </mesh>
      ))}
    </group>
  );
}
