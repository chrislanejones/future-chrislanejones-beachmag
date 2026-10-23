"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary, photos as fallbackPhotos } from "@/components/coastal/live-content";
import type { GalleryPhoto } from "@/components/coastal/gallery-panel";
import { QUOTES } from "@/components/main/quote-content";
import { mountRadio } from "./radio-engine";
import { RadioMarkup } from "./radio-markup";

const SKILL_COMMAND = "npx skills add https://github.com/chrislanejones/bckgrnd-msc-mcp --skill background-music";

function SkillSticker() {
  const [hint, setHint] = useState("Click to copy");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(SKILL_COMMAND);
      copied = true;
    } catch {
      const field = document.createElement("textarea");
      field.value = SKILL_COMMAND;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;opacity:0";
      document.body.append(field);
      field.select();
      try {
        copied = document.execCommand("copy");
      } catch {}
      field.remove();
    }
    setHint(copied ? "Copied. Paste it in a terminal." : "Select the line above to copy it.");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHint("Click to copy"), 2600);
  }
  return (
    <button type="button" className="skill-sticker" onClick={copy}>
      <span className="sticker-label">Put it in your agent.</span>
      <code>npx skills add https://github.com/chrislanejones/bckgrnd-msc-mcp <span className="nowrap">--skill background-music</span></code>
      <span className="sticker-hint" aria-live="polite">{hint}</span>
    </button>
  );
}

function Ramblings() {
  const [quote, setQuote] = useState(0);
  return (
    <article className="ramble text-only">
      <h3>My ramblings.</h3>
      {/* Every quote sits in the same grid cell and only the current one shows,
          so the card is always as tall as the longest quote and never jumps. */}
      <blockquote className="quote-stack" aria-live="polite">
        {QUOTES.map((text, index) => (
          <span key={index} hidden={index !== quote}>{text}</span>
        ))}
      </blockquote>
      <div className="ramble-footer">
        <span>CHRIS LANE JONES</span>
        <button className="plain-button cursor-interaction" type="button" onClick={() => setQuote((quote + 1) % QUOTES.length)}>
          Another thought ↗
        </button>
      </div>
    </article>
  );
}

// Renders the ramblings/photos row and the album after it, as the design does.
function Postcards({ photos, ramble }: { photos: GalleryPhoto[]; ramble: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState(0);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current && !open) return;
    opened.current = true;
    (open ? closer : opener).current?.focus({ preventScroll: true });
  }, [open]);
  const photo = photos[index % photos.length];
  const step = (by: number) => {
    setIndex((index + by + photos.length) % photos.length);
    setTurns(turns + 1);
  };
  if (!photo) return <div className="two">{ramble}</div>;
  return (
    <>
      <div className="two">
        {ramble}
        <div className="photos">
          <h3>Wish you were here.</h3>
          <button ref={opener} className="photo-stack cursor-interaction" type="button" aria-expanded={open} aria-controls="beach-album" onClick={() => setOpen(!open)}>
            <span className="photo-front">
              <Image src={photos[0].src} alt={photos[0].alt} width={600} height={400} sizes="(max-width: 640px) 90vw, 480px" />
              <span>Open the postcards ↗</span>
            </span>
          </button>
        </div>
      </div>
      <section
        className={`album${open ? " opening" : ""}`}
        id="beach-album"
        aria-label="Beach photo album"
        hidden={!open}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
      >
        <div className="album-head">
          <h3>Postcards from here.</h3>
          <button ref={closer} className="plain-button cursor-interaction" type="button" onClick={() => setOpen(false)}>Close ×</button>
        </div>
        <figure className={`album-photo${turns ? " changing" : ""}`} key={turns}>
          <Image src={photo.src} alt={photo.alt} width={1200} height={800} sizes="(max-width: 640px) 92vw, 900px" />
          <figcaption>{photo.description}</figcaption>
        </figure>
        <div className="album-controls">
          <button className="plain-button cursor-interaction" type="button" onClick={() => step(-1)}>← Previous</button>
          <span className="photo-count" aria-live="polite">{(index % photos.length) + 1} / {photos.length}</span>
          <button className="plain-button cursor-interaction" type="button" onClick={() => step(1)}>Next →</button>
        </div>
      </section>
    </>
  );
}

function LivePostcards({ ramble }: { ramble: React.ReactNode }) {
  const items = useQuery(api.homeGallery.getGalleryPhotos);
  return <Postcards photos={items?.length ? items : fallbackPhotos} ramble={ramble} />;
}

// "Salt air. Side A.": the radio, ramblings and the postcard album.
export function BeachOffline() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => (section.current ? mountRadio(section.current) : undefined), []);
  return (
    <section id="beach-offline" ref={section} aria-label="Radio, ramblings and photo album">
      {/* Radio on the left, words on the right (shell.css); one column on phones. */}
      <div className="radio-scene hardware-radio">
        <div className="radio-head">
          <p className="eyebrow">HOMEPAGE / BEYOND THE BROWSER</p>
          <h2>Salt air.<br /><em>Side A.</em></h2>
          <p className="lede">A few things that don’t fit on a résumé.</p>
        </div>
        <div className="radio-unit">
          <RadioMarkup />
        </div>
        <div className="radio-notes">
          <div className="skill-note">
            <p>Every station on this dial came out of bckgrnd-msc. The background-music skill gives your agent all eighteen tracks to render, or to tuck under a voiceover.</p>
            <p className="skill-links">
              <a href="https://skills.sh/chrislanejones/bckgrnd-msc-mcp/background-music" target="_blank" rel="noopener noreferrer">background-music on skills.sh ↗<span className="sr-only"> (opens in a new tab)</span></a>
              <a href="https://github.com/chrislanejones/bckgrnd-msc-mcp" target="_blank" rel="noopener noreferrer">Source on GitHub ↗<span className="sr-only"> (opens in a new tab)</span></a>
            </p>
          </div>
          <SkillSticker />
        </div>
        <input type="file" className="radio-file" accept="audio/*" hidden />
      </div>
      <ContentBoundary fallback={<Postcards photos={fallbackPhotos} ramble={<Ramblings />} />}>
        <LivePostcards ramble={<Ramblings />} />
      </ContentBoundary>
    </section>
  );
}
