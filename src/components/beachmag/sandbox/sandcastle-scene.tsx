"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, OrthographicCamera, Shape, Vector2, Vector3, type Camera, type Group, type ShaderMaterial, type Texture } from "three";
import { FlagBox } from "./flag-box";
import { IncomingWave } from "./incoming-wave";
import { SandErosion } from "./sand-erosion";
import { beachWashAt, erosionAt } from "./beach-wash";
import { SandMold,moldHeight } from "./sand-molds";
import { makeShellGeometries, makeShellTexture, type ShellKind } from "./shell-geometry";
import { FLAG_BOX, flagBoxSpot, LEDGE_GLSL, ledgeDistance, ledgeHeight, type Spot as LedgeSpot } from "./ledge";
import { BEACH_COLUMNS, BEACH_ROWS, HALF_X, HALF_Z, MOAT_DEPTH, MOUND_HEIGHT, onBeach, pieceElevation, VIEW_HALF_X, VIEW_HALF_Z, type CastlePiece, type CastleTool } from "./sandcastle-model";

type Props = {
  pieces: CastlePiece[];
  tool: CastleTool;
  cursor: { x: number; z: number };
  dark: boolean;
  moving: boolean;
  washStartedAt: number | null;
  onPlace: (x: number, z: number) => void;
  onAim: (point: { x: number; z: number }) => void;
  flagsAvailable: number;
  onPickFlag: () => void;
  /** Hands up the current "can you build here" test, for the keyboard marker. */
  onReach?: (reachable: (x: number, z: number) => boolean) => void;
};
const SPACING = 1.05;

/* ---------- Moldable sand: one height field for mounds, moats and their banks ---------- */

type Spot = { mounds: number; moat: boolean };
type Field = Map<string, Spot>;
const key = (x: number, z: number) => `${x},${z}`;

/** "mound:1,0|moat:-1,1|…" — only the pieces that reshape the sand, in a stable order. */
function sandKeyOf(pieces: CastlePiece[]) {
  return pieces.filter(p => p.kind === "mound" || p.kind === "moat").map(p => `${p.kind}:${p.x},${p.z}`).sort().join("|");
}
function fieldFrom(sandKey: string): Field {
  const field: Field = new Map();
  for (const entry of sandKey ? sandKey.split("|") : []) {
    const [kind, at] = entry.split(":");
    const spot = field.get(at) ?? { mounds: 0, moat: false };
    if (kind === "mound") spot.mounds += 1; else spot.moat = true;
    field.set(at, spot);
  }
  return field;
}

const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Distance from point p to the segment a→b, all in world units on the sand. */
function segmentDistance(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}

/**
 * Sand height at a world point. Mounds are soft plateaus that merge with their
 * neighbors; moats are trenches along the line between side-by-side moat
 * spots (never diagonals), and the dug sand rises in a low bank beside them.
 */
export function sandHeight(field: Field, px: number, pz: number) {
  const cx = Math.round(px / SPACING), cz = Math.round(pz / SPACING);
  let mound = 0, trench = Infinity;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const x = cx + dx, z = cz + dz, spot = field.get(key(x, z));
    if (!spot) continue;
    const ox = x * SPACING, oz = z * SPACING;
    if (spot.mounds) mound = Math.max(mound, spot.mounds * MOUND_HEIGHT * (1 - smooth(.3, .8, Math.hypot(px - ox, pz - oz))));
    if (spot.moat) {
      let d = Math.hypot(px - ox, pz - oz);
      for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (field.get(key(x + nx, z + nz))?.moat) d = Math.min(d, segmentDistance(px, pz, ox, oz, (x + nx) * SPACING, (z + nz) * SPACING));
      }
      trench = Math.min(trench, d);
    }
  }
  if (trench === Infinity) return mound;
  const dig = -MOAT_DEPTH * (1 - smooth(.2, .37, trench));
  const bank = .065 * Math.exp(-(((trench - .46) / .075) ** 2));
  return mound + dig + bank;
}

/** Fine vertices across the beach, coarse ones out to the horizon. */
function terrainAxis(half: number) {
  const values = [-40, -22, -13].filter(v => v < -half - .5);
  for (let v = -half; v <= half + 1e-6; v += .07) values.push(+v.toFixed(3));
  values.push(...[13, 22, 40].filter(v => v > half + .5));
  return values;
}
const XS = terrainAxis(HALF_X * SPACING + 1.2);
const ZS = terrainAxis(HALF_Z * SPACING + 1.2);

function makeTerrain() {
  const positions = new Float32Array(XS.length * ZS.length * 3);
  const water = new Float32Array(XS.length * ZS.length);
  const indices: number[] = [];
  ZS.forEach((z, row) => XS.forEach((x, col) => positions.set([x, ledgeHeight(x, z, FLAG_BOX), z], (row * XS.length + col) * 3)));
  for (let row = 0; row < ZS.length - 1; row++) for (let col = 0; col < XS.length - 1; col++) {
    const a = row * XS.length + col, b = a + 1, c = a + XS.length, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aWater", new BufferAttribute(water, 1));
  geometry.setIndex(indices);
  return geometry;
}

const sandVertex = `
  attribute float aWater;
  varying vec2 vUv; varying vec2 vScreenUv; varying vec2 vWorld; varying vec3 vNormal; varying float vHeight; varying float vWaterLevel;
  uniform float uMoatDepth;
  void main() {
    vUv = position.xz / vec2(14.0, 11.0) + .5;
    vWorld = position.xz;
    vNormal = normal;
    vHeight = position.y;
    // Empty moats sit below their floor; a full one stands just under the sand.
    vWaterLevel = mix(-uMoatDepth - .02, -.075, aWater);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vScreenUv = gl_Position.xy / gl_Position.w * .5 + .5;
  }`;
const sandFragment = `
  varying vec2 vUv; varying vec2 vScreenUv; varying vec2 vWorld; varying vec3 vNormal; varying float vHeight; varying float vWaterLevel;
  uniform float uTime; uniform float uDetail; uniform float uWash; uniform float uDamp; uniform vec3 uSand; uniform vec3 uWater; uniform vec3 uLight;
  void main() {
    // Soft value noise: gentle mottling instead of per-pixel grain, which aliased into stripes.
    vec2 cell = vUv * 260.0; vec2 i = floor(cell); vec2 f = fract(cell); f = f * f * (3.0 - 2.0 * f);
    float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    float noise = mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    vec3 sand = uSand + (noise - .5) * uDetail;
    // Light the relief, normalized so flat sand keeps its exact color.
    float shade = clamp(dot(normalize(vNormal), uLight) / uLight.y, .55, 1.18);
    sand *= shade;
    // Dug sand is damp; the moat water fills from its floor.
    vec3 wetSand = mix(sand, uWater, .25) * .87;
    sand = mix(sand, wetSand, 1.0 - smoothstep(-.12, -.03, vHeight));
    float moat = 1.0 - smoothstep(vWaterLevel - .006, vWaterLevel + .006, vHeight);
    vec3 moatWater = mix(uWater * 1.08, uWater * .8, 1.0 - smoothstep(-.3, -.1, vHeight))
      + sin(vUv.x * 900.0 + uTime * 1.3) * sin(vUv.y * 700.0 - uTime) * .012;
    sand = mix(sand, moatWater, moat * .92);
    // Keep the sea in the upper-right corner at every canvas aspect ratio.
    vec2 p = vScreenUv;
    float coast = p.x + p.y * .7 - 1.22
      + sin(p.y * 7.0 + uTime * .45) * .018;
    float tide = sin(uTime * .65 + p.y * 3.0) * .022;
    // The water stops at the edge of the flag box's rise.
    float protection=1.-smoothstep(-.05,.2,ledgeDistance(vWorld));
    float shore = coast + tide + uWash - protection*2.;
    float water = smoothstep(-.018, .025, shore);
    float wet = smoothstep(-.065, .02, shore);
    vec3 color = mix(sand, mix(sand, uWater, .25) * .87, max(wet,uDamp*.45));
    float shimmer = sin(p.x * 65.0 + sin(p.y * 43.0 + uTime) * 2.0)
      * sin(p.y * 52.0 - uTime * .8) * .015;
    color = mix(color, uWater + shimmer, water);
    float foam = exp(-abs(shore + .003) * 210.0) * .72;
    float wash = exp(-abs(shore + .008) * 65.0) * .13;
    float swellA = coast - .07 + sin(p.y * 8.0 - uTime * .6) * .015 + sin(uTime * .7) * .025;
    float swellB = coast - .18 + sin(p.y * 6.0 + uTime * .4) * .02 + sin(uTime * .55 + 1.4) * .028;
    float waves = (exp(-abs(swellA) * 240.0) * .42 + exp(-abs(swellB) * 260.0) * .28) * water;
    color=mix(color,vec3(.87,.94,.9),clamp(foam + wash + waves, 0.0, .85));
    gl_FragColor=vec4(color,1.0);
    #include <colorspace_fragment>
  }`.replace("void main() {", LEDGE_GLSL + "\n  void main() {");

/* ---------- Animation: a shovel scoops, then water rises in a new moat ---------- */

const DIG_MS = 1200;
const FILL_MS = 1700;
type Dig = { x: number; z: number; start: number; moat: boolean };

/**
 * Zooms so the whole beach, plus headroom for a castle at the back, fills the
 * canvas with a small margin, whatever its shape.
 */
function CameraFit({ onFit }: { onFit: (box: LedgeSpot) => void }) {
  const { size, invalidate } = useThree();
  const getScene = useThree(state => state.get);
  useEffect(() => {
    const { camera } = getScene();
    if (!(camera instanceof OrthographicCamera)) return;
    camera.zoom = 1;
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // Include the flag box just outside the left build boundary.
    const x = (VIEW_HALF_X + .3) * SPACING, z = (VIEW_HALF_Z + .3) * SPACING;
    const left = -(VIEW_HALF_X + 1.9) * SPACING;
    let reach = 0;
    for (const [cx, cy, cz] of [[-x, 0, -z], [x, 0, -z], [-x, 0, z], [x, 0, z], [-x, 1.2, -z], [x, 1.2, -z], [left-.5,0,4.8], [left-.5,1.3,4.8]]) {
      const p = new Vector3(cx, cy, cz).project(camera);
      reach = Math.max(reach, Math.abs(p.x), Math.abs(p.y));
    }
    camera.zoom = .97 / reach;
    camera.updateProjectionMatrix();
    // The flag box follows the frame's left edge, so it is placed once the zoom is set.
    onFit(flagBoxSpot(camera));
    invalidate();
  }, [getScene, size.width, size.height, invalidate, onFit]);
  return null;
}

/** A coral beach shovel that drops in, scoops, and lifts away. */
function Shovel({ dig, height, onDone }: { dig: Dig; height: number; onDone: () => void }) {
  const group = useRef<Group>(null);
  const load = useRef<Group>(null);
  const done = useRef(false);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = Math.min(1, (performance.now() - dig.start) / DIG_MS);
    // 0–.35 plunge, .35–.7 scoop back, .7–1 lift away.
    const plunge = smooth(0, .35, t), scoop = smooth(.35, .7, t), lift = smooth(.7, 1, t);
    g.position.set(dig.x * SPACING + .25 - scoop * .12, height + 1.3 - plunge * 1.55 + lift * 1.8, dig.z * SPACING + .1);
    g.rotation.set(0, -.6, -.45 + plunge * .25 + scoop * .55);
    g.scale.setScalar(1 - lift * .15);
    g.position.x += lift * .65;
    g.visible = t < 1;
    if(load.current)load.current.scale.setScalar(smooth(.32,.55,t)*(1-smooth(.8,1,t)));
    if (performance.now() - dig.start >= DIG_MS + FILL_MS && !done.current) { done.current = true; onDone(); }
  });
  return <group ref={group}>
    <mesh position={[0, .55, 0]} castShadow><cylinderGeometry args={[.03, .03, .8, 10]} /><meshStandardMaterial color="#e0573f" roughness={.6} /></mesh>
    <mesh position={[0, .98, 0]} castShadow><boxGeometry args={[.18, .1, .06]} /><meshStandardMaterial color="#e0573f" roughness={.6} /></mesh>
    <mesh position={[0, .08, 0]} scale={[1, 1.35, .35]} castShadow><sphereGeometry args={[.13, 16, 10]} /><meshStandardMaterial color="#e0573f" roughness={.6} /></mesh>
    <group ref={load} position={[0,.12,.07]}>
      <mesh scale={[1,.65,.6]} castShadow><sphereGeometry args={[.16,12,8]}/><meshStandardMaterial color="#ac8755" roughness={1}/></mesh>
      {[0,1,2,3,4].map(i=><mesh key={i} position={[(i-2)*.055,-.09-i*.04,.05]}><sphereGeometry args={[.022,5,4]}/><meshStandardMaterial color="#c6a36b"/></mesh>)}
    </group>
  </group>;
}

const SHELL_KINDS: ShellKind[] = ["scallop", "clam", "spiral"];
type Shells = Record<ShellKind, BufferGeometry>;
const MOLD_MS=1450;
type Mold={piece:CastlePiece;start:number;elevation:number};
function BucketMold({mold,onDone}:{mold:Mold;onDone:()=>void}){
  const ref=useRef<Group>(null),done=useRef(false);
  const taper=mold.piece.level===2?.68:mold.piece.level===1?.82:1;
  useFrame(()=>{
    if(!ref.current)return;
    const t=Math.min(1,(performance.now()-mold.start)/MOLD_MS);
    const down=smooth(0,.35,t),lift=smooth(.58,1,t);
    ref.current.position.set(mold.piece.x*SPACING, mold.elevation+moldHeight(mold.piece.kind)/2+(1-down)*1.25+lift*1.8,mold.piece.z*SPACING);
    ref.current.rotation.z=.25+(Math.PI-.25)*down+lift*.25;
    ref.current.scale.setScalar(1-lift*.65);
    if(t===1&&!done.current){done.current=true;onDone()}
  });
  return <group ref={ref}>
    <group scale={[taper,1,taper]} rotation={[0,mold.piece.kind==='wall'&&mold.piece.rotated?Math.PI/2:0,0]}>
      <SandMold kind={mold.piece.kind}/>
    </group>
  </group>
}

function SandPiece({ piece, texture, shells, dark, elevation = 0, born }: { piece: CastlePiece; texture: Texture; shells: Shells; dark: boolean; elevation?: number; born?:number }) {
  const reveal=useRef<Group>(null);
  useFrame(()=>{if(reveal.current){const amount=born?smooth(.52,.69,(performance.now()-born)/MOLD_MS):1;reveal.current.scale.y=amount;reveal.current.position.y=elevation*(1-amount)}});
  const color = dark ? "#bca47a" : "#dfc491";
  const material = <meshStandardMaterial color={color} map={texture} roughness={1} />;
  const flag = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0); shape.lineTo(.56, -.16); shape.lineTo(0, -.32); shape.closePath();
    return shape;
  }, []);
  const stacked = piece.level > 0;
  // Each story narrows a little so the stack reads as sand pressed on sand.
  const taper = piece.level === 2 ? .68 : .82;
  return (
    <group ref={reveal} position={[piece.x * SPACING, 0, piece.z * SPACING]} rotation={[0, piece.kind === "wall" && piece.rotated ? Math.PI / 2 : 0, 0]}>
      {piece.kind === "tower" && <group position={[0, elevation, 0]} scale={stacked ? [taper, 1, taper] : 1}>
        {!stacked && <mesh position={[0, .08, 0]} scale={[1, .12, 1]} receiveShadow>
          <sphereGeometry args={[.55, 24, 10]} />{material}
        </mesh>}
        <mesh position={[0, .69, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[.35, .45, 1.3, 32]} />{material}
        </mesh>
        <mesh position={[0, 1.33, 0]} castShadow>
          <cylinderGeometry args={[.41, .37, .16, 32]} />{material}
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const angle = i * Math.PI * 2 / 7;
          return <mesh key={i} position={[Math.cos(angle) * .32, 1.5, Math.sin(angle) * .32]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[.2, .25, .17]} />{material}
          </mesh>;
        })}
        <mesh position={[0, .87, .37]}><boxGeometry args={[.1, .23, .018]} /><meshStandardMaterial color="#756045" /></mesh>
      </group>}
      {piece.kind === "bucket" && <group position={[0, elevation, 0]} scale={stacked ? [taper, 1, taper] : 1}>
        {/* A bucket mold: wider at the base, with the ridges of the bucket pressed into the sand. */}
        {!stacked && <mesh position={[0, .07, 0]} scale={[1.1, .11, 1.1]} receiveShadow>
          <sphereGeometry args={[.55, 24, 10]} />{material}
        </mesh>}
        <mesh position={[0, .5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[.4, .5, 1, 40]} />{material}
        </mesh>
        {[.22, .5, .78].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[.5 - y * .1, .028, 8, 40]} />{material}
        </mesh>)}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[.36, .4, .05, 40]} />{material}
        </mesh>
        <mesh position={[.12, 1.03, -.08]} scale={[1, .5, 1]}>
          <sphereGeometry args={[.09, 12, 8]} />{material}
        </mesh>
      </group>}
      {piece.kind === "shell" && <group position={[.14, elevation + .02, .1]} rotation={[-Math.PI / 2, 0, (piece.id * 1.7) % (Math.PI * 2)]} scale={.3}>
        <mesh geometry={shells[SHELL_KINDS[piece.id % 3]]} castShadow>
          <meshStandardMaterial color={piece.id % 2 ? "#f4e4cf" : "#e9c9b6"} map={texture} roughness={.75} />
        </mesh>
      </group>}
      {piece.kind === "wall" && <group position={[0, elevation, 0]}>
        <mesh position={[0, .39, 0]} castShadow receiveShadow><boxGeometry args={[1.08, .74, .36]} />{material}</mesh>
        {[-.39, 0, .39].map(x => <mesh key={x} position={[x, .84, 0]} castShadow><boxGeometry args={[.23, .22, .39]} />{material}</mesh>)}
        <mesh position={[0, .08, 0]} scale={[1.2, .1, .55]} receiveShadow><sphereGeometry args={[.55, 20, 8]} />{material}</mesh>
      </group>}
      {piece.kind === "flag" && <group position={[0, elevation, 0]}>
        <mesh position={[0, .46, 0]} castShadow><cylinderGeometry args={[.025, .025, .92, 10]} /><meshStandardMaterial color="#785139" /></mesh>
        <mesh position={[.02, .9, 0]} castShadow>
          <shapeGeometry args={[flag]} /><meshStandardMaterial color="#da7960" side={DoubleSide} roughness={.85} />
        </mesh>
      </group>}
    </group>
  );
}

/**
 * Whether a spot is open sand on screen: inside the build limit, inside the
 * canvas with room above it for a tall tower, off the flag box's rise, and
 * back from the waterline. The coast test mirrors sandFragment's
 * screen-space shore (coast = u + .7v - 1.22), with a margin for the tide.
 */
function reachableOn(camera: Camera, box: LedgeSpot) {
  const point = new Vector3();
  return (x: number, z: number) => {
    if (!onBeach(x, z)) return false;
    const wx = x * SPACING, wz = z * SPACING;
    if (ledgeDistance(wx, wz, box) < .35) return false;
    point.set(wx, 0, wz).project(camera);
    if (Math.abs(point.x) > .93 || point.y < -.9 || point.y > .9) return false;
    if ((point.x * .5 + .5) + (point.y * .5 + .5) * .7 - 1.22 > -.11) return false;
    return point.set(wx, 1.5, wz).project(camera).y < .97;
  };
}

function Beach({ pieces, tool, cursor, dark, moving, washStartedAt, onPlace, onAim, flagsAvailable, onPickFlag, onReach, box }: Props & { box: LedgeSpot }) {
  const marker = useRef<Group>(null);
  const shader = useRef<ShaderMaterial>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const clock = useRef(0);
  const { invalidate, camera } = useThree();
  const reachable = useMemo(() => reachableOn(camera, box), [camera, box]);
  useEffect(() => { onReach?.(reachable); }, [reachable, onReach]);
  const texture = useMemo(() => makeShellTexture(), []);
  const shells = useMemo(() => makeShellGeometries(), []);
  const terrain = useMemo(() => makeTerrain(), []);
  useEffect(() => () => { texture.dispose(); terrain.dispose(); Object.values(shells).forEach(geometry => geometry.dispose()); }, [texture, shells, terrain]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uDetail: { value: dark ? .02 : .03 }, uMoatDepth: { value: MOAT_DEPTH },
    uWash:{value:0},uDamp:{value:0},uFlagBox:{value:new Vector2(FLAG_BOX.x,FLAG_BOX.z)},
    uSand: { value: new Color(dark ? "#756448" : "#ddc397") }, uWater: { value: new Color(dark ? "#2e6970" : "#86bcbc") },
    uLight: { value: [-4, 9, 5].map(v => v / Math.hypot(-4, 9, 5)) },
  }), [dark]);

  // Only mounds and moats reshape the sand; castles stand on it.
  const sandKey = sandKeyOf(pieces);
  const field = useMemo(() => fieldFrom(sandKey), [sandKey]);

  // Fill level of each moat spot, 0..1; new moats start empty and rise.
  const fill = useRef(new Map<string, number>());
  const [digs, setDigs] = useState<Dig[]>([]);
  const [molds,setMolds]=useState<Mold[]>([]);
  const previous = useRef<CastlePiece[] | null>(null);
  useEffect(() => {
    const before = previous.current;
    previous.current = pieces;
    const moats = pieces.filter(p => p.kind === "moat");
    if (!before) { // First render: the starting moats are already full.
      moats.forEach(p => fill.current.set(key(p.x, p.z), 1));
      return;
    }
    const ids = new Set(pieces.map(p => p.id)), oldIds = new Set(before.map(p => p.id));
    const added=pieces.filter(p=>!oldIds.has(p.id));
    if(washStartedAt===null&&moving&&added.length===1&&["tower","bucket","wall","mound"].includes(added[0].kind)){
      const piece=added[0];setMolds(current=>[...current,{piece,start:performance.now(),elevation:pieceElevation(pieces,piece)}]);
    }
    setMolds(current=>current.filter(m=>ids.has(m.piece.id)));
    const isSand = (p: CastlePiece) => p.kind === "moat" || p.kind === "mound";
    const changed = [...pieces.filter(p => isSand(p) && !oldIds.has(p.id)), ...before.filter(p => isSand(p) && !ids.has(p.id))];
    for (const p of moats) if (!fill.current.has(key(p.x, p.z))) fill.current.set(key(p.x, p.z), moving ? 0 : 1);
    for (const k of [...fill.current.keys()]) if (!moats.some(p => key(p.x, p.z) === k)) fill.current.delete(k);
    // One tap reshapes one spot; undo and clear change many at once and skip the shovel.
    if (washStartedAt===null && moving && changed.length === 1 && !(added.length===1&&added[0].kind==="mound")) {
      const [p] = changed;
      const dig = { x: p.x, z: p.z, moat: p.kind === "moat" && ids.has(p.id), start: performance.now() };
      setDigs(current => [...current, dig]);
    }
    invalidate();
  }, [pieces, moving, invalidate,washStartedAt]);

  // The rise under the flag box, per vertex: worked out once per box spot,
  // since the wash reshapes every vertex each frame.
  const rise = useMemo(() => {
    const position = terrain.getAttribute("position") as BufferAttribute;
    const heights = new Float32Array(position.count);
    for (let i = 0; i < position.count; i++) heights[i] = ledgeHeight(position.getX(i), position.getZ(i), box);
    return heights;
  }, [terrain, box]);

  // Reshape the sand when mounds or moats change.
  const terrainTween=useRef<{from:Float32Array;to:Float32Array;start:number}|null>(null);
  useEffect(() => {
    const position = terrain.getAttribute("position") as BufferAttribute;
    const from=new Float32Array(position.count),to=new Float32Array(position.count);
    for (let i = 0; i < position.count; i++){from[i]=position.getY(i);to[i]=sandHeight(field, position.getX(i), position.getZ(i))+rise[i];if(!moving||washStartedAt!==null)position.setY(i,to[i])}
    terrainTween.current=moving&&washStartedAt===null?{from,to,start:performance.now()}:null;
    position.needsUpdate = true;
    terrain.computeVertexNormals();
    terrain.computeBoundingSphere();
    invalidate();
  }, [field, terrain, invalidate,moving,washStartedAt,rise]);

  const writeWater = () => {
    const position = terrain.getAttribute("position") as BufferAttribute;
    const water = terrain.getAttribute("aWater") as BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const k = key(Math.round(position.getX(i) / SPACING), Math.round(position.getZ(i) / SPACING));
      water.setX(i, fill.current.get(k) ?? 0);
    }
    water.needsUpdate = true;
  };
  useEffect(writeWater, [field]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (marker.current) { marker.current.position.set(cursor.x * SPACING, sandHeight(field, cursor.x * SPACING, cursor.z * SPACING) + .03, cursor.z * SPACING); marker.current.visible = true; }
    invalidate();
  }, [cursor, field, invalidate,washStartedAt]);

  useFrame(({camera}, delta) => {
    if(washStartedAt!==null){const pos=terrain.getAttribute("position") as BufferAttribute;const advance=beachWashAt(Math.min(1800,performance.now()-washStartedAt)).advance;const screen=new Vector3();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);screen.set(x,0,z).project(camera);pos.setY(i,sandHeight(field,x,z)*(1-erosionAt(advance,screen.x*.5+.5,screen.y*.5+.5))+rise[i])}pos.needsUpdate=true;terrain.computeVertexNormals()}
    const tween=terrainTween.current;
    if(tween){const progress=smooth(.3,.75,(performance.now()-tween.start)/DIG_MS),position=terrain.getAttribute("position") as BufferAttribute;for(let i=0;i<position.count;i++)position.setY(i,tween.from[i]+(tween.to[i]-tween.from[i])*progress);position.needsUpdate=true;terrain.computeVertexNormals();if(progress===1){terrain.computeBoundingSphere();terrainTween.current=null}}
    if (shader.current) {
      shader.current.uniforms.uFlagBox.value.set(box.x,box.z);
      if(moving||washStartedAt!==null)clock.current += Math.min(delta,.05);
      shader.current.uniforms.uTime.value=clock.current;
      const wash=washStartedAt===null?{advance:0,damp:0}:beachWashAt(performance.now()-washStartedAt);
      shader.current.uniforms.uWash.value=wash.advance;
      shader.current.uniforms.uDamp.value=wash.damp;
    }
    if(marker.current&&washStartedAt!==null)marker.current.visible=false;
    // New moats fill once the shovel has scooped.
    let changed = false;
    const now = performance.now();
    for (const dig of digs) {
      if (!dig.moat) continue;
      const k = key(dig.x, dig.z);
      const level = smooth(0, 1, (now - dig.start - DIG_MS * .78) / FILL_MS);
      if ((fill.current.get(k) ?? 1) < level) { fill.current.set(k, level); changed = true; }
    }
    if (changed) writeWater();
  });

  const spot = (event: ThreeEvent<PointerEvent>) => ({ x: Math.round(event.point.x / SPACING), z: Math.round(event.point.z / SPACING) });
  const valid = ({ x, z }: { x: number; z: number }) => reachable(x, z);
  return <>
    <mesh geometry={terrain}>
      <shaderMaterial ref={shader} uniforms={uniforms} vertexShader={sandVertex} fragmentShader={sandFragment} toneMapped={false} />
    </mesh>
    <mesh geometry={terrain} position={[0, .012, 0]} receiveShadow>
      <shadowMaterial opacity={dark ? .22 : .16} transparent depthWrite={false} />
    </mesh>
    {pieces.filter(piece => piece.kind !== "mound" && piece.kind !== "moat").map(piece => <SandErosion key={piece.id} x={piece.x*SPACING} z={piece.z*SPACING} startedAt={washStartedAt}><SandPiece piece={piece} texture={texture} shells={shells} dark={dark} elevation={pieceElevation(pieces, piece)} born={molds.find(m=>m.piece.id===piece.id)?.start} /></SandErosion>)}
    {molds.map(mold=><BucketMold key={mold.piece.id} mold={mold} onDone={()=>setMolds(current=>current.filter(m=>m!==mold))}/>)}
    {digs.map(dig => <Shovel key={`${dig.x},${dig.z},${dig.start}`} dig={dig} height={Math.max(0,sandHeight(field, dig.x * SPACING, dig.z * SPACING))}
      onDone={() => setDigs(current => current.filter(d => d !== dig))} />)}
    <FlagBox at={box} available={flagsAvailable} dark={dark} onPick={onPickFlag}/>
    {washStartedAt!==null&&<IncomingWave startedAt={washStartedAt} dark={dark} clock={clock} box={box}/>}
    <group ref={marker}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.43, .47, 48]} /><meshBasicMaterial color={tool === "erase" ? "#ed9c84" : "#fff4d9"} transparent opacity={.85} depthWrite={false} /></mesh>
    </group>
    {/* An invisible plane over the beach handles taps consistently through every piece. */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .01, 0]}
      onPointerDown={event => { press.current = { x: event.clientX, y: event.clientY }; }}
      onPointerMove={event => {
        const point = spot(event);
        if (valid(point)) onAim(point);
        if (marker.current) {
          marker.current.visible = valid(point);
          marker.current.position.set(point.x * SPACING, sandHeight(field, point.x * SPACING, point.z * SPACING) + .03, point.z * SPACING);
          invalidate();
        }
      }}
      onPointerLeave={() => { press.current = null; if (marker.current) marker.current.visible = false; invalidate(); }}
      onPointerUp={event => {
        if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) < 10) {
          const point = spot(event); if (valid(point)) onPlace(point.x, point.z);
        }
        press.current = null;
      }}>
      <planeGeometry args={[BEACH_COLUMNS * SPACING, BEACH_ROWS * SPACING]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </>;
}

export default function SandcastleScene(props: Props) {
  const [box, setBox] = useState<LedgeSpot>(FLAG_BOX);
  const onFit = useCallback((next: LedgeSpot) => setBox(current => current.x === next.x && current.z === next.z ? current : next), []);
  return <Canvas shadows orthographic camera={{ position: [7, 9, 11], zoom: 60, near: .1, far: 60 }}
    dpr={[1, 1.5]} frameloop={props.moving || props.washStartedAt!==null ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    style={{ touchAction: "pan-y" }} fallback={<p>The 3D beach needs WebGL enabled in your browser.</p>}>
    <CameraFit onFit={onFit} />
    <ambientLight intensity={props.dark ? 1.3 : 1.7} />
    <directionalLight position={[-4, 9, 5]} intensity={2.3} color="#fff1d6" castShadow shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-normalBias={.04} />
    <Beach {...props} box={box} />
  </Canvas>;
}

