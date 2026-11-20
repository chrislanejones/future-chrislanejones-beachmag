import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";

// The password-locked /audio page. The password is the Convex env var
// AUDIO_PAGE_PASSWORD (never in the repo, which is public). Unset means locked
// for everyone. Uploads go through scripts/upload-private-audio.sh.

const track = v.object({ slug: v.string(), title: v.string(), filename: v.string(), url: v.string() });

// Same-length compare that doesn't stop at the first wrong letter.
function matches(given: string, expected: string): boolean {
  let diff = given.length ^ expected.length;
  for (let i = 0; i < Math.max(given.length, expected.length); i++) {
    diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Trade the password for the playlist. A mutation, not a query, so every try
 * spends a rate-limit token. A wrong password returns { ok: false } instead of
 * throwing: a throw would roll the token back and make guessing free.
 */
export const unlock = mutation({
  args: { password: v.string() },
  returns: v.union(
    v.object({ ok: v.literal(true), tracks: v.array(track) }),
    v.object({ ok: v.literal(false), reason: v.union(v.literal("wrong"), v.literal("busy")) }),
  ),
  handler: async (ctx, args) => {
    const limit = await rateLimiter.limit(ctx, "audioUnlockGlobal");
    if (!limit.ok) return { ok: false as const, reason: "busy" as const };
    const expected = process.env.AUDIO_PAGE_PASSWORD;
    if (!expected || !matches(args.password.trim().toLowerCase(), expected.toLowerCase())) {
      return { ok: false as const, reason: "wrong" as const };
    }
    const rows = await ctx.db.query("privateAudio").withIndex("by_order").collect();
    const tracks = [];
    for (const row of rows) {
      const url = await ctx.storage.getUrl(row.storageId);
      if (url) tracks.push({ slug: row.slug, title: row.title, filename: row.filename, url });
    }
    return { ok: true as const, tracks };
  },
});

export const generateUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

/** Add a track, or replace the file behind an existing slug (the old blob is deleted). */
export const setTrack = internalMutation({
  args: { slug: v.string(), title: v.string(), filename: v.string(), storageId: v.id("_storage"), order: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privateAudio")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      if (existing.storageId !== args.storageId) await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("privateAudio", { ...args, updatedAt: Date.now() });
    }
    return null;
  },
});
