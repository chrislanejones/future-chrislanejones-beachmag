import { Vector3, type Camera } from "three";

/**
 * The low rise of sand the flag box sits on: it fills the stage's lower-left
 * corner behind a curving edge (Chris's sketch, 10-24-2026), so the wash
 * stops along that edge instead of parting in a circle around the box.
 * Shapes are measured from the box along the screen: "across" is the
 * camera's right (world +x, -z), "down" is toward the viewer (world +x, +z).
 */
export type Spot = { x: number; z: number };
/** Where the box sat before it followed the frame: never placed right of this. */
export const FLAG_BOX: Spot = { x: -5.8, z: 4.3 };
/** A slight rise: enough for shading and a dry edge, not a hill. */
export const LEDGE_HEIGHT = .14;
/** The box's center on screen (-1..1): near the left edge, below the middle. */
const BOX_SCREEN = { x: -.8, y: -.25 };

const RIGHT = { x: 11 / Math.hypot(11, 7), z: -7 / Math.hypot(11, 7) };
const DOWN = { x: 7 / Math.hypot(11, 7), z: 11 / Math.hypot(11, 7) };

/**
 * The sketched edge, top to bottom, as [across, down] from the box: over
 * the box, around its right side, then down and back to the left so it
 * leaves the frame at the bottom-left corner (Chris's second sketch).
 */
const SKETCH: [number, number][] = [
  [-1.9, -2.4], [-.65, -2.05], [.4, -1.7], [1.05, -1], [1.2, .35],
  [1.05, 1.55], [.35, 3.2], [-.9, 5.4], [-2.6, 8],
];
/** A Catmull-Rom pass rounds the sketch off; far corners close it off screen. */
function outline(): [number, number][] {
  const points: [number, number][] = [[-40, -2.4]];
  for (let i = 0; i < SKETCH.length - 1; i++) {
    const p0 = SKETCH[Math.max(0, i - 1)], p1 = SKETCH[i], p2 = SKETCH[i + 1], p3 = SKETCH[Math.min(SKETCH.length - 1, i + 2)];
    for (let k = 0; k < 4; k++) {
      const t = k / 4, t2 = t * t, t3 = t2 * t;
      const at = (j: 0 | 1) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      points.push([+at(0).toFixed(3), +at(1).toFixed(3)]);
    }
  }
  points.push(SKETCH[SKETCH.length - 1], [-6, 14], [-40, 14]);
  return points;
}
const OUTLINE = outline();

/** Signed distance to the rise's edge in world units: negative on top of it. */
export function ledgeDistance(x: number, z: number, box: Spot) {
  const dx = x - box.x, dz = z - box.z;
  const px = dx * RIGHT.x + dz * RIGHT.z, py = dx * DOWN.x + dz * DOWN.z;
  let nearest = Infinity, inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [ax, ay] = OUTLINE[j], [bx, by] = OUTLINE[i];
    const ex = bx - ax, ey = by - ay, wx = px - ax, wy = py - ay;
    const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
    nearest = Math.min(nearest, Math.hypot(wx - ex * t, wy - ey * t));
    if ((ay > py) !== (by > py) && px < ax + (py - ay) * ex / ey) inside = !inside;
  }
  return inside ? -nearest : nearest;
}

const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/** The rise's height at a world point: flat on top, a soft bank at the edge. */
export function ledgeHeight(x: number, z: number, box: Spot) {
  return LEDGE_HEIGHT * (1 - smooth(-.5, .08, ledgeDistance(x, z, box)));
}

/**
 * The box's spot for this camera: near the frame's left edge and below the
 * middle, on the sand. It never moves right of where it used to sit.
 */
export function flagBoxSpot(camera: Camera): Spot {
  const home = new Vector3(FLAG_BOX.x, 0, FLAG_BOX.z).project(camera);
  // Half the box's width on screen, flags included, so none of it is cut off.
  const reach = new Vector3(FLAG_BOX.x + RIGHT.x * .8, 0, FLAG_BOX.z + RIGHT.z * .8).project(camera).x - home.x;
  const x = Math.max(Math.min(home.x, BOX_SCREEN.x), -.96 + reach);
  const near = new Vector3(x, BOX_SCREEN.y, -1).unproject(camera);
  const ray = new Vector3(x, BOX_SCREEN.y, 1).unproject(camera).sub(near);
  const hit = near.addScaledVector(ray, -near.y / ray.y);
  return { x: +hit.x.toFixed(3), z: +hit.z.toFixed(3) };
}

const f = (n: number) => n.toFixed(3);
/** The same edge for the shaders: `ledgeDistance(vec2 world)`, with the box in `uFlagBox`. */
export const LEDGE_GLSL = `
  uniform vec2 uFlagBox;
  const int LEDGE_N = ${OUTLINE.length};
  const vec2 LEDGE[LEDGE_N] = vec2[LEDGE_N](${OUTLINE.map(([a, b]) => `vec2(${f(a)},${f(b)})`).join(",")});
  float ledgeDistance(vec2 w){
    vec2 d=w-uFlagBox;
    vec2 p=vec2(dot(d,vec2(${f(RIGHT.x)},${f(RIGHT.z)})),dot(d,vec2(${f(DOWN.x)},${f(DOWN.z)})));
    float nearest=1e9; bool inside=false;
    for(int i=0;i<LEDGE_N;i++){
      vec2 a=LEDGE[(i+LEDGE_N-1)%LEDGE_N], b=LEDGE[i];
      vec2 e=b-a, v=p-a;
      nearest=min(nearest,length(v-e*clamp(dot(v,e)/dot(e,e),0.,1.)));
      if((a.y>p.y)!=(b.y>p.y) && p.x<a.x+(p.y-a.y)*e.x/e.y) inside=!inside;
    }
    return inside?-nearest:nearest;
  }`;
