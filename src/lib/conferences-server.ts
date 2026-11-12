import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { sortConferences } from "./conferences";
import { fallbackOnlyAtBuild } from "@/lib/isr-fallback";

// Share one read between metadata and the page during each server render.
export const getConferences = cache(async () => {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  // Empty only during the build; on the live site a failed read keeps the last good page.
  return sortConferences(await fallbackOnlyAtBuild(convex.query(api.conferences.getAll, {}), []));
});
