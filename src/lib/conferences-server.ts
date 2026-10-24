import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { sortConferences } from "./conferences";

// Share one read between metadata and the page during each server render.
export const getConferences = cache(async () => {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  // An unreachable Convex is an empty list, so the build and ISR never fail on it.
  return sortConferences(await convex.query(api.conferences.getAll, {}).catch(() => []));
});
