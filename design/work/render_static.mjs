// Record what the radio plays on FM and AM, all of it free of anyone's copyright.
// AM is static with a talk-radio voice breaking through for the call letters; FM
// is a preaching station, reading the King James Bible (public domain in the US).
// Needs ffmpeg and the local Kokoro voice in ~/repo/smart-voice.
// Run from the repo root: pnpm audio:static
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = 'public/audio';
const SPEAK = join(homedir(), 'repo/smart-voice/speak');
const RATE = 44100;

const BANDS = [
  {
    id: 'am',
    seconds: 40,
    bitrate: '64k',
    loudness: -19, // static reads louder than music, so it sits under the tapes' -16 LUFS
    // AM is a telephone: nothing above about 3 kHz, voice and noise alike.
    hissBand: 'highpass=f=280,lowpass=f=3200',
    hissGain: 0.55,
    fading: '0.62+0.26*sin(2*PI*t*0.13)+0.12*sin(2*PI*t*0.41)',
    crackle: 0.9,
    // A neighbor's carrier whistling, plus power-line buzz.
    tones: '0.014*sin(2*PI*t*(1430+25*sin(t*0.4)))+0.018*sin(2*PI*120*t)+0.008*sin(2*PI*360*t)',
    music: { track: 'study', band: 'highpass=f=350,lowpass=f=2400', gain: 0.1 },
    voiceChain: 'highpass=f=520,lowpass=f=2500,acompressor=threshold=0.08:ratio=6:attack=5:release=120:makeup=4,asoftclip=type=hard',
    voiceGain: 0.62,
    voiceFading: '0.74+0.26*sin(2*PI*t*2.3)',
    agcRatio: 1.6,
    voice: 'am_michael',
    speed: '0.92',
    lines: [
      { at: 7, text: 'W, C, L, J.' },
      { at: 27, text: 'This is W, C, L, J, A M.' },
    ],
  },
  {
    id: 'fm',
    seconds: 60,
    bitrate: '64k',
    loudness: -20,
    // Weak FM: a wide bright hiss over the sermon, with the signal drifting in and out.
    hissBand: 'highpass=f=180,lowpass=f=9000',
    hissGain: 0.2,
    fading: '0.8+0.14*sin(2*PI*t*0.09)+0.06*sin(2*PI*t*0.53)',
    crackle: 0.1,
    // A plain synthesized organ chord (C major) swelling under the preacher.
    tones: '0.012*(0.6+0.4*sin(2*PI*t*0.05))*(sin(2*PI*130.81*t)+sin(2*PI*164.81*t)+sin(2*PI*196*t)+0.5*sin(2*PI*261.63*t))',
    // A touch of hall on the voice, so it sounds like a room and not a booth.
    voiceChain: 'highpass=f=150,lowpass=f=6000,aecho=0.85:0.7:70|130:0.22|0.12,acompressor=threshold=0.1:ratio=3:attack=5:release=150:makeup=2',
    voiceGain: 0.6,
    voiceFading: '0.72+0.28*sin(2*PI*t*0.17)',
    agcRatio: 2,
    voice: 'am_onyx',
    speed: '0.86',
    lines: [
      {
        at: 2,
        // Matthew 7:24-26, King James Version.
        text: 'Therefore whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a rock. And the rain descended, and the floods came, and the winds blew, and beat upon that house. And it fell not! For it was founded upon a rock. And every one that heareth these sayings of mine, and doeth them not, shall be likened unto a foolish man, which built his house upon the sand.',
      },
      { at: 50, text: 'You are listening to W, C, L, J, F M.' },
    ],
  },
];

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function speak(text, path, { voice, speed }) {
  const script = `${path}.txt`;
  writeFileSync(script, `${text}\n`);
  execFileSync(SPEAK, [script, path], { env: { ...process.env, ENGINE: 'kokoro', VOICE: voice, RATE: speed }, stdio: 'ignore' });
}

function graph(band, voiceInputs, hasMusic) {
  const d = band.seconds;
  const parts = [
    `anoisesrc=d=${d}:c=white:a=0.9:r=${RATE}:s=11,${band.hissBand},volume='${band.hissGain}*(${band.fading})':eval=frame[hissraw]`,
    // Crackle: random clicks, thicker during passing bursts of lightning-like noise.
    `aevalsrc='${band.crackle}*if(gt(random(0),0.9993-0.004*gt(sin(t*0.9)*sin(t*0.23),0.55)),2*(random(1)-0.5),0)':s=${RATE}:d=${d},lowpass=f=4200[crackle]`,
    `aevalsrc='${band.tones}':s=${RATE}:d=${d}[tones]`,
  ];
  if (hasMusic) parts.push(`[0:a]aformat=channel_layouts=mono:sample_rates=${RATE},${band.music.band},volume='${band.music.gain}*(0.55+0.45*sin(2*PI*t*0.07))':eval=frame[music]`);
  const delayed = voiceInputs.map(({ input, at }, i) => {
    parts.push(`[${input}:a]aformat=channel_layouts=mono:sample_rates=${RATE},adelay=${at * 1000}:all=1[line${i}]`);
    return `[line${i}]`;
  });
  parts.push(`${delayed.join('')}amix=inputs=${delayed.length}:normalize=0:duration=longest,apad=whole_dur=${d},atrim=0:${d},${band.voiceChain},volume='${band.voiceGain}*(${band.voiceFading})':eval=frame,asplit=2[voice][key]`);
  // The receiver's AGC: when a signal comes up, the noise ducks under it.
  parts.push(`[hissraw][key]sidechaincompress=threshold=0.015:ratio=${band.agcRatio}:attack=15:release=350[hiss]`);
  // Fading out and back in at the seam hides the gap an MP3 leaves when it loops.
  parts.push(`[hiss][crackle][tones]${hasMusic ? '[music]' : ''}[voice]amix=inputs=${hasMusic ? 5 : 4}:normalize=0:duration=first,afade=t=in:d=0.5,afade=t=out:st=${d - 0.5}:d=0.5[out]`);
  return parts.join(';');
}

function measuredLoudness(inputs, filter) {
  const log = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -nostats "$@" 2>&1', 'sh', ...inputs, '-filter_complex', `${filter};[out]ebur128=framelog=quiet[final]`, '-map', '[final]', '-f', 'null', '-'], { encoding: 'utf8' });
  const match = [...log.matchAll(/\bI:\s+(-?[\d.]+) LUFS/g)].pop();
  if (!match) throw new Error('Could not measure loudness');
  return Number(match[1]);
}

const scratch = mkdtempSync(join(tmpdir(), 'radio-static-'));
try {
  for (const band of BANDS) {
    const inputs = band.music ? ['-i', `${OUT}/${band.music.track}.mp3`] : [];
    const firstVoice = inputs.length / 2;
    const voiceInputs = band.lines.map(({ at, text }, i) => {
      const path = join(scratch, `${band.id}-${i}.mp3`);
      speak(text, path, band);
      inputs.push('-i', path);
      return { input: firstVoice + i, at };
    });
    const filter = graph(band, voiceInputs, Boolean(band.music));
    const gain = band.loudness - measuredLoudness(inputs, filter);
    const output = `${OUT}/${band.id}-static.mp3`;
    ffmpeg(...inputs, '-filter_complex', `${filter};[out]volume=${gain.toFixed(2)}dB,alimiter=limit=0.89:level=disabled[final]`, '-map', '[final]', '-ac', '1', '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', band.bitrate, output);
    console.log(`${band.id}: ${band.seconds}s, ${band.lines.length} voice line(s) → ${output}`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
