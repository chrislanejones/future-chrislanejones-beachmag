// Record what the radio plays on FM and AM.
// FM is a music station: a late-night DJ shouts the call letters over static, then
// plays "By the Sea" (Chris's own song, made with Suno: design/audio/by-the-sea.mp3)
// by the made-up band Sea Oat Revival, and back-announces it over the fade.
// AM is a preaching station, reading the King James Bible (public domain in the US)
// down a telephone-thin, crackling signal.
// Needs ffmpeg (with rubberband) and the local Kokoro voice in ~/repo/smart-voice.
// Run from the repo root: pnpm audio:static
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = 'public/audio';
const SPEAK = join(homedir(), 'repo/smart-voice/speak');
const SONG = 'design/audio/by-the-sea.mp3';
const RATE = 44100;

const AM = {
  id: 'am',
  seconds: 60,
  bitrate: '64k',
  loudness: -19, // talk and static read louder than music, so AM sits under the tapes' -16 LUFS
  // AM is a telephone: nothing above about 3 kHz, voice and noise alike.
  hissBand: 'highpass=f=280,lowpass=f=3200',
  hissGain: 0.4,
  fading: '0.62+0.26*sin(2*PI*t*0.13)+0.12*sin(2*PI*t*0.41)',
  crackle: 0.8,
  // A thin organ chord (C major) swelling under the preacher, plus power-line buzz.
  tones: '0.012*(0.6+0.4*sin(2*PI*t*0.05))*(sin(2*PI*261.63*t)+sin(2*PI*329.63*t)+sin(2*PI*392*t))+0.014*sin(2*PI*120*t)+0.006*sin(2*PI*360*t)',
  // A touch of hall, then squeezed down the AM band and clipped like an old set.
  voiceChain: 'highpass=f=320,lowpass=f=2800,aecho=0.85:0.7:70|130:0.22|0.12,acompressor=threshold=0.08:ratio=5:attack=5:release=150:makeup=4,asoftclip=type=hard',
  voiceGain: 0.62,
  voiceFading: '0.74+0.26*sin(2*PI*t*0.17)',
  agcRatio: 1.8,
  voice: 'am_onyx',
  speed: '0.86',
  lines: [
    {
      at: 2,
      // Matthew 7:24-26, King James Version.
      text: 'Therefore whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a rock. And the rain descended, and the floods came, and the winds blew, and beat upon that house. And it fell not! For it was founded upon a rock. And every one that heareth these sayings of mine, and doeth them not, shall be likened unto a foolish man, which built his house upon the sand.',
    },
    { at: 50, text: 'You are listening to W, C, L, J, A M.' },
  ],
};

const FM = {
  id: 'fm',
  bitrate: '96k',
  loudness: -16, // a music station, level with the tapes
  // The DJ: a deep voice pitched down and driven a little hot, for the gravel.
  dj: { voice: 'am_fenrir', speed: '0.98', chain: 'rubberband=pitch=0.86,highpass=f=80,lowpass=f=9000,equalizer=f=2600:t=q:w=1.2:g=4,volume=2.2,asoftclip=type=tanh,acompressor=threshold=0.1:ratio=4:attack=3:release=120:makeup=2' },
  intro: 'Ah-woooooo! Oh yeah, baby! You found it! W, C, L, J, F M, one hundred thousand watts, blowin\' straight off the beach and right into your radio! Here comes Sea Oat Revival, with By the Sea. Turn it up!',
  outro: 'Ooh, that was Sea Oat Revival, By the Sea. W, C, L, J, F M. One hundred thousand watts! Ah-woooo!',
};

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const duration = (path) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8' }));

function speak(text, path, { voice, speed }) {
  const script = `${path}.txt`;
  writeFileSync(script, `${text}\n`);
  execFileSync(SPEAK, [script, path], { env: { ...process.env, ENGINE: 'kokoro', VOICE: voice, RATE: speed }, stdio: 'ignore' });
}

// Static: band-limited hiss under a gain curve, plus crackle.
const hiss = (d, band, gain, label) => `anoisesrc=d=${d}:c=white:a=0.9:r=${RATE}:s=11,${band},volume='${gain}':eval=frame[${label}]`;
const crackle = (d, amount, label) =>
  // Random clicks, thicker during passing bursts of lightning-like noise.
  `aevalsrc='${amount}*if(gt(random(0),0.9993-0.004*gt(sin(t*0.9)*sin(t*0.23),0.55)),2*(random(1)-0.5),0)':s=${RATE}:d=${d},lowpass=f=4200[${label}]`;
const mono = `aformat=channel_layouts=mono:sample_rates=${RATE}`;

function amGraph(band, voiceInputs) {
  const d = band.seconds;
  const parts = [hiss(d, band.hissBand, `${band.hissGain}*(${band.fading})`, 'hissraw'), crackle(d, band.crackle, 'crackle'), `aevalsrc='${band.tones}':s=${RATE}:d=${d}[tones]`];
  const delayed = voiceInputs.map(({ input, at }, i) => {
    parts.push(`[${input}:a]${mono},adelay=${at * 1000}:all=1[line${i}]`);
    return `[line${i}]`;
  });
  parts.push(`${delayed.join('')}amix=inputs=${delayed.length}:normalize=0:duration=longest,apad=whole_dur=${d},atrim=0:${d},${band.voiceChain},volume='${band.voiceGain}*(${band.voiceFading})':eval=frame,asplit=2[voice][key]`);
  // The receiver's AGC: when a signal comes up, the noise ducks under it.
  parts.push(`[hissraw][key]sidechaincompress=threshold=0.015:ratio=${band.agcRatio}:attack=15:release=350[hiss]`);
  // Fading out and back in at the seam hides the gap an MP3 leaves when it loops.
  parts.push(`[hiss][crackle][tones][voice]amix=inputs=4:normalize=0:duration=first,afade=t=in:d=0.5,afade=t=out:st=${d - 0.5}:d=0.5[out]`);
  return parts.join(';');
}

// FM: inputs are 0 = the song, 1 = the intro, 2 = the outro.
function fmGraph(t) {
  const d = t.total.toFixed(2);
  const tail = (t.total - 2).toFixed(2);
  return [
    // Tuning in: a loud rush of static that settles to a faint hiss, and swells again
    // in the last two seconds as the loop comes round.
    hiss(d, 'highpass=f=200,lowpass=f=12000', `0.03+0.4*exp(-t*1.8)+0.25*gt(t,${tail})*(t-${tail})/2`, 'hissraw'),
    crackle(d, 0.08, 'crackle'),
    // Broadcast chain: mono, the FM band's 15 kHz ceiling, a firm compressor, and the
    // signal drifting a hair in and out.
    `[0:a]${mono},highpass=f=40,lowpass=f=15000,acompressor=threshold=0.15:ratio=3:attack=10:release=200:makeup=1.5,volume='0.94+0.06*sin(2*PI*t*0.11)':eval=frame,adelay=${Math.round(t.songAt * 1000)}:all=1,apad=whole_dur=${d}[songraw]`,
    `[1:a]${mono},${FM.dj.chain},adelay=${Math.round(t.introAt * 1000)}:all=1[intro]`,
    `[2:a]${mono},${FM.dj.chain},adelay=${Math.round(t.outroAt * 1000)}:all=1[outro]`,
    `[intro][outro]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=${d},atrim=0:${d},asplit=3[voice][key1][key2]`,
    // The song ducks under the DJ, and the hiss ducks under any signal.
    `[songraw][key1]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=500,asplit=2[song][songkey]`,
    `[songkey][key2]amix=inputs=2:normalize=0[signal]`,
    `[hissraw][signal]sidechaincompress=threshold=0.015:ratio=2:attack=15:release=350[hiss]`,
    `[hiss][crackle][song][voice]amix=inputs=4:normalize=0:duration=first,atrim=0:${d},afade=t=in:d=0.3,afade=t=out:st=${(t.total - 0.4).toFixed(2)}:d=0.4[out]`,
  ].join(';');
}

function measuredLoudness(inputs, filter) {
  const log = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -nostats "$@" 2>&1', 'sh', ...inputs, '-filter_complex', `${filter};[out]ebur128=framelog=quiet[final]`, '-map', '[final]', '-f', 'null', '-'], { encoding: 'utf8' });
  const match = [...log.matchAll(/\bI:\s+(-?[\d.]+) LUFS/g)].pop();
  if (!match) throw new Error('Could not measure loudness');
  return Number(match[1]);
}

function render(id, inputs, filter, loudness, bitrate) {
  const gain = loudness - measuredLoudness(inputs, filter);
  const output = `${OUT}/wclj-${id}.mp3`;
  ffmpeg(...inputs, '-filter_complex', `${filter};[out]volume=${gain.toFixed(2)}dB,alimiter=limit=0.89:level=disabled[final]`, '-map', '[final]', '-ac', '1', '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', bitrate, output);
  return output;
}

const scratch = mkdtempSync(join(tmpdir(), 'radio-static-'));
try {
  const amInputs = [];
  const amVoices = AM.lines.map(({ at, text }, i) => {
    const path = join(scratch, `am-${i}.mp3`);
    speak(text, path, AM);
    amInputs.push('-i', path);
    return { input: i, at };
  });
  console.log(`am: ${AM.seconds}s → ${render('am', amInputs, amGraph(AM, amVoices), AM.loudness, AM.bitrate)}`);

  const intro = join(scratch, 'fm-intro.mp3');
  const outro = join(scratch, 'fm-outro.mp3');
  speak(FM.intro, intro, FM.dj);
  speak(FM.outro, outro, FM.dj);
  // The DJ comes in over the static, the song starts as he says "turn it up", and he
  // back-announces over the song's fade. The song ends in about 3 s of fade and silence.
  const song = duration(SONG);
  const introAt = 1.2;
  const songAt = introAt + duration(intro) - 0.4;
  const songEnd = songAt + song - 2.5;
  const outroAt = songEnd - 2;
  const total = outroAt + duration(outro) + 2.5;
  const timing = { introAt, songAt, outroAt, total };
  const output = render('fm', ['-i', SONG, '-i', intro, '-i', outro], fmGraph(timing), FM.loudness, FM.bitrate);
  console.log(`fm: ${total.toFixed(1)}s, song at ${songAt.toFixed(1)}s, outro at ${outroAt.toFixed(1)}s → ${output}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
