"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { ContentBoundary, photos as fallbackPhotos } from "@/components/coastal/live-content";
import type { GalleryPhoto } from "@/components/coastal/gallery-panel";
import { QUOTES } from "@/components/main/quote-content";
import GalleryDrawer from "./gallery-drawer";
import { mountRadio } from "./radio-engine";
import { RadioMarkup } from "./radio-markup";

const SKILL_COMMAND = "npx skills add https://github.com/chrislanejones/bckgrnd-msc-mcp --skill background-music";

// The ribbon is the button: one tap copies the install command, and a toast
// says whether that worked (with the command to copy by hand if it didn't).
function SkillSticker() {
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
    if (copied) toast.success("Copied to clipboard", { description: "Paste it in your terminal or agent." });
    else toast.error("Couldn’t copy that", { description: SKILL_COMMAND });
  }
  return (
    <button type="button" className="skill-sticker" onClick={copy} title={SKILL_COMMAND}>
      <span className="sticker-label">Put it in your agent.</span>
      <span className="skill-copy"><Copy size={16} strokeWidth={2.25} aria-hidden="true" /> Copy to clipboard</span>
    </button>
  );
}

// "My ramblings." sits above the paper (and its tape), the way "Wish you
// were here." sits above the postcards.
function Ramblings() {
  const [quote, setQuote] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || QUOTES.length < 2) return;
    // Give the marquee three passes; manual advances restart the reading time.
    const timer = setTimeout(() => setQuote((current) => (current + 1) % QUOTES.length), quote === 0 ? 21000 : 18000);
    return () => clearTimeout(timer);
  }, [quote, paused]);

  return (
    <div className="rambles">
      <h3>My ramblings.</h3>
      <article className="ramble text-only">
        {/* Every quote sits in the same grid cell and only the current one shows,
            so the card is always as tall as the longest quote and never jumps. */}
        <blockquote className="quote-stack" aria-live={paused ? "polite" : "off"}>
          {QUOTES.map((text, index) => (
            <span key={index} hidden={index !== quote}>{text}</span>
          ))}
        </blockquote>
        <div className="ramble-footer">
          <span>CHRIS LANE JONES</span>
          <button className="plain-button cursor-interaction" type="button" aria-pressed={paused} onClick={() => setPaused((current) => !current)}>
            Pause rotation
          </button>
          <button className="plain-button cursor-interaction" type="button" onClick={() => setQuote((current) => (current + 1) % QUOTES.length)}>
            Another thought ↗
          </button>
        </div>
      </article>
    </div>
  );
}

// The ramblings card beside "Wish you were here.": the postcard opens the
// polaroid gallery from the future-chrislanejones site.
function Postcards({ photos, ramble }: { photos: GalleryPhoto[]; ramble: React.ReactNode }) {
  const cover = photos[0];
  if (!cover) return <div className="two">{ramble}</div>;
  return (
    <div className="two">
      {ramble}
      <div className="photos">
        <h3>Wish you were here.</h3>
        <GalleryDrawer photos={photos} title="Postcards from here." description="Click a photo to bring it to the front.">
          <button className="photo-stack cursor-interaction" type="button" aria-label="Open the postcards gallery">
            <span className="photo-front">
              <Image src={cover.src} alt={cover.alt} width={600} height={400} sizes="(max-width: 640px) 90vw, 480px" />
              <span>Open the postcards ↗</span>
            </span>
          </button>
        </GalleryDrawer>
      </div>
    </div>
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
