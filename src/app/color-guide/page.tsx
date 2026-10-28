import type { Metadata } from "next";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { SITE_URL } from "@/lib/structured-data";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ColorGuide } from "./ColorGuide";

const title = "Color & Type Guide";
const description = "The coastal blue palette, accessible color pairings, typography, and mobile design principles for Chris Lane Jones.";
const url = `${SITE_URL}/color-guide`;

// Its own canonical and og:url; without them the page inherited the home page's.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
};

export default function ColorGuidePage() {
  return <CoastalPageShell><ColorGuide /></CoastalPageShell>;
}
