"use client";

import { PageHero } from "@/components/beachmag/interior-parts";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getPageHeader, type PageHeaderData } from "@/lib/page-headers";

/** The last word goes in the accent color, like "curiosity." on the design's About page. */
export function MastTitle({ title }: { title: string }) {
  const text = /[.!?]$/.test(title) ? title : `${title}.`;
  const split = text.lastIndexOf(" ");
  if (split < 0) return <em>{text}</em>;
  return <>{text.slice(0, split)}<br /><em>{text.slice(split + 1)}</em></>;
}

// Pages without their own hero yet: the design's page hero, filled from the
// page-header data (Convex, with the static copy as fallback).
export function PageIntro({ header, path }: { header: PageHeaderData; path?: string }) {
  return (
    <PageHero
      kicker={header.breadcrumbPage}
      title={<MastTitle title={header.title} />}
      intro={header.description.replace(/[\u2013\u2014]/g, "-")}
      path={path ?? "/about"}
      caption="A little world. A big rabbit hole."
    />
  );
}

export function CoastalPageIntro({ path }: { path: string }) {
  const header = useQuery(api.pageHeaders.getPageHeaderByPath, { path });
  return <PageIntro header={header ?? getPageHeader(path)} path={path} />;
}
