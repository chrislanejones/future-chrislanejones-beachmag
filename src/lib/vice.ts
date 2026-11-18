"use client";

import { useSyncExternalStore } from "react";

// Client half of the Vice edition (the day and the switch: vice-day.ts).
// The class is set once before hydration and never changes, so there is
// nothing to subscribe to.
const subscribe = () => () => {};
const getSnapshot = () => document.documentElement.classList.contains("vice");
const getServerSnapshot = () => false;

/** True while the Vice edition is on (always false during the server render). */
export function useVice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
