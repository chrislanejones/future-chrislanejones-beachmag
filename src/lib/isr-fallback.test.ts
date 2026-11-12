import { afterEach, describe, expect, it } from "vitest";
import { fallbackOnlyAtBuild, rethrowUnlessBuilding } from "./isr-fallback";

const failing = () => Promise.reject(new Error("Convex unreachable"));

describe("isr-fallback", () => {
  const phase = process.env.NEXT_PHASE;
  afterEach(() => {
    if (phase === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = phase;
  });

  it("passes a successful read through", async () => {
    await expect(fallbackOnlyAtBuild(Promise.resolve([1, 2]), [])).resolves.toEqual([1, 2]);
  });

  it("uses the fallback while building, so a Convex outage can't fail a deploy", async () => {
    process.env.NEXT_PHASE = "phase-production-build";
    await expect(fallbackOnlyAtBuild(failing(), [])).resolves.toEqual([]);
    expect(() => rethrowUnlessBuilding(new Error("x"))).not.toThrow();
  });

  it("throws on the live site, so ISR keeps the last good page instead of caching an empty one", async () => {
    delete process.env.NEXT_PHASE;
    await expect(fallbackOnlyAtBuild(failing(), [])).rejects.toThrow("Convex unreachable");
    expect(() => rethrowUnlessBuilding(new Error("x"))).toThrow("x");
  });
});
