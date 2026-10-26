"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Calendar, Edit2, ExternalLink, Image as ImageIcon, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { HOME_EVENTS, eventHref, type HomeEvent } from "@/components/beachmag/events";
import { MediaDrawer } from "../components/MediaDrawer";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { SuccessDisplay } from "../components/SuccessDisplay";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const blank = { url: "", alt: "", caption: "", credit: "", stock: false };
const eventsByDate = [...HOME_EVENTS].sort((a, b) => b.start.localeCompare(a.start));
const eventDate = (event: HomeEvent) => new Date(`${event.start}Z`).toLocaleDateString("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

function EventPhotoEditor({ event }: { event: HomeEvent }) {
  const photos = useQuery(api.eventPhotos.list, { eventSlug: event.slug });
  const mainPhoto = photos?.[0];
  const additionalPhotos = photos?.slice(1) ?? [];
  const save = useMutation(api.eventPhotos.save);
  const remove = useMutation(api.eventPhotos.remove);
  const move = useMutation(api.eventPhotos.move);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState<Doc<"eventPhotos">["_id"]>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [removing, setRemoving] = useState<Doc<"eventPhotos">["_id"]>();
  const editingMain = editing ? editing === mainPhoto?._id : !mainPhoto;
  const photoLabel = editingMain ? "Main Photo" : "Additional Photo";
  const reset = () => { setDraft(blank); setEditing(undefined); setEditorOpen(false); };
  const addPhoto = () => { reset(); setEditorOpen(true); setMessage(""); setError(null); };

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setMessage(""); setError(null);
    try { await action(); setMessage(success); }
    catch (err) { setError(err instanceof Error ? err : new Error("Could not save. Please try again.")); }
    finally { setBusy(false); }
  }

  const renderPhoto = (photo: Doc<"eventPhotos">, index: number) => (<div key={photo._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-(--color-border) p-4">
          <div className="relative h-24 w-28 shrink-0 rounded-lg overflow-hidden bg-(--color-muted-accent)"><Image src={photo.url} alt={photo.alt} fill sizes="112px" className="object-contain p-1" /></div>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink break-words">{photo.caption || photo.alt}</p><p className="mt-1 text-xs text-muted">{[photo.stock ? "Stock image" : "", photo.credit].filter(Boolean).join(" · ")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => { setEditing(photo._id); setEditorOpen(true); setDraft({ url: photo.url, alt: photo.alt, caption: photo.caption, credit: photo.credit, stock: photo.stock }); setMessage(""); setError(null); }} aria-label={index === 0 ? "Edit Main Photo" : `Edit additional photo ${index}`}><Edit2 className="w-4 h-4" />Edit</Button>
              {index > 0 && <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void run(async () => {
                for (let step = 0; step < index; step++) await move({ id: photo._id, direction: "up" });
              }, "Main photo updated.")}>Make Main Photo</Button>}
              {index > 0 && <Button type="button" variant="secondary" size="icon-sm" aria-label={`Move additional photo ${index} earlier`} disabled={busy || index === 1} onClick={() => void run(() => move({ id: photo._id, direction: "up" }), "Gallery order updated.")}><ArrowUp className="w-4 h-4" /></Button>}
              {index > 0 && <Button type="button" variant="secondary" size="icon-sm" aria-label={`Move additional photo ${index} later`} disabled={busy || index === (photos?.length ?? 0) - 1} onClick={() => void run(() => move({ id: photo._id, direction: "down" }), "Gallery order updated.")}><ArrowDown className="w-4 h-4" /></Button>}
              <Button type="button" variant="secondary" size="icon-sm" aria-label={`Remove photo ${index + 1}`} className="text-(--color-danger) hover:text-(--color-danger) hover:bg-red-500/10" disabled={busy} onClick={() => setRemoving(photo._id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>);

  return <section aria-label="Event details" className="min-w-0 lg:col-span-2 bg-(--color-panel) border border-(--color-border) rounded-2xl overflow-hidden flex flex-col">
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-(--color-muted-accent) shrink-0">
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-ink" title={event.name}>{event.name}</h2>
        <p className="mt-1 text-sm text-muted flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0" />{event.venue ?? "Location to be announced"}</p>
        <p className="mt-1 text-xs text-muted">{eventDate(event)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {editorOpen ? <>
          <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={reset}>Cancel</Button>
          <Button type="submit" form="event-photo-form" variant="primary" size="sm" disabled={busy || !draft.url}><Save className="w-4 h-4" />{busy ? "Saving…" : "Save"}</Button>
        </> : <Button type="button" variant="primary" size="sm" disabled={busy || photos === undefined} onClick={addPhoto}><Plus className="w-4 h-4" />{mainPhoto ? "Add Gallery Photo" : "Add Main Photo"}</Button>}
        <Link href={eventHref(event)} target="_blank" rel="noopener noreferrer" aria-label="View event page" title="View event page" className="p-2 text-muted hover:text-ink transition rounded-lg hover:bg-(--color-muted-accent) focus-ring"><ExternalLink className="w-4 h-4" /></Link>
      </div>
    </div>
    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto p-6 space-y-6">
      {message && <div role="status"><SuccessDisplay message={message} onDismiss={() => setMessage("")} compact /></div>}
      {error && <div role="alert"><ErrorDisplay error={error} onDismiss={() => setError(null)} compact /></div>}
      {editorOpen && <form id="event-photo-form" onSubmit={(e) => {
        e.preventDefault();
        void run(async () => { await save({ ...draft, id: editing, eventSlug: event.slug }); reset(); }, "Photo saved to the event page.");
      }}>
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <div><h3 className="font-semibold text-ink">{`${editing ? "Edit" : "New"} ${photoLabel}`}</h3><p className="mt-1 text-sm text-muted">{editingMain ? "The main photo appears in the event page header. Saving publishes it." : "Add photos before or after the event. Saving publishes them in its gallery."}</p></div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-ink">{photoLabel}</Label>
            <button type="button" onClick={() => setDrawer(true)} className={`relative w-full h-48 rounded-xl bg-(--color-muted-accent) flex items-center justify-center transition-all focus-ring ${draft.url ? "border border-(--color-border) overflow-hidden group" : "border-2 border-dashed border-(--color-border) hover:border-accent hover:bg-accent/5"}`}>
              {draft.url ? <>
                <Image src={draft.url} alt={draft.alt || "Selected photo preview"} fill sizes="(max-width: 1024px) 90vw, 600px" className="object-contain p-4" />
                <span className="absolute bottom-3 rounded-lg bg-(--color-panel) px-3 py-2 text-sm font-medium text-ink border border-(--color-border)">Change Image</span>
              </> : <span className="flex flex-col items-center gap-2 text-muted"><ImageIcon className="w-8 h-8" /><span className="text-sm">Select Photo from Media Library</span></span>}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="event-photo-alt" className="block text-sm font-medium text-ink">Image Description <span className="text-(--color-danger)">*</span></Label><Input id="event-photo-alt" required maxLength={500} placeholder="Describe the image for screen readers" value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="event-photo-credit" className="block text-sm font-medium text-ink">Photographer / Source Credit</Label><Input id="event-photo-credit" maxLength={500} placeholder="e.g. Jane Smith / Unsplash" value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="event-photo-caption" className="block text-sm font-medium text-ink">Caption</Label><Textarea id="event-photo-caption" rows={3} maxLength={2000} placeholder="A little context for this photo" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} /></div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-(--color-border) p-4"><div><Label htmlFor="event-photo-stock" className="text-sm font-medium text-ink">Stock Image</Label><p className="mt-1 text-xs text-muted">Show a stock-image label alongside the credit.</p></div><Switch id="event-photo-stock" checked={draft.stock} onCheckedChange={(stock) => setDraft({ ...draft, stock })} /></div>
        </fieldset>
      </form>}
      <section aria-label="Main Photo" className="space-y-4">
        <h3 className="font-semibold text-ink">Main Photo</h3>
        <p className="text-sm text-muted">Shown in the event page header.</p>
        {photos === undefined ? <p role="status">Loading photos…</p> : mainPhoto ? renderPhoto(mainPhoto, 0) : <div className="py-8 text-center text-muted">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No main photo yet.</p>
          {!editorOpen && <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={addPhoto}>Add Main Photo</Button>}
        </div>}
      </section>
      <section aria-label="Photo Gallery (Additional Photos)" className="border-t border-(--color-border) pt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink">Photo Gallery (Additional Photos)</h3><span className="text-xs text-muted">{photos ? `${additionalPhotos.length} ${additionalPhotos.length === 1 ? "photo" : "photos"}` : "Loading…"}</span></div>
        <p className="text-sm text-muted">Additional photos appear in the gallery opened below the main photo.</p>
        {photos !== undefined && !additionalPhotos.length && <p className="text-sm text-muted">No additional photos yet.</p>}
        {additionalPhotos.map((photo, index) => renderPhoto(photo, index + 1))}
        {mainPhoto && !editorOpen && <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={addPhoto}><Plus className="w-4 h-4" />Add Gallery Photo</Button>}
      </section>
    </div>
    <ConfirmDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(undefined)} title="Remove Event Photo?" description={removing === mainPhoto?._id && additionalPhotos.length ? "The next gallery photo will become the main photo. The original file stays in your media library." : "This removes the photo from this event. The original file stays in your media library."} confirmLabel="Remove Photo" onConfirm={async () => {
      if (!removing) return;
      await run(async () => { await remove({ id: removing }); if (editing === removing) reset(); setRemoving(undefined); }, "Photo removed from this event.");
    }} />
    <MediaDrawer isOpen={drawer} onClose={() => setDrawer(false)} onSelect={(url) => { setDraft({ ...draft, url }); setDrawer(false); }} title="Select Event Photo" description="Choose an image from your media library or upload a new one, including stock images." />
  </section>;
}

export default function EventsTab() {
  const [slug, setSlug] = useState(HOME_EVENTS[0].slug);
  const event = HOME_EVENTS.find((item) => item.slug === slug)!;
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full">
    <section aria-label="Event list" className="min-w-0 bg-(--color-panel) border border-(--color-border) rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-(--color-ink)">Events</h3><span className="text-xs text-muted">{HOME_EVENTS.length} events</span></div>
      <p className="text-xs text-muted mb-3">Sorted by date, most recent first</p>
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-64 lg:max-h-none">
        {eventsByDate.map((item) => <button type="button" key={item.slug} onClick={() => setSlug(item.slug)} aria-pressed={slug === item.slug} className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg transition-all border border-transparent focus-ring ${slug === item.slug ? "bg-(--color-foreground) text-(--color-panel)" : "bg-(--color-muted-accent) hover:bg-(--color-surface-hover) text-(--color-ink)"}`}>
          <span className="w-8 h-8 shrink-0 rounded bg-(--color-border) flex items-center justify-center text-(--color-ink)"><Calendar className="w-4 h-4 opacity-50" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate" title={item.name}>{item.name}</span><span className={`block text-xs truncate ${slug === item.slug ? "" : "text-muted"}`}>{eventDate(item)}</span></span>
        </button>)}
      </div>
    </section>
    <EventPhotoEditor key={slug} event={event} />
  </div>;
}
