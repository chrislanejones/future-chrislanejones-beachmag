/** Event dates are Eastern wall-clock ISO strings. */
export function eventQuarter(start: string) {
  return Number(start.slice(0, 4)) * 4 + Math.floor((Number(start.slice(5, 7)) - 1) / 3);
}

export function currentEventQuarter(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")!.value);
  const month = Number(parts.find((part) => part.type === "month")!.value);
  return year * 4 + Math.floor((month - 1) / 3);
}

export function quarterLabel(quarter: number) {
  return `Q${quarter % 4 + 1} ${Math.floor(quarter / 4)}`;
}

export function eventQuarterOptions(current: number) {
  const first = 2025 * 4;
  return Array.from({ length: Math.max(0, current + 2 - first + 1) }, (_, index) => current + 2 - index);
}
