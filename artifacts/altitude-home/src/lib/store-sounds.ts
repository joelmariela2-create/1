let audioContext: AudioContext | null = null;
let entranceSoundHasPlayed = false;
let entranceSoundInFlight = false;
let backgroundMusic: HTMLAudioElement | null = null;

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
    filterFrequency,
  }: {
    frequency: number;
    endFrequency?: number;
    start: number;
    duration: number;
    volume: number;
    type?: OscillatorType;
    output?: AudioNode;
    filterFrequency?: number;
  },
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = filterFrequency ? context.createBiquadFilter() : null;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  if (filter) {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrequency ?? 1200, start);
    filter.Q.setValueAtTime(0.65, start);
    oscillator.connect(filter);
    filter.connect(gain);
  } else {
    oscillator.connect(gain);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
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
    playTone(context, { frequency: 220, endFrequency: 520, start: start + 0.04, duration: 0.24, volume: 0.09, type: 'triangle', filterFrequency: 1800 });
    playTone(context, { frequency: 660, endFrequency: 880, start: start + 0.2, duration: 0.18, volume: 0.05, type: 'triangle', filterFrequency: 2400 });
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

export function startBackgroundMusic(fromUserInteraction = false) {
  if (!fromUserInteraction || typeof window === 'undefined') return;
  if (!backgroundMusic) {
    backgroundMusic = new Audio('/olympo-sport-background.mp3');
    backgroundMusic.loop = true;
    // Do not download the soundtrack until the first intentional interaction.
    backgroundMusic.preload = 'none';
    backgroundMusic.volume = 0.22;
  }
  if (!backgroundMusic.paused) return;
  void backgroundMusic.play().catch(() => {
    // The browser may still reject playback; the next gesture can retry it.
  });
}