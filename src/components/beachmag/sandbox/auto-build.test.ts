import { describe, expect, test } from "vitest";
import { castleReducer, CASTLE_DESIGNS, initialCastle, MAX_FLAGS, onBeach, pickDesign, type CastlePiece } from "./sandcastle-model";

const build = (design: number) => castleReducer(initialCastle, { type: "build", design });
const count = (pieces: CastlePiece[], kind: CastlePiece["kind"]) => pieces.filter(p => p.kind === kind).length;
/** A castle's shape without ids: what is where, and how high. */
const shape = (pieces: CastlePiece[]) => pieces.map(p => `${p.kind}@${p.x},${p.z},${p.level},${p.rotated}`).sort().join(" ");

describe("Build it for me", () => {
  test("has five designs", () => {
    expect(CASTLE_DESIGNS).toHaveLength(5);
  });

  test.each(CASTLE_DESIGNS.map((design, i) => [design.name, i] as const))("%s builds every step, plants all five flags, and undoes in one step", (_, i) => {
    const built = build(i);
    // Each step adds exactly one piece, so none of them was refused.
    expect(built.pieces).toHaveLength(CASTLE_DESIGNS[i].steps.length);
    expect(count(built.pieces, "flag")).toBe(MAX_FLAGS);
    expect(built.pieces.every(p => onBeach(p.x, p.z))).toBe(true);
    expect(new Set(built.pieces.map(p => p.id)).size).toBe(built.pieces.length);
    expect(built.message).toContain(CASTLE_DESIGNS[i].says);
    expect(castleReducer(built, { type: "undo" }).pieces).toEqual(initialCastle.pieces);
    expect(castleReducer(built, { type: "build", design: i }).pieces.length).toBe(built.pieces.length);
    expect(castleReducer(built, { type: "clear" }).pieces).toHaveLength(0);
  });

  test("the classic keep is still the castle it always was", () => {
    const built = build(0);
    expect(count(built.pieces, "tower")).toBe(5);
    expect(built.message).toBe("Your castle is ready: four towers, a tall keep, a moat, and five flags. Make it yours, or Undo to restore your beach.");
  });

  test("all five look different", () => {
    const shapes = CASTLE_DESIGNS.map((_, i) => shape(build(i).pieces));
    expect(new Set(shapes).size).toBe(5);
    // Different by more than a piece or two: the tower counts alone differ.
    expect(new Set(CASTLE_DESIGNS.map((_, i) => count(build(i).pieces, "tower"))).size).toBe(5);
  });

  test("building over a castle replaces it, and one undo brings it back", () => {
    const first = build(1);
    const second = castleReducer(first, { type: "build", design: 3 });
    expect(shape(second.pieces)).toBe(shape(build(3).pieces));
    expect(castleReducer(second, { type: "undo" }).pieces).toEqual(first.pieces);
  });
});

describe("pickDesign", () => {
  const fixed = (v: number) => () => v;
  const samples = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, .999999];

  test("the first press can be any of the five", () => {
    expect(new Set(samples.map(v => pickDesign(null, fixed(v))))).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  test.each([0, 1, 2, 3, 4])("never repeats design %i right away, and can reach the other four", previous => {
    const picks = samples.map(v => pickDesign(previous, fixed(v)));
    expect(picks).not.toContain(previous);
    expect(new Set(picks).size).toBe(4);
    expect(picks.every(n => n >= 0 && n < 5)).toBe(true);
  });

  test("a run of presses never builds the same castle twice in a row", () => {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let previous: number | null = null;
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const next = pickDesign(previous, random);
      expect(next).not.toBe(previous);
      seen.add(next);
      previous = next;
    }
    expect(seen.size).toBe(5);
  });
});
