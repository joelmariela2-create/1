let audioContext: AudioContext | null = null;
let entranceSoundHasPlayed = false;
let entranceSoundInFlight = false;

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
  }: {
    frequency: number;
    endFrequency?: number;
    start: number;
    duration: number;
    volume: number;
    type?: OscillatorType;
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
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

async function startAudio() {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === 'suspended') await context.resume();
  return context;
}

export function playEntranceSound() {
  if (entranceSoundHasPlayed || entranceSoundInFlight) return;
  entranceSoundInFlight = true;
  void startAudio().then((context) => {
    if (!context) return;
    entranceSoundHasPlayed = true;
    const start = context.currentTime + 0.01;
    // A short rising sweep with a low impact gives the storefront an athletic arrival cue.
    playTone(context, { frequency: 110, endFrequency: 62, start, duration: 0.42, volume: 0.08, type: 'sine' });
    playTone(context, { frequency: 220, endFrequency: 520, start: start + 0.04, duration: 0.24, volume: 0.045, type: 'triangle' });
    playTone(context, { frequency: 880, endFrequency: 660, start: start + 0.2, duration: 0.16, volume: 0.03, type: 'square' });
  }).catch(() => {
    // Autoplay restrictions are expected in some browsers; the interaction fallback retries later.
  }).finally(() => {
    entranceSoundInFlight = false;
  });
}

export function playCartBell() {
  void startAudio().then((context) => {
    if (!context) return;
    const start = context.currentTime + 0.01;
    // Two clean notes create a compact notification bell without being harsh.
    playTone(context, { frequency: 1046.5, endFrequency: 1046.5, start, duration: 0.16, volume: 0.055, type: 'sine' });
    playTone(context, { frequency: 1318.5, endFrequency: 1318.5, start: start + 0.11, duration: 0.25, volume: 0.05, type: 'sine' });
  }).catch(() => {
    // A blocked context should never interrupt the shopping flow.
  });
}