"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { clients as staticClients, type Client } from "@/data/clients";
import { TRIMMED_LOGOS } from "./client-logos";

const GAP = 12;

/** The trimmed copy of a stock logo, or the logo as stored for one added later in the admin. */
function logoSource(logo: string) {
  const file = decodeURIComponent(logo.split("/").pop() ?? "");
  const trimmed = logo.includes("/client-icons/") ? TRIMMED_LOGOS.get(file) : undefined;
  return (trimmed ? `/client-logos/${trimmed}` : logo).replace(/"/g, "%22");
}

// "Past & present.": the client logos in a row that slides a screenful at a
// time. The logos are white artwork, so each one is a mask painted in the
// page's ink (shell.css).
function ClientView({ clients }: { clients: Client[] }) {
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
  }, [clients.length]);

  function move(direction: 1 | -1) {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const step = first.getBoundingClientRect().width + GAP;
    const shown = Math.max(1, Math.floor((element.clientWidth + GAP) / step));
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * step * shown, behavior: instant ? "instant" : "smooth" });
  }

  return (
    <section className="client-strip" aria-labelledby="client-strip-title">
      <div className="client-heading">
        <div>
          <small>GOOD COMPANY / SELECTED CLIENTS</small>
          <h2 id="client-strip-title">Past &amp; present.</h2>
        </div>
        <div className="client-controls">
          <button type="button" aria-label="Previous clients" aria-controls="client-track" disabled={state.atStart} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next clients" aria-controls="client-track" disabled={state.atEnd} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div className="client-track" id="client-track" ref={track} tabIndex={0} role="group" aria-label="Client logos; swipe or use the arrow buttons">
        {clients.map((client) => (
          <a className="client-tile" key={client.name} href={client.url} target="_blank" rel="noopener noreferrer">
            <span className="client-mark" aria-hidden="true" style={{ "--logo": `url("${logoSource(client.logo)}")` } as CSSProperties} />
            <span className="client-name">{client.name}<span className="sr-only"> (opens in a new tab)</span></span>
          </a>
        ))}
      </div>
      <div className="client-footer">
        <span>BUSINESSES, AGENCIES &amp; GOOD PEOPLE.</span>
        <span role="status" aria-live="polite">{state.label}</span>
      </div>
    </section>
  );
}

function LiveClients() {
  const clients = useQuery(api.clients.getAll);
  return <ClientView clients={clients?.length ? clients : staticClients} />;
}

export function ClientStrip() {
  return (
    <ContentBoundary fallback={<ClientView clients={staticClients} />}>
      <LiveClients />
    </ContentBoundary>
  );
}
