"use client";

import { useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useCallback } from "react";

// Ask Next.js to rebuild the cached public pages. This only marks them stale
// (the rebuild happens on each page's next visit), so a burst of saves costs a
// burst of cheap calls, not a burst of rebuilds.
async function refreshSite() {
  try {
    // keepalive lets the request finish even if the admin tab closes right after.
    await fetch("/api/revalidate", { method: "POST", keepalive: true });
  } catch {
    // The save already succeeded in Convex. The page still catches up on its
    // next visit after the daily refresh.
  }
}

/**
 * `useMutation` for admin edits that change what the public site shows.
 * The save resolves only after the site refresh has been sent, so a closed
 * tab or a quick navigation can't drop it.
 */
export function useSiteMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
) {
  const run = useMutation(mutation);
  return useCallback(
    async (...args: Parameters<typeof run>) => {
      const result = await run(...args);
      await refreshSite();
      return result;
    },
    [run],
  );
}
