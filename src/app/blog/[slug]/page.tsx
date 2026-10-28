// src/app/blog/[slug]/page.tsx
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import BlogPostPage from "./BlogPostPage";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { ContentBoundary } from "@/components/coastal/live-content";
import { jsonLd as toJsonLd } from "@/lib/structured-data";
import { DEFAULT_OG_IMAGE, metaDescription } from "@/lib/seo";
import { renderPostHtml, withSectionIds } from "@/lib/blog-content";
import { SITE_URL } from "@/lib/structured-data";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const revalidate = 60;

// Prerender every known post at build time; new ones still render on
// demand (dynamicParams defaults to true) and then cache via ISR.
export async function generateStaticParams() {
  const posts = await convex.query(api.blogPosts.getAllPosts, {}).catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

// OG/Twitter cards require ABSOLUTE URLs — social crawlers don't follow
// site-relative paths. Prefix the domain when coverImage is a /path.
function absoluteImage(coverImage?: string): string | null {
  if (!coverImage) return null;
  if (coverImage.startsWith("http")) return coverImage;
  return `${SITE_URL}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await convex.query(api.blogPosts.getPostBySlug, { slug });
    if (!post) return {};
    const canonical = `${SITE_URL}/blog/${slug}`;
    const ogImage = absoluteImage(post.coverImage);
    const images = [{ url: ogImage ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`, alt: post.title }];
    const description = metaDescription(post.excerpt);
    return {
      title: post.title,
      description,
      alternates: { canonical },
      openGraph: {
        title: post.title,
        description,
        url: canonical,
        type: "article",
        publishedTime: new Date(post.createdAt).toISOString(),
        modifiedTime: new Date(post.updatedAt).toISOString(),
        authors: ["Chris Lane Jones"],
        ...(post.tags && { tags: post.tags }),
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images,
      },
    };
  } catch {
    return {};
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // getPostBySlug only returns published posts, so this 404s unpublished/missing
  // slugs with a real 404 status instead of a soft-404 (HTTP 200 "Not Found").
  const post = await convex.query(api.blogPosts.getPostBySlug, { slug });
  if (!post) notFound();

  const ogImage = absoluteImage(post.coverImage);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    ...(ogImage && { image: ogImage }),
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Chris Lane Jones",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Chris Lane Jones",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    ...(post.tags &&
      post.tags.length > 0 && { keywords: post.tags.join(", ") }),
  };

  const body = withSectionIds(renderPostHtml(post.content));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      {/* The body renders here on the server, so crawlers and AI tools get
          the full text. BlogPostPage mounts the widgets into this DOM. */}
      <ContentBoundary
        fallback={
          <CoastalPageShell>
            <article className="blog-content max-w-none mb-8" dangerouslySetInnerHTML={{ __html: body.html }} />
          </CoastalPageShell>
        }
      >
        <BlogPostPage params={{ slug }} initialPost={post} sections={body.sections}>
          <article
            className="blog-content max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: body.html }}
          />
        </BlogPostPage>
      </ContentBoundary>
    </>
  );
}
