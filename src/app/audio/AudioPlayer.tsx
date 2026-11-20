"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./audio.module.css";

export type Track = { slug: string; title: string; filename: string; url: string };

// Where each track was left, kept on this device. Saved every few seconds
// while playing and again on pause, tab switch and page hide, so closing the
// browser (or the phone killing it) loses a few seconds at most.
type Spot = { t: number; d: number };
const spotKey = (slug: string) => `audio:spot:${slug}`;
const LAST_KEY = "audio:last";
const SAVE_EVERY_MS = 4000;
const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75] as const;

function readSpot(slug: string): Spot | null {
  try {
    const raw = localStorage.getItem(spotKey(slug));
    return raw ? (JSON.parse(raw) as Spot) : null;
  } catch {
    return null;
  }
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}

export function AudioPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSave = useRef(0);
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const last = localStorage.getItem(LAST_KEY);
    return Math.max(0, tracks.findIndex((track) => track.slug === last));
  });
  const [spots, setSpots] = useState<Record<string, Spot | null>>(() =>
    typeof window === "undefined" ? {} : Object.fromEntries(tracks.map((track) => [track.slug, readSpot(track.slug)])),
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const track = tracks[index];

  const save = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track || !Number.isFinite(audio.duration)) return;
    const spot = { t: audio.currentTime, d: audio.duration };
    localStorage.setItem(spotKey(track.slug), JSON.stringify(spot));
    localStorage.setItem(LAST_KEY, track.slug);
    lastSave.current = Date.now();
    setSpots((all) => ({ ...all, [track.slug]: spot }));
  }, [track]);

  const go = useCallback(
    (next: number, autoplay: boolean) => {
      if (next < 0 || next >= tracks.length) return;
      save();
      setIndex(next);
      localStorage.setItem(LAST_KEY, tracks[next].slug);
      if (autoplay) requestAnimationFrame(() => void audioRef.current?.play().catch(() => {}));
    },
    [save, tracks],
  );

  const skip = useCallback((by: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + by));
  }, []);

  // Save when the page goes to the background or away: phones often freeze or
  // kill a backgrounded tab without another timeupdate.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
    };
  }, [save]);

  // Lock screen, headphones and car controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({ title: track.title, artist: "Chris Lane Jones", album: "Listening room" });
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", () => void audioRef.current?.play()],
      ["pause", () => audioRef.current?.pause()],
      ["seekbackward", (details) => skip(-(details.seekOffset ?? 15))],
      ["seekforward", (details) => skip(details.seekOffset ?? 30)],
      ["seekto", (details) => {
        if (audioRef.current && details.seekTime != null) audioRef.current.currentTime = details.seekTime;
      }],
      ["previoustrack", index > 0 ? () => go(index - 1, true) : null],
      ["nexttrack", index < tracks.length - 1 ? () => go(index + 1, true) : null],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Not every browser knows every action.
      }
    }
  }, [track, index, tracks.length, go, skip]);

  const download = async (item: Track) => {
    setDownloading(item.slug);
    try {
      // The file lives on Convex's domain, where <a download> is ignored and the
      // name would be a storage id, so fetch it and save it under its own name.
      const blob = await (await fetch(item.url)).blob();
      const href = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), { href, download: item.filename });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 60_000);
    } catch {
      window.open(item.url, "_blank", "noopener");
    } finally {
      setDownloading(null);
    }
  };

  if (!track) return <p>No audio here yet.</p>;
  const spot = spots[track.slug];

  return (
    <div className={styles.player}>
      <div className={styles.now}>
        <p className={styles.nowLabel}>{playing ? "NOW PLAYING" : spot && spot.t > 5 ? `PAUSED AT ${clock(spot.t)}` : "UP NEXT"}</p>
        <h2 className={styles.nowTitle}>{track.title}</h2>
        <audio
          ref={audioRef}
          key={track.slug}
          src={track.url}
          controls
          preload="metadata"
          className={styles.audio}
          onLoadedMetadata={(event) => {
            const audio = event.currentTarget;
            audio.playbackRate = speed;
            const saved = readSpot(track.slug);
            // Pick up where it was left, unless that was the very end.
            if (saved && saved.t > 5 && saved.t < audio.duration - 10) audio.currentTime = saved.t;
          }}
          onTimeUpdate={() => {
            if (Date.now() - lastSave.current > SAVE_EVERY_MS) save();
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            save();
          }}
          onEnded={() => {
            localStorage.removeItem(spotKey(track.slug));
            setSpots((all) => ({ ...all, [track.slug]: { t: 0, d: audioRef.current?.duration ?? 0 } }));
            if (index < tracks.length - 1) go(index + 1, true);
          }}
        />
        <div className={styles.controls}>
          <button type="button" onClick={() => skip(-15)} aria-label="Back 15 seconds">↺ 15</button>
          <button type="button" onClick={() => skip(30)} aria-label="Forward 30 seconds">30 ↻</button>
          <button
            type="button"
            onClick={() => {
              const next = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length];
              setSpeed(next);
              if (audioRef.current) audioRef.current.playbackRate = next;
            }}
            aria-label={`Playback speed ${speed}x`}
          >
            {speed}×
          </button>
          <button type="button" onClick={() => void download(track)} disabled={downloading === track.slug}>
            {downloading === track.slug ? "Downloading…" : "Download ↓"}
          </button>
        </div>
      </div>

      <ol className={styles.playlist} aria-label="Playlist">
        {tracks.map((item, i) => {
          const itemSpot = spots[item.slug];
          const progress = itemSpot && itemSpot.d ? Math.min(1, itemSpot.t / itemSpot.d) : 0;
          return (
            <li key={item.slug} className={i === index ? styles.current : undefined}>
              <button
                type="button"
                className={styles.pick}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i, true)}
              >
                <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.pickText}>
                  <span>{item.title}</span>
                  <span className={styles.meta}>
                    {itemSpot && itemSpot.d
                      ? itemSpot.t > 5
                        ? `${clock(itemSpot.d - itemSpot.t)} left`
                        : clock(itemSpot.d)
                      : " "}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={styles.save}
                onClick={() => void download(item)}
                disabled={downloading === item.slug}
                aria-label={`Download ${item.title}`}
              >
                ↓
              </button>
              <span className={styles.bar} style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
