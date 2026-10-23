"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

const GAP = 12;

export type StripItem = {
  key: string;
  name: string;
  href: string;
  /** White artwork painted as a mask in the page's ink (client logos). */
  mark?: string;
  /** A full-color logo shown as is, on a light tile (conference logos). */
  image?: string;
  external?: boolean;
};

// A row of logo tiles that slides a screenful at a time, with the radio's
// sage arrow keys: "Past & present." on the homepage, the conference trail
// on About. Styles: shell.css (.client-*).
export function LogoStrip({ id, kicker, title, items, footer, label }: {
  id: string;
  kicker: string;
  title: string;
  items: StripItem[];
  footer: string;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ atStart: true, atEnd: false, label: "" });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const first = element.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.getBoundingClientRect().width + GAP;
      const start = Math.round(element.scrollLeft / step);
      const shown = Math.max(1, Math.floor((element.clientWidth + GAP) / step));
      const count = element.children.length;
      setState({
        atStart: element.scrollLeft < 2,
        atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 3,
        label: `${start + 1}–${Math.min(count, start + shown)} / ${count}`,
      });
    };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      resize.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [items.length]);

  function move(direction: 1 | -1) {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const step = first.getBoundingClientRect().width + GAP;
    const shown = Math.max(1, Math.floor((element.clientWidth + GAP) / step));
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * step * shown, behavior: instant ? "instant" : "smooth" });
  }

  const trackId = `${id}-track`;
  return (
    <section className="client-strip" aria-labelledby={`${id}-title`}>
      <div className="client-heading">
        <div>
          <small>{kicker}</small>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        <div className="client-controls">
          <button type="button" aria-label="Previous" aria-controls={trackId} disabled={state.atStart} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next" aria-controls={trackId} disabled={state.atEnd} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div className="client-track" id={trackId} ref={track} tabIndex={0} role="group" aria-label={`${label}; swipe or use the arrow buttons`}>
        {items.map((item) => {
          const face = item.image ? (
            <span className="client-picture" aria-hidden="true">
              <Image src={item.image} alt="" fill sizes="200px" />
            </span>
          ) : (
            <span className="client-mark" aria-hidden="true" style={{ "--logo": `url("${(item.mark ?? "").replace(/"/g, "%22")}")` } as CSSProperties} />
          );
          const name = <span className="client-name">{item.name}{item.external && <span className="sr-only"> (opens in a new tab)</span>}</span>;
          return item.external ? (
            <a className="client-tile" key={item.key} href={item.href} target="_blank" rel="noopener noreferrer">{face}{name}</a>
          ) : (
            <Link className="client-tile" key={item.key} href={item.href}>{face}{name}</Link>
          );
        })}
      </div>
      <div className="client-footer">
        <span>{footer}</span>
        <span role="status" aria-live="polite">{state.label}</span>
      </div>
    </section>
  );
}
