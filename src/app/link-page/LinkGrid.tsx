"use client";
import React from "react";
import { FaChrome, FaExternalLinkAlt } from "react-icons/fa";
import Card from "@/components/page/card";
import Image from "next/image";
import styles from "@/components/coastal/interior.module.css";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { SocialIcon } from "@/lib/social-icons";

interface FeaturedLink {
  _id: string;
  href: string;
  label: string;
  domain: string;
  favicon?: string;
  category: string;
  color: string;
  featured?: boolean;
}

type SocialLinkRow = Doc<"socialLinks">;

// The avatar comes from Convex now; this is the photo that ships in /public, so
// the card still renders before the profile query resolves.
const FALLBACK_AVATAR = "/Professional-Photo-of-Chris-Lane-Jones.webp";

// One row of the "Connect With Me" index: icon, name, a dotted leader, then
// ↗ for other sites or → for pages here. Internal routes get a Next <Link>;
// anything flagged external opens in a new tab. Styles: shell.css (.link-index).
function LinkRow({ link }: { link: SocialLinkRow }) {
  const external = link.isExternal ?? link.href.startsWith("http");
  const content = (
    <>
      <SocialIcon iconKey={link.iconKey} size={16} />
      <span className="link-index-label">{link.label}</span>
      <span className="link-index-leader" aria-hidden="true"></span>
      <span className="link-index-arrow" aria-hidden="true">{external ? "↗" : "→"}</span>
    </>
  );

  if (external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return <Link href={link.href}>{content}</Link>;
}

// Convex's useQuery throws on a server error, and a throw during render cannot
// be caught by the component doing the querying. Keeping the link list in its
// own child behind this boundary means a bad query costs one card, not the page.
class LinkListBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Link page links unavailable from Convex.", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <p className="text-center py-8 text-sm text-muted">
        Links are temporarily unavailable.
      </p>
    );
  }
}

function LinkList() {
  // One flat list in the order stored as each link's linkPageOrder, so social
  // profiles and other links can interleave (Home first, services last).
  const pageLinks = useQuery(api.socialLinks.getForLinkPage);
  const allRows = pageLinks ?? [];

  if (pageLinks && allRows.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-muted">
        Links will appear here soon.
      </p>
    );
  }

  return (
    <ul className="link-index">
      {allRows.map((link) => (
        <li key={link._id}>
          <LinkRow link={link} />
        </li>
      ))}
    </ul>
  );
}

export default function LinkGrid() {
  // Query for featured links from Convex
  const featuredLinks = useQuery(api.browserLinks.getFeatured) as
    | FeaturedLink[]
    | undefined;

  // Profile photo, admin-managed, with the /public headshot as the fallback.
  const profile = useQuery(api.siteSettings.getProfile);
  const avatar = profile?.avatar || FALLBACK_AVATAR;

  return (
    <div className={styles.linkHub}>
      {/* Grid Layout: 2 columns, 2 rows - using grid-area equivalent with Tailwind */}
      <div className="grid md:grid-cols-2 grid-cols-1 sm:grid-cols-1 gap-6">
        {/* Card 1: Main Avatar and Info - Top Left (grid-area: 1 / 1 / 2 / 2) */}
        <Card size="small" delay={0.1} className="h-full">
          <div className="flex flex-col items-center gap-4">
            <Image
              alt={profile?.name || "Chris Lane Jones"}
              width={120}
              height={120}
              className="h-30 w-30 rounded-full ring-2 ring-white/5 object-cover"
              src={avatar}
            />
            <h1 className="link-hub-title">Senior web <em>engineer.</em></h1>
            <ul className="link-hub-skills" aria-label="Specialties">
              <li>React, TypeScript &amp; Rust/WebAssembly</li>
              <li>AI automation</li>
              <li>Enterprise CMS</li>
              <li>WCAG accessibility</li>
            </ul>
            <p className="link-hub-intro">
              I consult, design, and develop web interfaces for businesses and government agencies.
            </p>
          </div>
        </Card>

        {/* Card 2: Social Links - Top Right (grid-area: 1 / 2 / 2 / 3) */}
        <Card size="small" delay={0.2} className="h-full">
          <h3 className="mb-6 text-center flex items-center justify-center space-x-2">
            Connect With Me
          </h3>
          <LinkListBoundary>
            <LinkList />
          </LinkListBoundary>
        </Card>

        {/* Card 3: Current Chrome Tabs - Bottom (spans both columns, grid-area: 2 / 1 / 3 / 3) */}
        <Card size="large" delay={0.3}>
          <h3 className="mb-6 text-center flex items-center justify-center space-x-2">
            <FaChrome className="w-6 h-6" />
            <span>Chrome Tabs I Left Open...</span>
          </h3>
          <div className="space-y-3">
            {featuredLinks && featuredLinks.length > 0 ? (
              // Drawn as a strip of browser tabs, favicon and title, with a
              // close mark that is only for show. Styles: shell.css (.tab-strip).
              <ul className="tab-strip">
                {featuredLinks.map((link) => (
                  <li key={link._id}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" title={link.label}>
                      {link.favicon ? (
                        <Image src={link.favicon} width={16} height={16} unoptimized alt="" className="w-4 h-4 rounded" />
                      ) : (
                        <FaExternalLinkAlt className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span className="tab-strip-title">{link.label}</span>
                      <span className="tab-strip-close" aria-hidden="true">×</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted">
                <p className="text-sm">No featured links yet.</p>
                <p className="text-xs mt-2">
                  Explore the full collection of saved browser tabs below.
                </p>
              </div>
            )}

            {/* Link to full browser tabs page */}
            <div className="mt-6 pt-4 border-t border-border">
              <Link className="radio-key" href="/browser-tabs">
                <FaChrome className="w-4 h-4" aria-hidden="true" />
                View All Browser Tabs
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
