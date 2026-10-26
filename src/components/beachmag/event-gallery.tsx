"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import GalleryDrawer from "./gallery-drawer";

export function EventGallery({ slug, name }: { slug: string; name: string }) {
  return <ContentBoundary key={slug} fallback={<p className="event-detail-note" role="status">The gallery couldn&apos;t load. Please refresh to try again.</p>}>
    <LiveEventGallery slug={slug} name={name} />
  </ContentBoundary>;
}

function LiveEventGallery({ slug, name }: { slug: string; name: string }) {
  const photos = useQuery(api.eventPhotos.list, { eventSlug: slug });
  if (!photos?.length) return null;
  const gallery = photos.map((photo) => ({ src: photo.url, alt: photo.alt,
    description: [photo.caption, photo.stock ? "Stock image" : "", photo.credit].filter(Boolean).join(" · ") }));
  return <section className="event-gallery" aria-label="Event gallery">
    <div className="event-gallery-heading"><div><p className="label">IN PICTURES</p><h2>The gallery.</h2></div>
      <GalleryDrawer photos={gallery} title={name} description="Images, captions and credits for this event."><button type="button">Open gallery ↗</button></GalleryDrawer>
    </div>
    <div className="event-photo-grid">{photos.map((photo) => <figure key={photo._id}>
      <Image src={photo.url} alt={photo.alt} width={1200} height={900} sizes="(max-width: 640px) 90vw, 45vw" />
      {(photo.caption || photo.stock || photo.credit) && <figcaption>{photo.caption && <p>{photo.caption}</p>}{(photo.stock || photo.credit) && <small>{[photo.stock ? "Stock image" : "", photo.credit].filter(Boolean).join(" · ")}</small>}</figcaption>}
    </figure>)}</div>
  </section>;
}
