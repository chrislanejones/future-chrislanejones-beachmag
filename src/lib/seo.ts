import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { DEFAULT_SEO } from "./seo-defaults";
import { PERSON, SITE_URL } from "./structured-data";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

// Next merges metadata shallowly: a page's openGraph/twitter object wholesale
// replaces the layout's, so every page must carry its own images or social
// cards render blank. Relative URLs resolve against metadataBase (layout.tsx).
export const DEFAULT_OG_IMAGE = "/Professional-Photo-of-Chris-Lane-Jones.webp";

/** Search results cut descriptions near 160 characters; trim long copy at a word. */
export function metaDescription(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").replace(/\s*[\u2013\u2014]\s*/g, ", ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

// The layout appends "| Chris Lane Jones" to every page title. Titles that
// already name Chris opt out, so they don't read "Chris Lane Jones | … |
// Chris Lane Jones".
function pageTitle(title: string): Metadata["title"] {
  return title.includes(PERSON.name) ? { absolute: title } : title;
}

function ogImages(url: string, alt: string) {
  return [{ url, width: 1200, height: 630, alt }];
}

export async function getPageSEO(path: string): Promise<Metadata> {
  try {
    const data = await convex.query(api.seo.getSEOByPath, { path });

    if (data && data.title && data.description) {
      const defaults = getDefaultSEO(path);
      const canonical = data.canonicalUrl || (defaults.alternates?.canonical as string | undefined) || `${SITE_URL}${path}`;
      const images = ogImages(data.ogImage || DEFAULT_OG_IMAGE, data.title);
      return {
        title: pageTitle(data.title),
        description: data.description,
        alternates: { canonical },
        openGraph: {
          title: data.title,
          description: data.description,
          url: canonical,
          type: "website",
          images,
        },
        twitter: {
          card: "summary_large_image",
          site: "@cljwebdev",
          creator: "@cljwebdev",
          title: data.title,
          description: data.description,
          images,
        },
      };
    }

    return getDefaultSEO(path);
  } catch (error) {
    console.error("Error fetching SEO from Convex:", error);
    return getDefaultSEO(path);
  }
}

function getDefaultSEO(path: string): Metadata {
  const entry = DEFAULT_SEO[path] || {
    title: "Chris Lane Jones | Senior Web Engineer",
    description: PERSON.description,
    alternates: { canonical: `${SITE_URL}${path}` },
  };

  const canonical =
    (entry.alternates as { canonical?: string })?.canonical ||
    `${SITE_URL}${path}`;
  const title = typeof entry.title === "string" ? entry.title : "Chris Lane Jones";
  const description = entry.description ?? "";

  const images = ogImages(DEFAULT_OG_IMAGE, title);
  return {
    ...entry,
    title: pageTitle(title),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      site: "@cljwebdev",
      creator: "@cljwebdev",
      title,
      description,
      images,
    },
  };
}
