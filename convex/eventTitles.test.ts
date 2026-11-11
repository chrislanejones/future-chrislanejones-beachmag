/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const owner = "event_titles_test_owner";
const saved = process.env.ADMIN_USER_IDS;
beforeEach(() => { process.env.ADMIN_USER_IDS = owner; });
afterEach(() => { process.env.ADMIN_USER_IDS = saved; });
const eventSlug = "ai-connect-signals-closed-loops-2026-11-10";

test("the admin sets a series and an episode title, edits them, and resets to the code's", async () => {
  const t = convexTest(schema, modules);
  const admin = t.withIdentity({ subject: owner });
  expect(await t.query(api.eventTitles.get, { eventSlug })).toBeNull();
  await admin.mutation(api.eventTitles.save, { eventSlug, series: " AI Connect Jax ", name: " From Signals to Closed Loops " });
  expect(await t.query(api.eventTitles.get, { eventSlug })).toMatchObject({ series: "AI Connect Jax", name: "From Signals to Closed Loops" });
  // Saving again updates the same row instead of adding one.
  await admin.mutation(api.eventTitles.save, { eventSlug, series: "", name: "A one-off now" });
  expect(await t.query(api.eventTitles.list, {})).toMatchObject([{ eventSlug, series: "", name: "A one-off now" }]);
  await admin.mutation(api.eventTitles.reset, { eventSlug });
  expect(await t.query(api.eventTitles.list, {})).toEqual([]);
});

test("visitors and other accounts cannot change titles; bad input is rejected", async () => {
  const t = convexTest(schema, modules);
  const titles = { eventSlug, series: "AI Connect Jax", name: "Talk" };
  for (const caller of [t, t.withIdentity({ subject: "other_user" })]) {
    await expect(caller.mutation(api.eventTitles.save, titles)).rejects.toThrow("Unauthorized");
    await expect(caller.mutation(api.eventTitles.reset, { eventSlug })).rejects.toThrow("Unauthorized");
  }
  const admin = t.withIdentity({ subject: owner });
  await expect(admin.mutation(api.eventTitles.save, { ...titles, name: "  " })).rejects.toThrow();
  await expect(admin.mutation(api.eventTitles.save, { ...titles, name: "x".repeat(201) })).rejects.toThrow();
  await expect(admin.mutation(api.eventTitles.save, { ...titles, series: "x".repeat(81) })).rejects.toThrow();
  await expect(admin.mutation(api.eventTitles.save, { ...titles, eventSlug: "../nope" })).rejects.toThrow("Invalid event");
});
