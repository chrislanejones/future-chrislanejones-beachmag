import Image from "next/image";
import Link from "next/link";
import { ArchiveHero, ArchiveLayout } from "@/components/beachmag/interior-parts";
import { ConferenceTile } from "@/components/beachmag/conference-tile";
import { conferenceDates, conferenceHref, type Conference } from "@/lib/conferences";
import { conferencePhotos } from "@/data/conference-photos";
import { GalleryPanel } from "@/components/coastal/gallery-panel";
import { jsonLd } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/structured-data";

function descriptionLinks(text: string) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    return link ? <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a> : part;
  });
}

export default function ConferenceDetailPage({ conference: conf, conferences }: { conference: Conference; conferences: Conference[] }) {
  const photos = conferencePhotos[conf.slug] ?? [];
  const isPersonalPhoto = conf.slug === "echo-conference-2013";
  const photoTitle = isPersonalPhoto ? "Me along the way." : "People along the way.";
  const photoDescription = isPersonalPhoto ? "Camera in hand at Echo Conference 2013." : `A few familiar faces from ${conf.name}.`;
  const related = conferences.filter((item) => item.slug !== conf.slug).sort((a, b) =>
    Number(b.name === conf.name) - Number(a.name === conf.name) || Number(b.year === conf.year) - Number(a.year === conf.year),
  ).slice(0, 2);
  const index = conferences.findIndex((item) => item._id === conf._id);
  const newer = conferences[index - 1];
  const older = conferences[index + 1];
  const schema = {
    "@context": "https://schema.org", "@type": "Event",
    name: `${conf.name} ${conf.year}`, description: conf.description,
    startDate: conf.dateStart, endDate: conf.dateEnd,
    image: conf.logo ? (conf.logo.startsWith("/") ? `${SITE_URL}${conf.logo}` : conf.logo) : undefined,
    location: conf.city ? { "@type": "Place", name: conf.venue ?? conf.city, address: conf.city } : undefined,
    url: conf.url,
  };

  const sections = [
    { id: "about-the-conference", label: "About the conference" },
    ...(photos.length ? [{ id: "conference-photos", label: photoTitle.replace(/\.$/, "") }] : []),
    ...(related.length ? [{ id: "related-conferences", label: "More from the trail" }] : []),
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <ArchiveHero
        crumbs={[{ href: "/", label: "Home" }, { href: "/conferences", label: "Conferences" }, { href: `/conferences/${conf.year}`, label: String(conf.year) }, { label: conf.name }]}
        kicker="CONFERENCES / CHRIS LANE JONES"
        title={`${conf.name} ${conf.year}`}
        intro={`${conferenceDates(conf)}${conf.city ? ` · ${conf.city}` : ""}`}
        path="/conferences"
      />
      <ArchiveLayout index={sections}>
        {conf.logo && (
          <p className="conference-logo">
            <Image src={conf.logo} alt={conf.logoAlt ?? `${conf.name} logo`} width={640} height={360} sizes="(max-width: 640px) 90vw, 640px" priority />
          </p>
        )}
        <h2 id="about-the-conference">About the conference</h2>
        {conf.description?.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{descriptionLinks(paragraph)}</p>)}
        <p><strong>{conf.dateStart ? "When" : "Year"}:</strong> {conferenceDates(conf)}</p>
        {conf.city && <p><strong>Where:</strong> {conf.city}</p>}
        {conf.venue && <p><strong>Venue:</strong> {conf.venue}</p>}
        {conf.tags?.length ? <ul aria-label="Conference topics">{conf.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
        {conf.url && (
          <p>
            <a className="action-link" href={conf.url} target="_blank" rel="noopener noreferrer">
              Conference website <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
        {photos.length > 0 && (
          <section aria-labelledby="conference-photos">
            <h2 id="conference-photos">{photoTitle}</h2>
            <p>{photoDescription}</p>
            <GalleryPanel photos={photos} title={isPersonalPhoto ? photoTitle : "Conference photos"} description={isPersonalPhoto ? photoDescription : "People I’ve met along the way."} label="Open conference photo gallery" />
            {photos.map((photo) => (
              <figure key={photo.src} className="conference-photo">
                <Image src={photo.src} alt={photo.alt} width={1200} height={800} sizes="(max-width: 640px) 90vw, 900px" />
                <figcaption>{photo.description}</figcaption>
              </figure>
            ))}
          </section>
        )}
        {related.length > 0 && (
          <section aria-labelledby="related-conferences">
            <h2 id="related-conferences">More from the trail.</h2>
            <div className="resource-grid">{related.map((item) => <ConferenceTile key={item._id} conference={item} />)}</div>
          </section>
        )}
        <nav className="work-actions conference-pager" aria-label="Browse conferences">
          {newer ? <Link href={conferenceHref(newer)}>← Newer: {newer.name} {newer.year}</Link> : <span />}
          {older && <Link href={conferenceHref(older)}>Earlier: {older.name} {older.year} →</Link>}
        </nav>
      </ArchiveLayout>
    </>
  );
}
