import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Streams the resume out of Convex storage under a readable filename. The
// files are not in /public on purpose — see convex/resume.ts.

const CONTENT_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;
  if (kind !== "pdf" && kind !== "docx") {
    return new Response("Not found", { status: 404 });
  }

  const file = await convex.query(api.resume.getDownload, { kind }).catch(() => undefined);
  if (file === undefined) return new Response("Resume unavailable", { status: 503 });
  if (!file) return new Response("Not found", { status: 404 });

  // The URL is admin-set, but the server still only fetches from UploadThing or Convex storage.
  let host = "";
  try {
    host = new URL(file.url).hostname;
  } catch {
    return new Response("Resume unavailable", { status: 502 });
  }
  if (!/^(utfs\.io|[a-z0-9-]+\.ufs\.sh|[a-z0-9-]+\.convex\.cloud)$/i.test(host)) {
    return new Response("Resume unavailable", { status: 502 });
  }
  const upstream = await fetch(file.url, { signal: AbortSignal.timeout(15_000) });
  if (!upstream.ok || !upstream.body) {
    return new Response("Resume unavailable", { status: 502 });
  }

  // PDF opens in the browser tab; Word downloads.
  const disposition = kind === "pdf" ? "inline" : "attachment";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": CONTENT_TYPES[kind],
      "Content-Disposition": `${disposition}; filename="${file.filename}"`,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
