"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StripItem } from "./logo-strip";

const GAP = 18;

// A board of big logo tiles, four across and two down, paged with the silver
// keys and dots: "Past & present." on the services pages, the conference
// trail on About. Styles: shell.css (.client-board).
export function LogoBoard({ id, kicker, title, items, label, pageLabel }: {
  id: string;
  kicker: string;
  title: ReactNode;
  items: StripItem[];
  /** The track's name for screen readers, e.g. "Client logos". */
  label: string;
  /** What a page holds, for the arrows and dots, e.g. "clients". */
  pageLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  // Pages are track-widths: four columns on wide screens, two on phones.
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const width = element.clientWidth + GAP;
      setPage(Math.round(element.scrollLeft / width));
      setPages(Math.max(1, Math.round((element.scrollWidth + GAP) / width)));
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      resize.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [items.length]);

  function go(to: number) {
    const element = track.current;
    if (!element) return;
    const target = Math.max(0, Math.min(pages - 1, to));
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ left: target * (element.clientWidth + GAP), behavior: instant ? "instant" : "smooth" });
  }

  const trackId = `${id}-track`;
  return (
    <section className="client-board" aria-labelledby={`${id}-title`}>
      <div className="client-board-head">
        <div>
          <p className="page-kicker">{kicker}</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        <div className="client-controls">
          <button type="button" aria-label={`Previous ${pageLabel}`} aria-controls={trackId} disabled={page === 0} onClick={() => go(page - 1)}>←</button>
          <button type="button" aria-label={`Next ${pageLabel}`} aria-controls={trackId} disabled={page >= pages - 1} onClick={() => go(page + 1)}>→</button>
        </div>
      </div>
      <div className="client-board-track" id={trackId} ref={track} tabIndex={0} role="group" aria-label={`${label}; swipe or use the arrow buttons`}>
        {items.map((item) => {
          const face = item.image ? (
            <span className="client-picture" aria-hidden="true">
              <Image src={item.image} alt="" fill sizes="(max-width: 760px) 45vw, 260px" />
            </span>
          ) : (
            <span className="client-mark" aria-hidden="true" style={{ "--logo": `url("${(item.mark ?? "").replace(/"/g, "%22")}")` } as CSSProperties} />
          );
          const name = <span className="client-name">{item.name}{item.external && <span className="sr-only"> (opens in a new tab)</span>}</span>;
          return item.external ? (
            <a className="client-board-tile" key={item.key} href={item.href} target="_blank" rel="noopener noreferrer">{face}{name}</a>
          ) : (
            <Link className="client-board-tile" key={item.key} href={item.href}>{face}{name}</Link>
          );
        })}
      </div>
      <div className="client-board-dots" role="group" aria-label={`${pageLabel[0].toUpperCase()}${pageLabel.slice(1)} pages`}>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" aria-label={`Page ${i + 1} of ${pages}`} aria-current={i === page || undefined} onClick={() => go(i)} />
        ))}
      </div>
    </section>
  );
}
