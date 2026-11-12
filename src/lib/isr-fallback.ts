// When an ISR rebuild throws, Next.js keeps serving the last good page and
// tries again on the next visit. So on the live site a failed Convex read must
// throw, not turn into an empty list: pages refresh once a day (ADR-026), and an
// empty "No articles yet" page or a false 404 would stay cached that whole day.
//
// During `next build` there is no earlier page to keep, so the fallback still
// applies there and a Convex outage can't fail a deploy.

export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Await a Convex read; on failure use `fallback` while building, throw otherwise. */
export async function fallbackOnlyAtBuild<T>(read: Promise<T>, fallback: T): Promise<T> {
  try {
    return await read;
  } catch (error) {
    if (isBuildPhase()) return fallback;
    throw error;
  }
}

/** For a catch block that falls back: rethrow unless this is `next build`. */
export function rethrowUnlessBuilding(error: unknown): void {
  if (!isBuildPhase()) throw error;
}
