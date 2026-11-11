"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { applyTitles, type HomeEvent } from "./events";

/** Lays the admin's saved titles over a list of the code's events. */
export type Titled = <T extends Pick<HomeEvent, "slug" | "name" | "series">>(events: T[]) => T[];

const asCoded: Titled = (events) => events;

/**
 * Hands its children a `titled()` that applies the admin's event titles live.
 * Until they load, or if the query fails, the code's titles show instead.
 */
export function WithEventTitles({ children }: { children: (titled: Titled) => ReactNode }) {
  return (
    <ContentBoundary fallback={children(asCoded)}>
      <LiveTitles>{children}</LiveTitles>
    </ContentBoundary>
  );
}

function LiveTitles({ children }: { children: (titled: Titled) => ReactNode }) {
  const rows = useQuery(api.eventTitles.list);
  return children((events) => applyTitles(events, rows));
}
