// Render the radio's stations with the bckgrnd-msc engine, then encode each to MP3.
// Run from the repo root: pnpm run build:tracks
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findTrack } from 'bckgrnd-msc-mcp/dist/library.js';
import { renderTrack } from 'bckgrnd-msc-mcp/dist/render.js';

const STATIONS = ['lowtide', 'basement', 'southside', 'study'];
const SECONDS = 90;
const OUT = 'outputs/audio';

mkdirSync(OUT, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'radio-tracks-'));
try {
  for (const id of STATIONS) {
    const track = findTrack(id);
    if (!track) throw new Error(`bckgrnd-msc has no track called "${id}"`);
    const wav = join(scratch, `${id}.wav`);
    await renderTrack({ track, seconds: SECONDS, outputPath: wav, fadeInSeconds: 0.5, fadeOutSeconds: 4 });
    // Same loudness on every station, so changing the dial doesn't jump the volume.
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
      '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k',
      join(OUT, `${id}.mp3`)]);
    console.log(`${track.name} · ${track.bpm} bpm · ${SECONDS}s → ${OUT}/${id}.mp3`);
  }
} finally {
  for (const id of STATIONS) rmSync(join(scratch, `${id}.wav`), { force: true });
  rmdirSync(scratch);
}
