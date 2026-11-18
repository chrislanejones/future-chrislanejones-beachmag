import { useMemo } from "react";
import { DoubleSide, Shape } from "three";
import { ABOVE_WAVE } from "./incoming-wave";

// The Vice edition's flag (src/lib/vice-day.ts): the sandbox's pennant, a
// size up so the letters read, in the painted lifeguard hut's colors with
// "VI" by the pole. Drawn in the planted flag's units: the hoist runs from
// y 0 to -.32 and the point sits at x .56.
const BLUE = "#1f4fd6";
const PINK = "#ff3d9a";

function pennant() {
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(.56, -.16); shape.lineTo(0, -.32); shape.closePath();
  return shape;
}

// "VI" where the pennant is tallest, between y -.09 and -.23.
function letters() {
  const top = -.09, bottom = -.23, stroke = .036;
  const v = new Shape();
  v.moveTo(.05, top); v.lineTo(.05 + stroke, top); v.lineTo(.11, bottom + .075); v.lineTo(.17 - stroke, top); v.lineTo(.17, top);
  v.lineTo(.11 + stroke / 2, bottom); v.lineTo(.11 - stroke / 2, bottom); v.closePath();
  const i = new Shape();
  i.moveTo(.2, top); i.lineTo(.2 + stroke, top); i.lineTo(.2 + stroke, bottom); i.lineTo(.2, bottom); i.closePath();
  return [v, i];
}

/** The pennant with "VI" on both faces. `scale` 1 is the planted flag's size. */
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
