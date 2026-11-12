import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { fallbackOnlyAtBuild } from "@/lib/isr-fallback";

// Share one read between metadata and the page during each server render.
// Apps first, then websites, each in the admin's order.
export const getProjects = cache(async () => {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  // Empty only during the build; on the live site a failed read keeps the last good page.
  const projects = await fallbackOnlyAtBuild(convex.query(api.projects.getAll, {}), []);
  return projects.sort(
    (a, b) =>
      Number(a.category !== "app") - Number(b.category !== "app") ||
      (a.order ?? 999) - (b.order ?? 999),
  );
});
