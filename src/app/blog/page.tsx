// src/app/blog/page.tsx
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import BlogPage from "./BlogPage";
import { getPageSEO } from "@/lib/seo";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/blog");
}

export default async function Page() {
  const posts = await convex.query(api.blogPosts.getAllPosts, {}).catch(() => []);

  return (
    <CoastalPageShell>
      <PageHero
        kicker="NOTES FROM THE SHORE"
        title={<>Off the<br /><em>deep end.</em></>}
        intro="Things I learn, build, and occasionally break. Field notes from a life spent making things for the web."
        path="/blog"
        caption="Writing, making & showing up. ↙"
      />
      <BlogPage posts={posts} />
    </CoastalPageShell>
  );
}
