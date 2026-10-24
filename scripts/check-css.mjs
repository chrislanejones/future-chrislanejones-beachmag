// Fails when a hand-written magazine stylesheet gains a raw color literal.
// Tokens live in src/app/globals.css (--bm-*). The generated files are
// exempt until design/work/build_site_css.py emits var()s (PARKING_LOT.md).
import { readFileSync } from "node:fs";

const FILES = {
  // file: the number of raw hex colors allowed today (only ever lower this).
  "src/components/beachmag/shell.css": 64,
  "src/components/beachmag/sandbox/sandbox.css": 26,
};
const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;
let failed = false;
for (const [file, allowed] of Object.entries(FILES)) {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const found = (css.match(HEX) ?? []).length;
  const verdict = found > allowed ? "FAIL" : "ok";
  if (found > allowed) failed = true;
  console.log(`${verdict.padEnd(4)} ${file}: ${found} raw colors (baseline ${allowed})`);
}
if (failed) {
  console.error("New color literals in hand-written CSS. Use a --bm-* token from src/app/globals.css.");
  process.exit(1);
}
