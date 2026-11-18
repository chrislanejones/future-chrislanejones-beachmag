import { expect, test } from "vitest";
import { VICE_DAY, VICE_SCRIPT } from "./vice-day";

// Runs the <head> script against a stand-in page and reports whether it set html.vice.
function run(isoNow: string, search = "", stored: string | null = null) {
  const classes = new Set<string>();
  const session = new Map<string, string>(stored ? [["vice", stored]] : []);
  // The script only ever asks for "now".
  const FakeDate = class extends Date {
    constructor() {
      super(isoNow);
    }
  };
  new Function("document", "location", "sessionStorage", "Date", VICE_SCRIPT)(
    { documentElement: { classList: { toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)) } } },
    { search },
    { getItem: (key: string) => session.get(key) ?? null, setItem: (key: string, value: string) => session.set(key, value) },
    FakeDate,
  );
  return { on: classes.has("vice"), stored: session.get("vice") ?? null };
}

test("the edition runs for the whole release day on the Eastern clock", () => {
  expect(VICE_DAY).toBe("2026-11-19");
  expect(run("2026-11-19T05:00:00Z").on).toBe(true); // 12:00 AM Eastern
  expect(run("2026-11-20T04:59:00Z").on).toBe(true); // 11:59 PM Eastern, already the 20th in UTC
  expect(run("2026-11-19T04:59:00Z").on).toBe(false); // 11:59 PM Eastern on the 18th
  expect(run("2026-11-20T05:00:00Z").on).toBe(false); // midnight Eastern, the 20th
});

test("?vice=on previews it on any day, and the choice lasts the tab", () => {
  expect(run("2026-11-18T15:00:00Z", "?vice=on")).toEqual({ on: true, stored: "on" });
  expect(run("2026-11-18T15:00:00Z", "", "on").on).toBe(true);
});

test("?vice=off hides it on the day, and the choice lasts the tab", () => {
  expect(run("2026-11-19T15:00:00Z", "?vice=off")).toEqual({ on: false, stored: "off" });
  expect(run("2026-11-19T15:00:00Z", "", "off").on).toBe(false);
});
