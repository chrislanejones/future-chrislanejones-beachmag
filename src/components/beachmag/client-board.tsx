"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { clients as staticClients, type Client } from "@/data/clients";
import { ClientFace } from "./client-strip";

const COLUMNS = 4;
const GAP = 18;

// "Past & present." on the services pages: the clients as a board of big
// logo tiles, four across and two down, paged with the silver keys and dots.
// Each logo renders through ClientFace: stock white artwork as a mask, uploads as is.
// Styles: shell.css (.client-board).
function ClientBoardView({ clients }: { clients: Client[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(Math.ceil(clients.length / 2) / COLUMNS));

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setPage(Math.round(element.scrollLeft / (element.clientWidth + GAP)));
    element.addEventListener("scroll", update, { passive: true });
    return () => element.removeEventListener("scroll", update);
  }, []);

  function go(to: number) {
    const element = track.current;
    if (!element) return;
    const target = Math.max(0, Math.min(pages - 1, to));
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ left: target * (element.clientWidth + GAP), behavior: instant ? "instant" : "smooth" });
  }

  return (
    <section className="client-board" aria-labelledby="client-board-title">
      <div className="client-board-head">
        <div>
          <p className="page-kicker">GOOD COMPANY / SELECTED CLIENTS</p>
          <h2 id="client-board-title">Past &amp; <em>present.</em></h2>
        </div>
        <div className="client-controls">
          <button type="button" aria-label="Previous clients" aria-controls="client-board-track" disabled={page === 0} onClick={() => go(page - 1)}>←</button>
          <button type="button" aria-label="Next clients" aria-controls="client-board-track" disabled={page >= pages - 1} onClick={() => go(page + 1)}>→</button>
        </div>
      </div>
      <div className="client-board-track" id="client-board-track" ref={track} tabIndex={0} role="group" aria-label="Client logos; swipe or use the arrow buttons">
        {clients.map((client) => (
          <a className="client-board-tile" key={client.name} href={client.url} target="_blank" rel="noopener noreferrer">
            <ClientFace logo={client.logo} />
            <span className="client-name">{client.name}<span className="sr-only"> (opens in a new tab)</span></span>
          </a>
        ))}
      </div>
      <div className="client-board-dots" role="group" aria-label="Client pages">
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" aria-label={`Page ${i + 1} of ${pages}`} aria-current={i === page || undefined} onClick={() => go(i)} />
        ))}
      </div>
    </section>
  );
}

function LiveClientBoard() {
  const clients = useQuery(api.clients.getAll);
  return <ClientBoardView clients={clients?.length ? clients : staticClients} />;
}

export function ClientBoard() {
  return (
    <ContentBoundary fallback={<ClientBoardView clients={staticClients} />}>
      <LiveClientBoard />
    </ContentBoundary>
  );
}
