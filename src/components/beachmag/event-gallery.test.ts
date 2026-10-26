// @vitest-environment node
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";
import type { Doc } from "../../../convex/_generated/dataModel";

const query = vi.hoisted(() => vi.fn(() => undefined as Doc<"eventPhotos">[] | undefined));
const galleryPhotos = vi.hoisted(() => vi.fn());
vi.mock("convex/react", () => ({ useQuery: query }));
vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }) }));
vi.mock("./gallery-drawer", () => ({ default: ({ children, photos }: { children: ReactNode; photos: unknown[] }) => {
  galleryPhotos(photos);
  return children;
} }));
import { EventHero } from "./event-gallery";

const photos = ["Presentation", "Networking"].map((alt, order) => ({
  _id: `photo-${order}`, _creationTime: 0, eventSlug: "test-event", url: `/event-${order}.jpg`,
  alt, caption: "", credit: "", stock: false, order,
})) as Doc<"eventPhotos">[];
const render = (initialPhotos: Doc<"eventPhotos">[]) => renderToStaticMarkup(createElement(EventHero, {
  slug: "test-event", name: "An event", description: "An evening with local builders.", initialPhotos,
}));
afterEach(() => query.mockReturnValue(undefined));

test("an event without photos keeps its title and recap without an empty gallery control", () => {
  const html = render([]);
  expect(html).toContain("An evening with local builders.");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("Open gallery");
});

test("one photo shows as the main photo without a gallery button", () => {
  const html = render(photos.slice(0, 1));
  expect(html).toContain('alt="Presentation"');
  expect(html).not.toContain("Open gallery");
});

test("multiple photos show only the main photo in the header and a gallery button below it", () => {
  const html = render(photos);
  expect(html.match(/<img /g)).toHaveLength(1);
  expect(html).toContain('alt="Presentation"');
  expect(html.indexOf("Open gallery")).toBeGreaterThan(html.indexOf("</figure>"));
});

test("live reordering or removal replaces the server's initial main photo", () => {
  query.mockReturnValue([...photos].reverse());
  expect(render(photos)).toContain('alt="Networking"');
  query.mockReturnValue([]);
  expect(render(photos)).not.toContain("<img");
});

test("the popup receives at most five photos, in their saved order", () => {
  const many = Array.from({ length: 7 }, (_, index) => ({ ...photos[0], url: `/photo-${index}.jpg`, order: index }));
  render(many);
  expect(galleryPhotos.mock.lastCall?.[0].map((photo: { src: string }) => photo.src)).toEqual(many.slice(0, 5).map((photo) => photo.url));
});
