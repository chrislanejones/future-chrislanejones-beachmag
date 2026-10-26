"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentBoundary } from "@/components/coastal/live-content";
import GalleryDrawer from "./gallery-drawer";

type EventHeroProps = {
  slug: string;
  name: string;
  description: string;
  initialPhotos: Doc<"eventPhotos">[];
};

export function EventHero(props: EventHeroProps) {
  return <ContentBoundary key={props.slug} fallback={<EventHeroContent {...props} photos={props.initialPhotos} />}>
    <LiveEventHero {...props} />
  </ContentBoundary>;
}

function LiveEventHero(props: EventHeroProps) {
  const photos = useQuery(api.eventPhotos.list, { eventSlug: props.slug });
  return <EventHeroContent {...props} photos={photos ?? props.initialPhotos} />;
}

function EventHeroContent({ name, description, photos }: Pick<EventHeroProps, "name" | "description"> & { photos: Doc<"eventPhotos">[] }) {
  // Gallery order is shared with the admin: the first photo is the main photo.
  const main = photos[0];
  const gallery = photos.slice(0, 5).map((photo) => ({ src: photo.url, alt: photo.alt,
    description: [photo.caption || photo.alt, photo.stock ? "Stock image" : "", photo.credit].filter(Boolean).join(" · ") }));
  return <header className={`event-detail-heading${main ? " has-photo" : ""}`}>
    <div>
      <p className="label">ON THE CALENDAR</p>
      <h1>{name}</h1>
      <p className="event-detail-intro">{description}</p>
    </div>
    {main && <div className="event-hero-media">
      <figure className="event-main-photo">
        <Image src={main.url} alt={main.alt} width={1200} height={900}
          sizes="(max-width: 900px) 85vw, 540px" preload />
        {(main.caption || main.stock || main.credit) && <figcaption>
          {main.caption && <p>{main.caption}</p>}
          {(main.stock || main.credit) && <small>{[main.stock ? "Stock image" : "", main.credit].filter(Boolean).join(" · ")}</small>}
        </figcaption>}
      </figure>
      {photos.length > 1 && <GalleryDrawer photos={gallery} title={name} description="Photos from this event.">
        <button type="button" className="event-gallery-open">Open gallery <span aria-hidden="true">↗</span></button>
      </GalleryDrawer>}
    </div>}
  </header>;
}
