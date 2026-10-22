import { preloadQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { getPageSEO } from "@/lib/seo";
import { BeachmagShell } from "@/components/beachmag/shell";
import { BrowserTabsArchive } from "@/components/beachmag/browser-tabs-archive";
import "@/components/beachmag/browser-tabs.css";

export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/browser-tabs");
}

export default async function BrowserTabsPage() {
  // Include the collection in the HTML, then subscribe to live updates on hydration.
  const preloadedLinks = await preloadQuery(api.browserLinks.getAll, {});
  return (
    <BeachmagShell>
      <BrowserTabsArchive preloadedLinks={preloadedLinks} />
    </BeachmagShell>
  );
}
