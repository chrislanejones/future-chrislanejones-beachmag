// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BC_COLOR_GROUPS, COAST_MAP, COLOR_GROUPS, MOTION_TOKENS, PAGE_COLORS, SECTIONS, SOURCED, TOKEN_FILES } from "./design-system";

// /design-system prints values copied from the stylesheets. These tests fail
// when a stylesheet changes and the page would go on showing the old value.

const files = new Map<string, string>();
const read = (path: string) => {
  if (!files.has(path)) files.set(path, readFileSync(path, "utf8"));
  return files.get(path)!;
};

/** The value of `--name` in a stylesheet, without a trailing comment. */
function declared(css: string, name: string) {
  const match = css.match(new RegExp(`--${name}:\\s*([^;}]+)`));
  return match?.[1].trim();
}

describe("design system data", () => {
  it("matches the page colors set on .interior", () => {
    const rule = read(TOKEN_FILES.interior).match(/\.interior\{([^}]+)\}/)?.[1] ?? "";
    for (const color of PAGE_COLORS) {
      expect(declared(rule, color.token), color.token).toBe(`light-dark(${color.light},${color.dark})`);
    }
  });

  it("matches the --bm-* primitives in globals.css", () => {
    const css = read(TOKEN_FILES.globals);
    for (const group of COLOR_GROUPS) {
      for (const token of group.tokens) expect(declared(css, token.token), token.token).toBe(token.value);
    }
  });

  it("matches the Beach City --vice-* tokens in globals.css", () => {
    const css = read(TOKEN_FILES.globals);
    for (const group of BC_COLOR_GROUPS) {
      for (const token of group.tokens) expect(declared(css, token.token), token.token).toBe(token.value);
    }
  });

  it("matches the motion tokens in globals.css", () => {
    const css = read(TOKEN_FILES.globals);
    for (const token of MOTION_TOKENS) expect(declared(css, token.token), token.token).toBe(token.value);
  });

  it("matches the --coast-* mapping in shell.css", () => {
    const css = read(TOKEN_FILES.shell);
    for (const row of COAST_MAP) expect(declared(css, row.from), row.from).toBe(row.to);
  });

  it("quotes text that is still in each stylesheet", () => {
    for (const claim of SOURCED) {
      expect(read(claim.source).includes(claim.css), `${claim.source} no longer contains: ${claim.css}`).toBe(true);
    }
  });

  it("gives every section its own id", () => {
    expect(new Set(SECTIONS.map((section) => section.id)).size).toBe(SECTIONS.length);
  });
});
