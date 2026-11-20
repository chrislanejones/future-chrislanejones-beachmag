"use client";

import { useSyncExternalStore } from "react";

// Client half of the Beach City edition, code name "vice" (the day and the
// <head> switch: vice-day.ts). The script sets html.vice before first paint;
// setVice flips it later, for the rest of the tab (the design system's toggle),
// and tells every useVice caller so labels, flags and the footer follow.
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};
const getSnapshot = () => document.documentElement.classList.contains("vice");
const getServerSnapshot = () => false;

/** True while the Beach City edition is on (always false during the server render). */
export function useVice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// On because someone opened a ?vice=on link (or the toggle), not because of the date.
const getPreviewSnapshot = () => {
  try {
    return getSnapshot() && sessionStorage.getItem("vice") === "on";
  } catch {
    return false;
  }
};

/** True while the edition is on as a preview (?vice=on), so the page can offer a way back. */
export function useVicePreview(): boolean {
  return useSyncExternalStore(subscribe, getPreviewSnapshot, getServerSnapshot);
}

/** Turns the Beach City edition on or off for this tab, like ?vice=on / ?vice=off. */
export function setVice(on: boolean) {
  document.documentElement.classList.toggle("vice", on);
  try {
    sessionStorage.setItem("vice", on ? "on" : "off");
  } catch {
    // Storage can be blocked; the class still flips for this page view.
  }
  for (const listener of listeners) listener();
}
