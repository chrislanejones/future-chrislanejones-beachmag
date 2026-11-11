"use client";

import { useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useCallback } from "react";

// A burst of saves (reordering a list fires one mutation per row) should
// refresh the site once, after the burst, not once per row.
const REFRESH_DELAY_MS = 1500;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSiteRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    // Fire and forget: the save already succeeded in Convex. If the refresh
    // fails, the page still updates on its own within a day.
    fetch("/api/revalidate", { method: "POST" }).catch(() => {});
  }, REFRESH_DELAY_MS);
}

/**
 * `useMutation` for admin edits that change what the public site shows.
 * After the mutation succeeds it asks Next.js to rebuild the cached pages,
 * so the edit is live right away instead of at the next daily refresh.
 */
export function useSiteMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
) {
  const run = useMutation(mutation);
  return useCallback(
    async (...args: Parameters<typeof run>) => {
      const result = await run(...args);
      scheduleSiteRefresh();
      return result;
    },
    [run],
  );
}
