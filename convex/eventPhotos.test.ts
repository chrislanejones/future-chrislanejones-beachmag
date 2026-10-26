/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const owner = "event_photo_test_owner";
const saved = process.env.ADMIN_USER_IDS;
beforeEach(() => { process.env.ADMIN_USER_IDS = owner; });
afterEach(() => { process.env.ADMIN_USER_IDS = saved; });
const photo = { eventSlug: "upcoming-event-2026", url: "https://utfs.io/f/stock.jpg", alt: "Beach at sunrise", caption: "Meet us by the coast", credit: "Jane / Unsplash", stock: true };

test("future-event photos retain stock credits, stay scoped to their event, and can be edited and removed", async () => {
  const t = convexTest(schema, modules);
  const admin = t.withIdentity({ subject: owner });
  const id = await admin.mutation(api.eventPhotos.save, photo);
  await admin.mutation(api.eventPhotos.save, { ...photo, eventSlug: "past-event" });
  expect(await t.query(api.eventPhotos.list, { eventSlug: photo.eventSlug })).toMatchObject([{ ...photo, _id: id }]);
  await admin.mutation(api.eventPhotos.save, { ...photo, id, caption: "Updated caption", stock: false });
  expect(await t.query(api.eventPhotos.list, { eventSlug: photo.eventSlug })).toMatchObject([{ caption: "Updated caption", stock: false, credit: photo.credit }]);
  await admin.mutation(api.eventPhotos.remove, { id });
  expect(await t.query(api.eventPhotos.list, { eventSlug: photo.eventSlug })).toEqual([]);
  expect(await t.query(api.eventPhotos.list, { eventSlug: "past-event" })).toHaveLength(1);
});

test("anonymous visitors and non-owner accounts cannot alter galleries", async () => {
  const t = convexTest(schema, modules);
  const id = await t.withIdentity({ subject: owner }).mutation(api.eventPhotos.save, photo);
  for (const caller of [t, t.withIdentity({ subject: "other_user" })]) {
    await expect(caller.mutation(api.eventPhotos.save, photo)).rejects.toThrow("Unauthorized");
    await expect(caller.mutation(api.eventPhotos.save, { ...photo, id })).rejects.toThrow("Unauthorized");
    await expect(caller.mutation(api.eventPhotos.remove, { id })).rejects.toThrow("Unauthorized");
    await expect(caller.mutation(api.eventPhotos.move, { id, direction: "up" })).rejects.toThrow("Unauthorized");
  }
});

test("reordering stays within its event and remains stable after deletion and addition", async () => {
  const t = convexTest(schema, modules);
  const admin = t.withIdentity({ subject: owner });
  const first = await admin.mutation(api.eventPhotos.save, photo);
  const second = await admin.mutation(api.eventPhotos.save, { ...photo, caption: "Second" });
  await admin.mutation(api.eventPhotos.move, { id: second, direction: "up" });
  expect((await t.query(api.eventPhotos.list, { eventSlug: photo.eventSlug })).map((p) => p._id)).toEqual([second, first]);
  await admin.mutation(api.eventPhotos.remove, { id: second });
  const third = await admin.mutation(api.eventPhotos.save, { ...photo, caption: "Third" });
  await admin.mutation(api.eventPhotos.move, { id: first, direction: "down" });
  expect((await t.query(api.eventPhotos.list, { eventSlug: photo.eventSlug })).map((p) => p._id)).toEqual([third, first]);
});

test("invalid URLs, empty alt text and edits against the wrong event are rejected", async () => {
  const t = convexTest(schema, modules);
  const admin = t.withIdentity({ subject: owner });
  await expect(admin.mutation(api.eventPhotos.save, { ...photo, url: "javascript:alert(1)" })).rejects.toThrow();
  await expect(admin.mutation(api.eventPhotos.save, { ...photo, alt: " " })).rejects.toThrow();
  const id = await admin.mutation(api.eventPhotos.save, photo);
  await expect(admin.mutation(api.eventPhotos.save, { ...photo, id, eventSlug: "another-event" })).rejects.toThrow("Photo not found");
});
