let audioContext: AudioContext | null = null;
let entranceSoundHasPlayed = false;
let entranceSoundInFlight = false;
let backgroundMusicHasStarted = false;
let backgroundMusicInFlight = false;
let backgroundMusicTimer: number | null = null;
let backgroundMusicMaster: GainNode | null = null;
let backgroundMusicBar = 0;
let backgroundMusicNextBar = 0;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(
  context: AudioContext,
  {
    frequency,
    endFrequency = frequency,
    start,
    duration,
    volume,
    type = 'sine',
    output,
  }: {
    frequency: number;
    endFrequency?: number;
    start: number;
    duration: number;
    volume: number;
    type?: OscillatorType;
    output?: AudioNode;
  },
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(output ?? context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

async function startAudio(allowResume = false) {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === 'suspended') {
    if (!allowResume) return null;
    await context.resume();
  }
  if (context.state !== 'running') return null;
  return context;
}

export function playEntranceSound(fromUserInteraction = false) {
  if (entranceSoundHasPlayed || entranceSoundInFlight) return;
  entranceSoundInFlight = true;
  void startAudio(fromUserInteraction).then((context) => {
    if (!context) return;
    entranceSoundHasPlayed = true;
    const start = context.currentTime + 0.01;
    // A short rising sweep with a low impact gives the storefront an athletic arrival cue.
    playTone(context, { frequency: 110, endFrequency: 62, start, duration: 0.42, volume: 0.16, type: 'sine' });
    playTone(context, { frequency: 220, endFrequency: 520, start: start + 0.04, duration: 0.24, volume: 0.09, type: 'triangle' });
    playTone(context, { frequency: 880, endFrequency: 660, start: start + 0.2, duration: 0.16, volume: 0.06, type: 'square' });
  }).catch(() => {
    // Autoplay restrictions are expected in some browsers; the interaction fallback retries later.
  }).finally(() => {
    entranceSoundInFlight = false;
  });
}

export function playCartBell() {
  void startAudio(true).then((context) => {
    if (!context) return;
    const start = context.currentTime + 0.01;
    // Two clean notes create a compact notification bell without being harsh.
    playTone(context, { frequency: 1046.5, endFrequency: 1046.5, start, duration: 0.16, volume: 0.055, type: 'sine' });
    playTone(context, { frequency: 1318.5, endFrequency: 1318.5, start: start + 0.11, duration: 0.25, volume: 0.05, type: 'sine' });
  }).catch(() => {
    // A blocked context should never interrupt the shopping flow.
  });
}

function playNoise(
  context: AudioContext,
  output: AudioNode,
  {
    start,
    duration,
    volume,
    frequency,
  }: { start: number; duration: number; volume: number; frequency: number },
) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  source.start(start);
  source.stop(start + duration + 0.01);
}

function scheduleMusicBar(context: AudioContext, start: number, bar: number) {
  if (!backgroundMusicMaster) return;
  const beatDuration = 60 / 124;
  const rootNotes = [73.42, 73.42, 87.31, 98];
  const chordNotes = [
    [293.66, 349.23, 440],
    [261.63, 329.63, 392],
    [293.66, 369.99, 440],
    [277.18, 349.23, 415.3],
  ];

  for (let beat = 0; beat < 4; beat += 1) {
    const beatStart = start + beat * beatDuration;
    playTone(context, { frequency: 170, endFrequency: 48, start: beatStart, duration: 0.16, volume: 0.72, type: 'sine', output: backgroundMusicMaster });
    playTone(context, { frequency: rootNotes[(bar + beat) % rootNotes.length], endFrequency: rootNotes[(bar + beat) % rootNotes.length] * 0.98, start: beatStart + 0.02, duration: 0.34, volume: 0.42, type: 'sawtooth', output: backgroundMusicMaster });
    if (beat === 1 || beat === 3) playNoise(context, backgroundMusicMaster, { start: beatStart, duration: 0.12, volume: 0.22, frequency: 1200 });
    playNoise(context, backgroundMusicMaster, { start: beatStart + beatDuration / 2, duration: 0.035, volume: 0.06, frequency: 5200 });
  }

  const chord = chordNotes[bar % chordNotes.length];
  const output = backgroundMusicMaster;
  if (!output) return;
  chord.forEach((frequency, index) => {
    playTone(context, { frequency, endFrequency: frequency * 1.002, start: start + index * 0.018, duration: beatDuration * 1.8, volume: 0.045, type: 'triangle', output });
  });
}

export function startBackgroundMusic(fromUserInteraction = false) {
  if (backgroundMusicHasStarted || backgroundMusicInFlight) return;
  backgroundMusicInFlight = true;
  void startAudio(fromUserInteraction).then((context) => {
    if (!context) return;
    backgroundMusicHasStarted = true;
    backgroundMusicMaster = context.createGain();
    backgroundMusicMaster.gain.setValueAtTime(0.0001, context.currentTime);
    backgroundMusicMaster.gain.exponentialRampToValueAtTime(0.085, context.currentTime + 0.7);
    backgroundMusicMaster.connect(context.destination);
    const barDuration = (60 / 124) * 4;
    backgroundMusicNextBar = context.currentTime + 0.05;
    scheduleMusicBar(context, backgroundMusicNextBar, backgroundMusicBar);
    backgroundMusicNextBar += barDuration;
    backgroundMusicBar += 1;
    backgroundMusicTimer = window.setInterval(() => {
      while (backgroundMusicNextBar < context.currentTime + 0.35) {
        scheduleMusicBar(context, backgroundMusicNextBar, backgroundMusicBar);
        backgroundMusicNextBar += barDuration;
        backgroundMusicBar += 1;
      }
    }, 180);
  }).catch(() => {
    // The music retries from the first user interaction if autoplay is blocked.
  }).finally(() => {
    backgroundMusicInFlight = false;
  });
}