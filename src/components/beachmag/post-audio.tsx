"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

/**
 * A post's narration, under the date line. The player is the one from the
 * Image Horse blog (rust-wasm-photo-tool/marketing, PostAudio + Narration):
 * a play circle, a hairline the accent fills as it plays, mute and level.
 * Built from the magazine's tokens rather than <audio controls>, which draws
 * a different grey widget in every browser. This copy owns its own <audio>,
 * so it stops when you leave the post; the site-wide mini player that keeps
 * playing across pages is parked (PARKING_LOT.md).
 *
 * preload="metadata": the duration shows at once, the track loads on Play.
 */
const VOLUME_KEY = "clj-narration-volume";

function savedVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const v = Number(raw);
    return raw !== null && v >= 0 && v <= 1 ? v : 1;
  } catch {
    return 1;
  }
}

export function clock(seconds: number) {
  const v = Math.max(0, Math.floor(seconds));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function PostAudio({ src, title }: { src: string; title: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  // 1 on the server and the first client render so hydration matches; the saved level lands in an effect.
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const v = savedVolume();
    setVolumeState(v);
    a.volume = v;
    const time = () => setT(a.currentTime);
    const meta = () => Number.isFinite(a.duration) && setDur(a.duration);
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const vol = () => {
      setVolumeState(a.volume);
      setMuted(a.muted);
    };
    a.addEventListener("timeupdate", time);
    a.addEventListener("loadedmetadata", meta);
    a.addEventListener("durationchange", meta);
    a.addEventListener("play", play);
    a.addEventListener("pause", pause);
    a.addEventListener("ended", pause);
    a.addEventListener("volumechange", vol);
    if (Number.isFinite(a.duration) && a.duration > 0) setDur(a.duration);
    return () => {
      a.removeEventListener("timeupdate", time);
      a.removeEventListener("loadedmetadata", meta);
      a.removeEventListener("durationchange", meta);
      a.removeEventListener("play", play);
      a.removeEventListener("pause", pause);
      a.removeEventListener("ended", pause);
      a.removeEventListener("volumechange", vol);
    };
  }, []);

  // The phone's lock screen and the OS media keys drive the same player.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({ title, artist: "Chris Lane Jones" });
    const a = audio.current;
    const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, fn);
      } catch {
        /* an action this browser doesn't support */
      }
    };
    set("play", () => void a?.play());
    set("pause", () => a?.pause());
    set("seekbackward", () => a && (a.currentTime = Math.max(0, a.currentTime - 15)));
    set("seekforward", () => a && (a.currentTime = Math.min(a.duration || 0, a.currentTime + 15)));
    return () => {
      for (const action of ["play", "pause", "seekbackward", "seekforward"] as const) set(action, null);
    };
  }, [title]);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }, []);
  const seek = useCallback((v: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = v;
    setT(v);
  }, []);
  const setVolume = useCallback((v: number) => {
    const a = audio.current;
    if (!a) return;
    a.volume = v;
    // Dragging up from zero should be heard.
    if (v > 0 && a.muted) a.muted = false;
    try {
      localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      /* private window: the level just isn't remembered */
    }
  }, []);
  const toggleMute = useCallback(() => {
    const a = audio.current;
    if (a) a.muted = !a.muted;
  }, []);

  const pct = dur > 0 ? (t / dur) * 100 : 0;
  const level = muted ? 0 : volume;
  const VolumeIcon = level === 0 ? VolumeX : level < 0.5 ? Volume1 : Volume2;

  return (
    <div className="post-audio" role="group" aria-label="Listen to this entry">
      <audio ref={audio} src={src} preload="metadata" />
      <button type="button" className="post-audio__play" onClick={toggle} aria-label={playing ? "Pause the narration" : "Play the narration"}>
        <PlayIcon playing={playing} />
      </button>
      <div className="post-audio__body">
        <p className="post-audio__label">
          Listen <span aria-hidden="true">·</span> narrated{dur > 0 && <> <span aria-hidden="true">·</span> {Math.max(1, Math.round(dur / 60))} min</>}
        </p>
        <div className="post-audio__track">
          <span className="post-audio__time">{clock(t)}</span>
          <input
            type="range"
            className="narration-range"
            min={0}
            max={dur || 0}
            step={1}
            value={Math.min(t, dur || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${clock(t)} of ${clock(dur)}`}
            style={{ "--narration-fill": `${pct}%` } as CSSProperties}
          />
          <span className="post-audio__time">{clock(dur)}</span>
        </div>
      </div>
      {/* iOS ignores `volume` (the hardware buttons own it); mute still works everywhere. */}
      <div className="narration-volume">
        <button type="button" className="narration-icon-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted}>
          <VolumeIcon aria-hidden="true" />
        </button>
        <input
          type="range"
          className="narration-range narration-volume__slider"
          min={0}
          max={1}
          step={0.05}
          value={level}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          aria-valuetext={`${Math.round(level * 100)}%`}
          style={{ "--narration-fill": `${level * 100}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
