"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary } from "@/components/coastal/live-content";
import { clients as staticClients, type Client } from "@/data/clients";
import { isStockLogo, logoSource } from "./client-strip";
import { LogoBoard } from "./logo-board";

// "Past & present." on the services pages: the clients as a board of big
// logo tiles. Stock white artwork paints as a mask, uploads show as is.
function ClientBoardView({ clients }: { clients: Client[] }) {
  return (
    <LogoBoard
      id="client-board"
      kicker="GOOD COMPANY / SELECTED CLIENTS"
      title={<>Past &amp; <em>present.</em></>}
      label="Client logos"
      pageLabel="clients"
      items={clients.map((client) => {
        const src = logoSource(client.logo);
        return { key: client.name, name: client.name, href: client.url, external: true, ...(isStockLogo(src) ? { mark: src } : { image: src }) };
      })}
    />
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
