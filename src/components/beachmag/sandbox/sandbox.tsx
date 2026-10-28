"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTheme } from "@/lib/theme-store";
import { ToolArt } from "./tool-art";
import { ToolKnob } from "./tool-knob";
import { BeachFigure } from "../beach-figure";
import { WASH_CLEAR_MS, WASH_END_MS } from "./beach-wash";
import { castleReducer, initialCastle, MAX_FLAGS, HALF_X, HALF_Z, type CastleTool } from "./sandcastle-model";
import { BucketLoader } from "./bucket-loader";
import "./sandbox.css";

// Three.js stays out of the server render and the first bundle.
const loadScene = () => import("./sandcastle-scene");
const Scene = dynamic(loadScene, { ssr: false, loading: () => null });

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p className="game-error">The 3D beach couldn’t start. Enable WebGL and reload to play.</p> : this.props.children;
  }
}

const TOOLS: [CastleTool, string][] = [
  ["tower", "Tower"], ["bucket", "Bucket"], ["wall", "Wall"], ["pile", "Pile sand"],
  ["moat", "Dig moat"], ["flag", "Pick up flag"], ["shell", "Shell"], ["erase", "Remove"],
];

// The names printed on the tool knob, where there's room for one word.
const SHORT: Record<CastleTool, string> = {
  tower: "Tower", bucket: "Bucket", wall: "Wall", pile: "Pile", moat: "Moat", flag: "Flag", shell: "Shell", erase: "Remove",
};

// Motion runs only when the visitor allows it and the tab is visible.
const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const media = matchMedia(REDUCED);
  media.addEventListener("change", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}
const motionAllowed = () => !matchMedia(REDUCED).matches && !document.hidden;

// "Leave a little castle." Ported from the design's work/sandbox/preview.tsx.
export function Sandbox() {
  const [state, dispatch] = useReducer(castleReducer, initialCastle);
  const [washStartedAt, setWashStartedAt] = useState<number | null>(null);
  const [tool, setTool] = useState<CastleTool>("bucket");
  const [held, setHeld] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, z: 2 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [visible, setVisible] = useState(false);
  const dark = useTheme() === "dark";
  const moving = useSyncExternalStore(subscribeMotion, motionAllowed, () => false);
  const host = useRef<HTMLDivElement>(null);
  const aim = useRef(cursor);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const used = state.pieces.filter((piece) => piece.kind === "flag").length;
  const available = MAX_FLAGS - used - (held ? 1 : 0);

  useEffect(() => {
    if (washStartedAt === null) return;
    const clear = () => {
      dispatch({ type: "clear" });
      setHeld(false);
    };
    const finish = () => {
      setWashStartedAt(null);
      setBusy(false);
      setNotice("Fresh sand. All five flags are back in the box.");
    };
    const elapsed = performance.now() - washStartedAt;
    const clearTimer = setTimeout(() => {
      clear();
      setNotice("The wave is heading back out…");
    }, Math.max(0, WASH_CLEAR_MS - elapsed));
    const endTimer = setTimeout(finish, Math.max(0, WASH_END_MS - elapsed));
    return () => {
      clearTimeout(clearTimer);
      clearTimeout(endTimer);
    };
  }, [washStartedAt]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    if (host.current) observer.observe(host.current);
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Three.js is the heaviest script on the page (about 250 KB) and the beach sits
  // at the bottom, so the scene loads only once the reader is a screen away.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin: "100% 0px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  // The loading bucket counts to 100% once the game is on screen, finishing
  // after the scene's code has arrived, or failed to: on failure the Boundary
  // shows its message, so the bucket must step aside either way.
  const [settled, setSettled] = useState(false);
  const [filled, setFilled] = useState(false);
  const onFull = useCallback(() => setFilled(true), []);
  useEffect(() => {
    if (!near) return;
    let live = true;
    const settle = () => { if (live) setSettled(true); };
    loadScene().then(settle, settle);
    return () => { live = false; };
  }, [near]);

  function pickFlag() {
    if (busy) return;
    if (!held && available <= 0) {
      setNotice("All five flags are planted. Remove one or undo to use it again.");
      return;
    }
    setHeld(true);
    setTool("flag");
    setNotice("Flags in hand. Tap the sand or a castle to plant each one.");
  }

  function select(next: CastleTool) {
    if (next === "flag") {
      pickFlag();
      return;
    }
    setTool(next);
    setNotice("");
  }

  function clearBeach() {
    if (busy) return;
    // Reduced motion and a hidden tab skip the wave rather than leaving controls locked.
    if (!moving) {
      dispatch({ type: "clear" });
      setHeld(false);
      setNotice("Fresh sand. All five flags are back in the box.");
      return;
    }
    setBusy(true);
    setNotice("Here comes the tide…");
    setWashStartedAt(performance.now());
  }

  function place(x = aim.current.x, z = aim.current.z) {
    if (busy) return;
    aim.current = { x, z };
    setCursor({ x, z });
    setNotice("");
    if (tool === "flag" && !held && available <= 0) {
      setNotice("All five flags are planted. Remove one or undo to use it again.");
      return;
    }
    const action = { type: "place" as const, tool, x, z, rotated };
    const next = castleReducer(state, action);
    dispatch(action);
    if (next.pieces === state.pieces) return;
    // One trip to the box is enough: the next flag comes to hand by itself
    // until all five are planted.
    if (tool === "flag") {
      const left = MAX_FLAGS - used - 1;
      setHeld(left > 0);
      setNotice(left > 0 ? `Flag planted. ${left} left: tap to plant the next one.` : "All five flags are planted.");
    }
    if (moving && ["tower", "bucket", "wall", "pile", "moat"].includes(tool)) {
      setBusy(true);
      timer.current = setTimeout(() => setBusy(false), tool === "moat" ? 2900 : 1450);
    }
  }

  // The scene says which spots are open sand on screen; the keys stay on them.
  const reachable = useRef<(x: number, z: number) => boolean>(() => true);
  const onReach = useCallback((test: (x: number, z: number) => boolean) => { reachable.current = test; }, []);
  function aimAt(x: number, z: number) {
    const point = { x: Math.max(-HALF_X, Math.min(HALF_X, x)), z: Math.max(-HALF_Z, Math.min(HALF_Z, z)) };
    if (!reachable.current(point.x, point.z)) return;
    aim.current = point;
    setCursor(point);
  }

  return (
    <section id="sandbox" aria-label="Sandcastle sandbox">
      {/* Top row: the words (with the status line last), then the tool
          knob, then the surfer from the beach line drawing. The beach is
          the next row. */}
      <div className="sandbox-heading">
        <div className="sandbox-words">
          <p className="game-kicker">NO DEADLINES. JUST SAND.</p>
          <h2>Leave a little<br /><em>castle.</em></h2>
          <p>A small patch of coast to make your own. Pick a mold, press the sand, lift the bucket. Five flags. One very good afternoon.</p>
          {/* The how-to lives here; the stage points at it by id. */}
          <p id="game-help">Build it for me makes a whole castle; Undo brings back your beach. Tap the sand to build. Tap the wooden flag box or choose Pick up flag once, then tap to plant all five. Removing a flag returns it to the box. Dig neighboring spots to join the water channels. Use arrow keys to move the marker, Enter to build, or Delete to remove the top piece.</p>
          {/* The line that changes as you play, under the how-to. */}
          <p className="game-status" role="status">{notice || state.message}{busy && washStartedAt === null ? " · Let the sand settle…" : ""}</p>
        </div>
        <div className="sandbox-dial">
        <ToolKnob
          tools={TOOLS.map(([id, label]) => ({
            id,
            label,
            short: SHORT[id],
            disabled: id === "flag" && available === 0 && !held,
            note: id === "flag" ? (held ? "IN HAND" : `${available} LEFT`) : undefined,
          }))}
          value={tool}
          onSelect={select}
          disabled={busy}
        />
        </div>
        <BeachFigure name="beach-girl" className="sand-figure" />
      </div>
      {/* Phones: the knob gets too small to read, so the tools stay a button grid. */}
      <div className="game-toolbar" role="group" aria-label="Sandcastle tools">
        {TOOLS.map(([id, label]) => (
          <button type="button" key={id} aria-pressed={tool === id} disabled={busy || (id === "flag" && available === 0 && !held)} onClick={() => select(id)}>
            <ToolArt tool={id} />
            {label}
            {id === "flag" && <small>{held ? "IN HAND" : available + " LEFT"}</small>}
          </button>
        ))}
      </div>
      <div
        className="game-stage"
        ref={host}
        role="group"
        aria-label="Interactive 3D sandcastle beach"
        aria-describedby="game-help"
        tabIndex={0}
        onKeyDown={(event) => {
          const steps: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          if (steps[event.key]) {
            event.preventDefault();
            const [dx, dz] = steps[event.key];
            aimAt(aim.current.x + dx, aim.current.z + dz);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            place();
          } else if (event.key === "Delete" && !busy) {
            event.preventDefault();
            dispatch({ type: "place", tool: "erase", ...aim.current, rotated });
          }
        }}
      >
        {near && !filled && <BucketLoader running={visible} ready={settled} onFull={onFull} />}
        <Boundary>
          {near && <Scene
            pieces={state.pieces}
            tool={tool}
            cursor={cursor}
            dark={dark}
            moving={moving && visible}
            washStartedAt={washStartedAt}
            flagsAvailable={available}
            onPickFlag={pickFlag}
            onPlace={place}
            onAim={(point) => {
              aim.current = point;
            }}
            onReach={onReach}
          />}
        </Boundary>
      </div>
      <div className="game-bottom">
        <span>{used} / 5 flags planted · {state.pieces.length} pieces</span>
        <div>
          <button
            type="button"
            className="auto-build"
            disabled={busy}
            onClick={() => {
              dispatch({ type: "build" });
              setHeld(false);
              setNotice("");
            }}
          >
            Build it for me ↗
          </button>
          <button type="button" disabled={busy || tool !== "wall"} aria-pressed={rotated} onClick={() => setRotated(!rotated)}>Rotate mold ↻</button>
          <button type="button" disabled={busy} onClick={() => place()}>Place at marker</button>
          <button
            type="button"
            disabled={busy || !state.history.length}
            onClick={() => {
              dispatch({ type: "undo" });
              setHeld(false);
              setNotice("");
            }}
          >
            Undo
          </button>
          <button type="button" disabled={busy} onClick={clearBeach}>{washStartedAt === null ? "Clear beach" : "Washing ashore…"}</button>
        </div>
      </div>
    </section>
  );
}
