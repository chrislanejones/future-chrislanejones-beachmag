"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme-store";

// Cal.com inline booking calendar, colored to match the interior pages and
// switched with the Sunlit / After dark knob. Cal.com reads busy times from
// Google Calendar and writes each booking back to it with a Meet link.
//
// Cal's embed.js is loaded by its own tiny loader (the official snippet,
// typed), so no npm package is added. The CSP in next.config.mjs allows
// app.cal.com for script-src and frame-src.

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns: Record<string, (...args: unknown[]) => void>;
  q: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

const EMBED_SCRIPT = "https://app.cal.com/embed/embed.js";
const ORIGIN = "https://app.cal.com";
const NAMESPACE = "meet";

// Same values as .interior in interior.css (light, dark).
const PALETTE = {
  light: { paper: "#f8efdd", ink: "#173437", accent: "#a33620", line: "#cfc3a8" },
  dark: { paper: "#263b3b", ink: "#eee5d2", accent: "#ffab80", line: "#4d6564" },
};

function cssVars(p: (typeof PALETTE)["light"]) {
  return {
    "cal-brand": p.accent,
    "cal-brand-emphasis": p.ink,
    "cal-brand-text": p.paper,
    "cal-bg": p.paper,
    "cal-bg-emphasis": p.line,
    "cal-bg-muted": p.paper,
    "cal-bg-subtle": p.paper,
    "cal-text": p.ink,
    "cal-text-emphasis": p.ink,
    "cal-text-subtle": p.ink,
    "cal-border": p.line,
    "cal-border-subtle": p.line,
  };
}

// The official Cal.com loader: queues calls until embed.js arrives.
function loadCal(): CalApi {
  const w = window;
  if (w.Cal) return w.Cal;
  const push = (api: { q: unknown[] }, args: unknown) => api.q.push(args);
  const cal = function (...args: unknown[]) {
    const self = w.Cal!;
    if (!self.loaded) {
      self.ns = {};
      self.q = self.q || [];
      const s = document.createElement("script");
      s.src = EMBED_SCRIPT;
      s.async = true;
      document.head.appendChild(s);
      self.loaded = true;
    }
    if (args[0] === "init") {
      const api = Object.assign((...a: unknown[]) => push(api, a), { q: [] as unknown[] });
      const namespace = args[1];
      if (typeof namespace === "string") {
        self.ns[namespace] = self.ns[namespace] || api;
        push(self.ns[namespace] as unknown as { q: unknown[] }, args);
        push(self, ["initNamespace", namespace]);
      } else push(self, args);
      return;
    }
    push(self, args);
  } as CalApi;
  cal.q = [];
  cal.ns = {};
  w.Cal = cal;
  return cal;
}

function mount(host: HTMLElement, calLink: string, theme: "light" | "dark") {
  const cal = loadCal();
  if (!cal.ns[NAMESPACE]) cal("init", NAMESPACE, { origin: ORIGIN });
  host.replaceChildren();
  cal.ns[NAMESPACE]("inline", {
    elementOrSelector: host,
    calLink,
    config: { layout: "month_view", theme },
  });
  // Cal.com reads the theme once, when the frame loads; a later "ui" call
  // with a new theme is ignored. So the knob remounts the frame, and this
  // call has to repeat the same theme or the frame's edge stays light.
  cal.ns[NAMESPACE]("ui", {
    theme,
    hideEventTypeDetails: false,
    layout: "month_view",
    cssVarsPerTheme: { light: cssVars(PALETTE.light), dark: cssVars(PALETTE.dark) },
  });
}

const noSubscribe = () => () => {};

export function CalBooking({ calLink, title }: { calLink: string; title: string }) {
  const host = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  // False while hydrating. useTheme reports the server's "dark" default
  // until then, and a frame started dark can't be swapped while it loads.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const mounted = useRef<string | null>(null);

  // Mount on first render and again whenever the Sunlit / After dark knob
  // turns. The ref skips React Strict Mode's second run in dev, which would
  // otherwise load the same frame twice.
  useEffect(() => {
    if (!hydrated || !host.current) return;
    const key = `${calLink}|${theme}`;
    if (mounted.current === key) return;
    mounted.current = key;
    mount(host.current, calLink, theme);
  }, [calLink, theme, hydrated]);

  return <div ref={host} className="cal-booking" role="region" aria-label={title} />;
}
