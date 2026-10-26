import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";
import { assertStoredUrl } from "./storedUrls";

// Event galleries are public. Media-library rows and draft blog data stay private.
export const list = query({
  args: { eventSlug: v.string() },
  handler: (ctx, { eventSlug }) => ctx.db.query("eventPhotos")
    .withIndex("by_eventSlug_and_order", (q) => q.eq("eventSlug", eventSlug)).take(60),
});

export const save = mutation({
  args: {
    id: v.optional(v.id("eventPhotos")), eventSlug: v.string(), url: v.string(),
    alt: v.string(), caption: v.string(), credit: v.string(), stock: v.boolean(),
  },
  handler: async (ctx, { id, ...photo }) => {
    await requireAdmin(ctx);
    if (!/^[a-z0-9-]{1,160}$/.test(photo.eventSlug)) throw new ConvexError("Invalid event.");
    assertStoredUrl(photo.url, { allowRelative: true });
    photo.alt = photo.alt.trim();
    photo.caption = photo.caption.trim();
    photo.credit = photo.credit.trim();
    if (!photo.alt || photo.alt.length > 500 || photo.caption.length > 2000 || photo.credit.length > 500) {
      throw new ConvexError("Add a short image description (up to 500 characters), caption (up to 2,000), and credit (up to 500).");
    }
    if (id) {
      const existing = await ctx.db.get(id);
      if (!existing || existing.eventSlug !== photo.eventSlug) throw new ConvexError("Photo not found for this event.");
      await ctx.db.patch(id, photo);
      return id;
    }
    const photos = await ctx.db.query("eventPhotos")
      .withIndex("by_eventSlug_and_order", (q) => q.eq("eventSlug", photo.eventSlug)).take(60);
    if (photos.length >= 60) throw new ConvexError("This event already has 60 photos.");
    return ctx.db.insert("eventPhotos", { ...photo, order: (photos.at(-1)?.order ?? -1) + 1 });
  },
});

export const remove = mutation({
  args: { id: v.id("eventPhotos") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const move = mutation({
  args: { id: v.id("eventPhotos"), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, { id, direction }) => {
    await requireAdmin(ctx);
    const photo = await ctx.db.get(id);
    if (!photo) throw new ConvexError("Photo not found.");
    const photos = await ctx.db.query("eventPhotos")
      .withIndex("by_eventSlug_and_order", (q) => q.eq("eventSlug", photo.eventSlug)).take(60);
    const index = photos.findIndex((item) => item._id === id);
    const neighbor = photos[index + (direction === "up" ? -1 : 1)];
    if (!neighbor) return;
    await ctx.db.patch(id, { order: neighbor.order });
    await ctx.db.patch(neighbor._id, { order: photo.order });
  },
});
