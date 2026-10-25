// The Coastal mono radio: four bckgrnd-msc stations, treble/bass/volume knobs,
// a VU meter and LOAD for local files. Ported from the static design's script
// (work/home-radio.js); it drives the radio's DOM directly, so the React
// markup around it renders once and never re-renders.

const STATIONS = [
  ["lowtide", "Lowtide", "Liquid DnB", 172],
  ["basement", "Basement", "House", 122],
  ["southside", "Southside", "Garage", 132],
  ["study", "Study", "Chillhop", 76],
] as const;

type Dial = { set: (value: number) => void; get: () => number };
type Tone = "treble" | "bass";

const decibels = (value: number) => {
  const n = Math.round(value);
  return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);
};

export function mountRadio(root: HTMLElement): () => void {
  const abort = new AbortController();
  const on = <K extends keyof HTMLElementEventMap>(target: EventTarget, type: K | string, handler: (event: HTMLElementEventMap[K]) => void) =>
    target.addEventListener(type, handler as EventListener, { signal: abort.signal });
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;

  const audio = $<HTMLAudioElement>(".real-audio");
  const play = $<HTMLButtonElement>(".real-play");
  const status = $<HTMLElement>(".real-status");
  const chassis = $<HTMLElement>(".mono-radio");
  const seek = $<HTMLInputElement>(".radio-seek");
  const counter = $<HTMLElement>(".tape-counter");
  const fileInput = $<HTMLInputElement>(".radio-file");
  const presets = [...root.querySelectorAll<HTMLButtonElement>(".station")];
  let station = 0;
  let sourceLabel = "";
  let objectUrl: string | null = null;

  let context: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let samples: Uint8Array<ArrayBuffer> | undefined;
  let meterFrame = 0;
  const filters: Partial<Record<Tone, BiquadFilterNode>> = {};
  // Volume runs through a gain node: iOS ignores an audio element's own volume.
  let level: GainNode | undefined;
  let volume = 0;
  const tones: Partial<Record<Tone, Dial>> = {};

  function graph() {
    if (context) return;
    context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 256;
    samples = new Uint8Array(analyser.fftSize);
    const bass = context.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 250;
    const treble = context.createBiquadFilter();
    treble.type = "highshelf";
    treble.frequency.value = 3500;
    filters.bass = bass;
    filters.treble = treble;
    bass.gain.value = tones.bass?.get() ?? 0;
    treble.gain.value = tones.treble?.get() ?? 0;
    level = context.createGain();
    level.gain.value = volume;
    audio.volume = 1;
    context.createMediaElementSource(audio).connect(bass);
    bass.connect(treble);
    treble.connect(level);
    level.connect(analyser);
    analyser.connect(context.destination);
  }

  function meter() {
    cancelAnimationFrame(meterFrame);
    if (audio.paused) {
      chassis.style.setProperty("--vu", "-40deg");
      return;
    }
    if (analyser && samples) {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      chassis.style.setProperty("--vu", -40 + Math.min(1, Math.sqrt(sum / samples.length) * 5) * 80 + "deg");
    }
    meterFrame = requestAnimationFrame(meter);
  }

  function playback() {
    play.querySelector("span")!.textContent = audio.paused ? "▶" : "Ⅱ";
    play.querySelector("small")!.textContent = audio.paused ? "PLAY" : "PAUSE";
    play.setAttribute("aria-label", audio.paused ? "Play radio" : "Pause radio");
    play.setAttribute("aria-pressed", String(!audio.paused));
    chassis.classList.toggle("is-playing", !audio.paused);
    status.textContent = sourceLabel + " · " + (audio.paused ? "Paused" : "Playing");
    meter();
  }

  async function start() {
    try {
      graph();
      if (context) await context.resume();
      await audio.play();
    } catch {
      status.textContent = "Playback could not start. Press PLAY again, or LOAD your own audio file.";
    }
  }

  function tune(index: number, keepPlaying = !audio.paused) {
    station = (index + STATIONS.length) % STATIONS.length;
    const [id, name, style, bpm] = STATIONS[station];
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    audio.src = `/audio/${id}.mp3`;
    sourceLabel = `${name} · ${style} · ${bpm} bpm`;
    presets.forEach((button, i) => button.setAttribute("aria-pressed", String(i === station)));
    chassis.classList.remove("off-dial");
    chassis.style.setProperty("--needle", ((station + 0.5) / STATIONS.length) * 100 + "%");
    if (keepPlaying) start();
    else playback();
  }

  function dial(
    knob: HTMLElement,
    { min, max, value, step, big, text, change }: { min: number; max: number; value: number; step: number; big: number; text: (v: number) => string; change: (v: number) => void },
  ): Dial {
    let current = value;
    let drag: { id: number; angle: number } | null = null;
    function set(next: number) {
      current = Math.max(min, Math.min(max, next));
      knob.style.setProperty("--knob", -135 + ((current - min) / (max - min)) * 270 + "deg");
      knob.setAttribute("aria-valuenow", String(Math.round(current)));
      knob.setAttribute("aria-valuetext", text(current));
      change(current);
    }
    function angle(event: PointerEvent) {
      const box = knob.getBoundingClientRect();
      return (Math.atan2(event.clientX - box.left - box.width / 2, box.top + box.height / 2 - event.clientY) * 180) / Math.PI;
    }
    const disabled = () => knob.getAttribute("aria-disabled") === "true";
    on<"pointerdown">(knob, "pointerdown", (event) => {
      if (event.button !== 0 || disabled()) return;
      event.preventDefault();
      knob.focus({ preventScroll: true });
      knob.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, angle: angle(event) };
    });
    on<"pointermove">(knob, "pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const next = angle(event);
      let delta = next - drag.angle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      set(current + (delta / 270) * (max - min));
      drag.angle = next;
    });
    const end = (event: PointerEvent) => {
      if (drag && drag.id === event.pointerId) {
        drag = null;
        if (knob.hasPointerCapture(event.pointerId)) knob.releasePointerCapture(event.pointerId);
      }
    };
    on<"pointerup">(knob, "pointerup", end);
    on<"pointercancel">(knob, "pointercancel", end);
    on(knob, "lostpointercapture", () => (drag = null));
    on<"keydown">(knob, "keydown", (event) => {
      if (disabled()) return;
      const steps: Record<string, number> = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big };
      if (event.key in steps) {
        event.preventDefault();
        set(current + steps[event.key]);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        set(event.key === "End" ? max : min);
      }
    });
    set(value);
    return { set, get: () => current };
  }

  function position() {
    const time = audio.currentTime || 0;
    const known = Number.isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !Number.isFinite(audio.duration);
    seek.value = String(known ? (time / audio.duration) * 100 : 0);
    counter.textContent = String(Math.floor(time / 60)).padStart(2, "0") + ":" + String(Math.floor(time % 60)).padStart(2, "0");
  }

  function skip(seconds: number) {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    position();
  }

  on(play, "click", () => (audio.paused ? start() : audio.pause()));
  presets.forEach((button, i) => on(button, "click", () => tune(i)));
  on(audio, "play", playback);
  on(audio, "pause", playback);
  // The radio keeps going: when a station's track ends, the dial moves on to the next one.
  on(audio, "ended", () => (objectUrl ? playback() : tune(station + 1, true)));
  on(audio, "error", () => (status.textContent = "Audio could not load. Press LOAD to choose a local audio file."));
  on($(".real-stop"), "click", () => {
    audio.pause();
    audio.currentTime = 0;
    playback();
  });

  const volumeReadout = $<HTMLElement>(".volume-readout");
  // Phone and tablet speakers are quieter than a laptop's, so touch screens start louder.
  const touch = matchMedia("(pointer: coarse)").matches;
  dial($(".volume-knob"), {
    min: 0, max: 100, value: touch ? 70 : 35, step: 5, big: 10,
    text: (v) => Math.round(v) + " percent",
    change: (v) => {
      volume = v / 100;
      if (context && level) level.gain.setTargetAtTime(volume, context.currentTime, 0.03);
      else audio.volume = volume;
      volumeReadout.textContent = String(Math.round(v));
    },
  });
  for (const knob of root.querySelectorAll<HTMLElement>(".tone-knob")) {
    const key = knob.dataset.tone as Tone;
    const readout = knob.closest(".tone-assembly")!.querySelector(".tone-readout")!;
    tones[key] = dial(knob, {
      min: -12, max: 12, value: 0, step: 1, big: 3,
      text: (v) => decibels(v).replace("−", "minus ") + " decibels",
      change: (v) => {
        readout.textContent = decibels(v);
        if (context) filters[key]?.gain.setTargetAtTime(v, context.currentTime, 0.03);
      },
    });
    on(knob, "dblclick", () => tones[key]?.set(0));
  }

  on(audio, "timeupdate", position);
  on(audio, "loadedmetadata", position);
  on(audio, "emptied", position);
  on(seek, "input", () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });
  on($(".real-rewind"), "click", () => skip(-5));
  on($(".real-forward"), "click", () => skip(5));
  on($(".real-load"), "click", () => fileInput.click());
  on(fileInput, "change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    audio.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    sourceLabel = file.name;
    presets.forEach((button) => button.setAttribute("aria-pressed", "false"));
    chassis.classList.add("off-dial");
    playback();
  });
  tune(0, false);
  position();

  return () => {
    abort.abort();
    cancelAnimationFrame(meterFrame);
    audio.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    void context?.close();
  };
}
