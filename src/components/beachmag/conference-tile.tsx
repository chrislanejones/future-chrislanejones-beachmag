import Image from "next/image";
import Link from "next/link";
import { conferenceDates, conferenceHref, type Conference } from "@/lib/conferences";

/** A description's first paragraph, with [text](url) links reduced to their text. */
export function conferenceSummary(conference: Conference) {
  return (conference.description ?? "").split(/\n\s*\n/)[0].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/** One conference as the design's resource tile: dates, logo, name, first paragraph. */
export function ConferenceTile({ conference, priority = false }: { conference: Conference; priority?: boolean }) {
  return (
    <Link className="resource-tile" href={conferenceHref(conference)}>
      <small>{conferenceDates(conference)}</small>
      {conference.logo && (
        <span className="tile-logo">
          <Image src={conference.logo} alt={conference.logoAlt ?? `${conference.name} logo`} fill sizes="(max-width: 640px) 90vw, 560px" priority={priority} />
        </span>
      )}
      <strong>{conference.name} <span aria-hidden="true">↗</span></strong>
      {conference.description && <p>{conferenceSummary(conference)}</p>}
    </Link>
  );
}
