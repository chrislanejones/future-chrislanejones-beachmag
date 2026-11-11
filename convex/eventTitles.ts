import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";

// An event's titles, edited in the admin. The code keeps the defaults; a row
// here wins for that event. `series` is the recurring meetup ("AI Connect Jax",
// "" for a one-off) and `name` is this event's own title (the month's talk).
// Titles are public, like the events they belong to.

const SLUG = /^[a-z0-9-]{1,160}$/;
export const SERIES_MAX = 80;
export const NAME_MAX = 200;

export const list = query({
  args: {},
  handler: (ctx) => ctx.db.query("eventTitles").take(500),
});

export const get = query({
  args: { eventSlug: v.string() },
  handler: (ctx, { eventSlug }) => ctx.db.query("eventTitles")
    .withIndex("by_eventSlug", (q) => q.eq("eventSlug", eventSlug)).unique(),
});

export const save = mutation({
  args: { eventSlug: v.string(), series: v.string(), name: v.string() },
  handler: async (ctx, { eventSlug, series, name }) => {
    await requireAdmin(ctx);
    if (!SLUG.test(eventSlug)) throw new ConvexError("Invalid event.");
    const titles = { eventSlug, series: series.trim(), name: name.trim() };
    if (!titles.name || titles.name.length > NAME_MAX || titles.series.length > SERIES_MAX) {
      throw new ConvexError(`Give the event a title (up to ${NAME_MAX} characters); the series is optional (up to ${SERIES_MAX}).`);
    }
    const existing = await ctx.db.query("eventTitles")
      .withIndex("by_eventSlug", (q) => q.eq("eventSlug", eventSlug)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, titles);
      return existing._id;
    }
    return ctx.db.insert("eventTitles", titles);
  },
});

/** Back to the titles in the code. */
export const reset = mutation({
  args: { eventSlug: v.string() },
  handler: async (ctx, { eventSlug }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("eventTitles")
      .withIndex("by_eventSlug", (q) => q.eq("eventSlug", eventSlug)).unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
