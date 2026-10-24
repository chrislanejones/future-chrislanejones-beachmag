import { ConvexError } from "convex/values";

// Where admin-saved file URLs may point: UploadThing's CDN hosts, or a path on
// this site. A typo or a pasted link to somewhere else is rejected before it's
// stored, so the public pages (and the resume download route) only ever fetch
// from hosts we chose.
const UPLOADTHING_HOSTS = /^(utfs\.io|[a-z0-9-]+\.ufs\.sh)$/i;

export function isUploadThingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && UPLOADTHING_HOSTS.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** Throws unless `url` is an UploadThing file, or (when allowed) a site-relative path like /art/x.webp. */
export function assertStoredUrl(url: string, { allowRelative = false }: { allowRelative?: boolean } = {}): void {
  if (allowRelative && url.startsWith("/") && !url.startsWith("//")) return;
  if (isUploadThingUrl(url)) return;
  throw new ConvexError("That file URL isn't from this site's media storage.");
}
