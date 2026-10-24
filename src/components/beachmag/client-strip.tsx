"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { clients as staticClients, type Client } from "@/data/clients";
import { TRIMMED_LOGOS } from "./client-logos";
import { LogoStrip } from "./logo-strip";

/** The trimmed copy of a stock logo, or the logo as stored for one added later in the admin. */
export function logoSource(logo: string) {
  const file = decodeURIComponent(logo.split("/").pop() ?? "");
  const trimmed = logo.includes("/client-icons/") ? TRIMMED_LOGOS.get(file) : undefined;
  return trimmed ? `/client-logos/${trimmed}` : logo;
}

/** The stock logos are white artwork (/client-icons, trimmed in /client-logos); anything else came through the admin's Media Manager as a full-color file. */
export function isStockLogo(logo: string) {
  return logo.startsWith("/client-icons/") || logo.startsWith("/client-logos/");
}

/** A client's logo: white artwork as a mask in the page's ink, a full-color upload as is on a light tile (shell.css). */
export function ClientFace({ logo }: { logo: string }) {
  const src = logoSource(logo);
  return isStockLogo(src) ? (
    <span className="client-mark" aria-hidden="true" style={{ "--logo": `url("${src.replace(/"/g, "%22")}")` } as CSSProperties} />
  ) : (
    <span className="client-picture" aria-hidden="true">
      <Image src={src} alt="" fill sizes="200px" />
    </span>
  );
}

// "Past & present.": the client logos, in the admin's order.
function ClientView({ clients }: { clients: Client[] }) {
  return (
    <LogoStrip
      id="client-strip"
      kicker="GOOD COMPANY / SELECTED CLIENTS"
      title="Past & present."
      label="Client logos"
      footer="BUSINESSES, AGENCIES & GOOD PEOPLE."
      items={clients.map((client) => {
        const src = logoSource(client.logo);
        return { key: client.name, name: client.name, href: client.url, external: true, ...(isStockLogo(src) ? { mark: src } : { image: src }) };
      })}
    />
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
