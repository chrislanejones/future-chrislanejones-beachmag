"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { BANNER_SCENES } from "./scene-banner";
import { SceneLoop } from "./scene-loop";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getPageHeader, type PageHeaderData } from "@/lib/page-headers";

/** The last word goes in the orange tag, like "engineer." on the homepage. */
function MastTitle({ title }: { title: string }) {
  const text = /[.!?]$/.test(title) ? title : `${title}.`;
  const split = text.lastIndexOf(" ");
  if (split < 0) return <em>{text}</em>;
  return <>{text.slice(0, split)} <em>{text.slice(split + 1)}</em></>;
}

// The homepage masthead for every inner page: label row, title, sub line, and
// the page's 3D beach scene as the tilted photo.
export function PageIntro({ header, path }: { header: PageHeaderData; path?: string }) {
  const scene = path ? BANNER_SCENES[path] : undefined;
  return (
    <header className="page-masthead">
      <div className="top">
        <nav aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{header.breadcrumbPage}</span>
        </nav>
        <span>Chris Lane Jones · Jacksonville, FL</span>
      </div>
      <h1 className="mast"><MastTitle title={header.title} /></h1>
      <div className="sub">
        <span>{header.description.replace(/[\u2013\u2014]/g, "-")}</span>
      </div>
      {scene && (
        <div className="map-wrap" style={{ "--scene-focus": scene.focus } as CSSProperties}>
          <div className="map scene-map">
            <SceneLoop scene={scene} sizes="(max-width: 1240px) 92vw, 1120px" />
          </div>
        </div>
      )}
    </header>
  );
}

export function CoastalPageIntro({ path }: { path: string }) {
  const header = useQuery(api.pageHeaders.getPageHeaderByPath, { path });
  return <PageIntro header={header ?? getPageHeader(path)} path={path} />;
}
