"use client";

import { useEffect } from "react";
import { useVice } from "@/lib/vice";

const PALM = "/art/vice-logo.svg";

/** The browser tab's icon follows the Beach City edition: the sunset palm while
 *  it's on, the site's own icons (src/app/icon.svg, favicon.ico) when it's off.
 *
 *  Next's icon links are left alone (React re-adds them if they change).
 *  Browsers use the last icon link in the head, so this adds its own and keeps
 *  it last while the edition is on, and removes it when it's off. */
export function ViceFavicon() {
  const vice = useVice();
  useEffect(() => {
    if (!vice) return;
    const palm = document.createElement("link");
    palm.rel = "icon";
    palm.type = "image/svg+xml";
    palm.href = PALM;
    palm.dataset.viceIcon = "";
    const keepLast = () => {
      const icons = document.head.querySelectorAll('link[rel~="icon"]');
      if (icons[icons.length - 1] !== palm) document.head.appendChild(palm);
    };
    keepLast();
    const observer = new MutationObserver(keepLast);
    observer.observe(document.head, { childList: true });
    return () => {
      observer.disconnect();
      palm.remove();
    };
  }, [vice]);
  return null;
}
