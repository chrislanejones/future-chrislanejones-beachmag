"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { HOME_EVENTS, eventHref, type HomeEvent } from "@/components/beachmag/events";
import { MediaDrawer } from "../components/MediaDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const blank = { url: "", alt: "", caption: "", credit: "", stock: false };

function EventPhotoEditor({ event }: { event: HomeEvent }) {
  const photos = useQuery(api.eventPhotos.list, { eventSlug: event.slug });
  const save = useMutation(api.eventPhotos.save);
  const remove = useMutation(api.eventPhotos.remove);
  const move = useMutation(api.eventPhotos.move);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState<Doc<"eventPhotos">["_id"]>();
  const [drawer, setDrawer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<Doc<"eventPhotos">["_id"]>();
  const reset = () => { setDraft(blank); setEditing(undefined); };
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setMessage(""); setError("");
    try { await action(); setMessage(success); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="rounded-lg border border-border p-5">
      <h2 className="text-xl font-semibold">{event.name}</h2>
      <p className="mt-2 text-sm">{event.start.slice(0, 10)} · {event.place}</p>
      <Link className="mt-3 inline-block underline" href={eventHref(event)} target="_blank">View event page ↗</Link>
    </div>
    <form className="space-y-4 rounded-lg border border-border p-5" onSubmit={(e) => {
      e.preventDefault();
      void run(async () => { await save({ ...draft, id: editing, eventSlug: event.slug }); reset(); }, "Photo saved to the event page.");
    }}>
      <h3 className="text-lg font-semibold">{editing ? "Edit photo" : "Add a photo"}</h3>
      <p className="text-sm text-muted">Upload your own photo or a stock image through the media library. Photos can be added before or after an event. Saving publishes them on the event page.</p>
      <Button type="button" variant="secondary" disabled={busy} onClick={() => setDrawer(true)}>{draft.url ? "Change image" : "Upload or choose image"}</Button>
      {draft.url && <Image src={draft.url} alt={draft.alt || "Selected photo preview"} width={400} height={260} className="max-h-64 w-auto max-w-full object-contain" />}
      <div className="space-y-2"><Label htmlFor="event-photo-alt">Image description (alt text)</Label><Input id="event-photo-alt" required maxLength={500} value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="event-photo-caption">Caption</Label><Input id="event-photo-caption" maxLength={2000} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="event-photo-credit">Photographer / source credit</Label><Input id="event-photo-credit" maxLength={500} placeholder="e.g. Jane Smith / Unsplash" value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} /></div>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.checked })} />Stock image — show a label in the gallery</label>
      <div className="flex gap-3"><Button type="submit" disabled={busy || !draft.url}>{busy ? "Saving…" : "Save photo"}</Button>{editing && <Button type="button" variant="secondary" disabled={busy} onClick={reset}>Cancel edit</Button>}</div>
    </form>
    {message && <p role="status">{message}</p>}{error && <p role="alert" className="text-danger">{error}</p>}
    <section className="space-y-4" aria-label="Saved photos"><h3 className="text-lg font-semibold">Gallery order</h3>
      {photos === undefined ? <p>Loading photos…</p> : !photos.length ? <p>No photos yet. Add the first one above.</p> : photos.map((photo, index) => <div key={photo._id} className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
        <Image src={photo.url} alt={photo.alt} width={160} height={120} className="h-28 w-36 object-contain" />
        <div className="min-w-0 flex-1"><p>{photo.caption || photo.alt}</p><p className="text-sm text-muted">{[photo.stock ? "Stock image" : "", photo.credit].filter(Boolean).join(" · ")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={busy} onClick={() => { setEditing(photo._id); setDraft({ url: photo.url, alt: photo.alt, caption: photo.caption, credit: photo.credit, stock: photo.stock }); setMessage(""); }}>Edit</Button>
            <Button type="button" variant="secondary" aria-label={`Move photo ${index + 1} earlier`} disabled={busy || index === 0} onClick={() => void run(() => move({ id: photo._id, direction: "up" }), "Gallery order updated.")}>↑</Button>
            <Button type="button" variant="secondary" aria-label={`Move photo ${index + 1} later`} disabled={busy || index === photos.length - 1} onClick={() => void run(() => move({ id: photo._id, direction: "down" }), "Gallery order updated.")}>↓</Button>
            <Button type="button" variant="secondary" disabled={busy} onClick={() => setRemoving(photo._id)}>Remove</Button>
          </div>
          {removing === photo._id && <div className="mt-3 flex flex-wrap items-center gap-3"><p className="text-sm">Remove from this event? The media file stays in your library.</p><Button type="button" disabled={busy} onClick={() => void run(async () => { await remove({ id: photo._id }); setRemoving(undefined); if (editing === photo._id) reset(); }, "Photo removed from this event.")}>Remove photo</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => setRemoving(undefined)}>Keep photo</Button></div>}
        </div>
      </div>)}
    </section>
    <MediaDrawer isOpen={drawer} onClose={() => setDrawer(false)} onSelect={(url) => { setDraft({ ...draft, url }); setDrawer(false); }} title="Event photo" description="Upload or select a photo for this event, including stock images." />
  </div>;
}

export default function EventsTab() {
  const [slug, setSlug] = useState(HOME_EVENTS[0].slug);
  const event = HOME_EVENTS.find((item) => item.slug === slug)!;
  return <div className="mx-auto max-w-4xl space-y-6">
    <div><h2 className="text-2xl font-semibold">Event photos</h2><p className="mt-2 text-muted">Manage galleries for every event, past and upcoming.</p></div>
    <div className="space-y-2"><Label htmlFor="event-select">Choose an event</Label><select id="event-select" className="w-full rounded-md border border-border bg-panel p-3 text-ink" value={slug} onChange={(e) => setSlug(e.target.value)}>{HOME_EVENTS.map((item) => <option key={item.slug} value={item.slug}>{item.start.slice(0, 10)} — {item.name}</option>)}</select></div>
    <EventPhotoEditor key={slug} event={event} />
  </div>;
}
