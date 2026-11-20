"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AudioPlayer, type Track } from "./AudioPlayer";
import styles from "./audio.module.css";

// This device remembers the password, so coming back later goes straight to
// the player (and the saved spot).
const PASS_KEY = "audio:pass";

export function AudioLocker() {
  const unlock = useMutation(api.privateAudio.unlock);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "busy">("idle");

  const tryPassword = async (value: string, remembered: boolean) => {
    setStatus("checking");
    try {
      const result = await unlock({ password: value });
      if (result.ok) {
        localStorage.setItem(PASS_KEY, value);
        setTracks(result.tracks);
        setStatus("idle");
      } else {
        if (remembered) localStorage.removeItem(PASS_KEY);
        setStatus(remembered ? "idle" : result.reason);
      }
    } catch {
      setStatus("busy");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(PASS_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one read of this device's saved password on mount
    if (saved) void tryPassword(saved, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.room} aria-labelledby="audio-title">
      <p className="page-kicker">LISTENING ROOM</p>
      <h1 id="audio-title" className={styles.title}>Audio</h1>
      {tracks ? (
        <AudioPlayer tracks={tracks} />
      ) : (
        <form
          className={styles.lock}
          onSubmit={(event) => {
            event.preventDefault();
            if (password.trim()) void tryPassword(password, false);
          }}
        >
          <label htmlFor="audio-password">Password</label>
          <div className={styles.lockRow}>
            <input
              id="audio-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby="audio-status"
              aria-invalid={status === "wrong"}
            />
            <button type="submit" disabled={status === "checking"}>
              {status === "checking" ? "Checking…" : "Listen"}
            </button>
          </div>
          <p id="audio-status" className={styles.status} role="status">
            {status === "wrong" && "That password didn't work."}
            {status === "busy" && "Too many tries right now. Give it a few minutes."}
          </p>
        </form>
      )}
    </section>
  );
}
