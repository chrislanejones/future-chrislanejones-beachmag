import { expect, test } from "vitest";
import { currentEventQuarter, eventQuarter, eventQuarterOptions, quarterLabel } from "./event-quarters";

test("current quarter follows Eastern time across year and quarter boundaries", () => {
  expect(quarterLabel(currentEventQuarter(new Date("2027-01-01T04:59:59Z")))).toBe("Q4 2026");
  expect(quarterLabel(currentEventQuarter(new Date("2027-01-01T05:00:00Z")))).toBe("Q1 2027");
  expect(quarterLabel(currentEventQuarter(new Date("2026-04-01T03:59:59Z")))).toBe("Q1 2026");
  expect(quarterLabel(currentEventQuarter(new Date("2026-04-01T04:00:00Z")))).toBe("Q2 2026");
});

test("selector includes every quarter back to 2025 and two quarters ahead across years", () => {
  const options = eventQuarterOptions(eventQuarter("2026-11-05T09:00")).map(quarterLabel);
  expect(options).toHaveLength(10);
  expect(options.slice(0, 3)).toEqual(["Q2 2027", "Q1 2027", "Q4 2026"]);
  expect(options.at(-1)).toBe("Q1 2025");
});

test("event quarter uses its wall-clock date without shifting dates across time zones", () => {
  expect(quarterLabel(eventQuarter("2026-03-31T23:59"))).toBe("Q1 2026");
  expect(quarterLabel(eventQuarter("2026-04-01T00:00"))).toBe("Q2 2026");
});
