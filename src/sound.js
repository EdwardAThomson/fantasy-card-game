// Sound effects, synthesised with the Web Audio API.
//
// Every sound is built from oscillators and filtered noise at play time, so
// there are no audio files to download or license. Browsers only allow audio
// after the player interacts with the page, so the audio context is created
// on the first pointer or key press.
//
// Settings (muted, volume) persist in localStorage and are shared with React
// through subscribe()/getSettings() for useSyncExternalStore.

const STORAGE_KEY = 'fcg.sound';
const DEFAULT_SETTINGS = { muted: false, volume: 0.7 };

const readSettings = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const volume = Number(parsed.volume);
    return {
      muted: !!parsed.muted,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_SETTINGS.volume,
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

let settings = typeof window === 'undefined' ? DEFAULT_SETTINGS : readSettings();
const listeners = new Set();

export const getSettings = () => settings;
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

let ctx = null;
let master = null;
let noiseBuffer = null;

// Perceived loudness is roughly logarithmic, so square the slider value.
const masterLevel = () => (settings.muted ? 0 : settings.volume * settings.volume * 0.9);

const updateSettings = (patch) => {
  settings = { ...settings, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // Storage can be unavailable (private mode); settings last for the visit.
  }
  if (master) master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.02);
  listeners.forEach(fn => fn());
};

export const setMuted = (muted) => updateSettings({ muted });
export const setVolume = (volume) => updateSettings({ volume, muted: volume === 0 ? settings.muted : false });

function ensureContext() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AudioCtx) return null;
  try {
    ctx = new AudioCtx();
  } catch (e) {
    return null;
  }
  // A gentle compressor keeps overlapping effects from clipping.
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  master = ctx.createGain();
  master.gain.value = masterLevel();
  master.connect(comp);
  comp.connect(ctx.destination);

  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

// Called once at start-up: the first interaction unlocks audio, and clicks on
// ordinary buttons get a UI tick. Elements that play their own sound opt out
// with data-sfx="off".
let installed = false;
export function installSound() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const unlock = () => ensureContext();
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const el = target && target.closest('button, a[href], [role="button"], [role="tab"]');
    if (!el || el.disabled || el.closest('[data-sfx="off"]')) return;
    play('click');
  }, true);
}

// ---------------------------------------------------------------------------
// Building blocks

const envelope = (param, t, peak, attack, dur) => {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + dur);
};

// One oscillator note with an optional pitch glide.
function tone({ at = 0, type = 'sine', freq = 440, to, dur = 0.2, gain = 0.3, attack = 0.005, detune = 0, dest }) {
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  envelope(g.gain, t, gain, attack, dur);
  osc.connect(g);
  g.connect(dest || master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// A burst of filtered noise, with an optional filter sweep.
function noise({ at = 0, dur = 0.2, gain = 0.3, attack = 0.005, filter = 'bandpass', freq = 1000, to, q = 1, dest }) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  envelope(g.gain, t, gain, attack, dur);
  src.connect(f);
  f.connect(g);
  g.connect(dest || master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

const chord = (notes, opts) => notes.forEach((freq, i) => tone({ ...opts, freq, at: (opts.at || 0) + i * (opts.spread || 0) }));

// ---------------------------------------------------------------------------
// The sounds

const SOUNDS = {
  // Interface
  click: () => {
    tone({ type: 'triangle', freq: 1250, to: 900, dur: 0.05, gain: 0.12 });
    noise({ dur: 0.025, gain: 0.05, filter: 'highpass', freq: 3000 });
  },
  select: () => { // a card slid out of the hand
    noise({ dur: 0.12, gain: 0.22, filter: 'bandpass', freq: 1800, to: 4200, q: 1.2 });
    tone({ type: 'sine', freq: 220, to: 120, dur: 0.09, gain: 0.25 });
  },
  deselect: () => {
    noise({ dur: 0.1, gain: 0.16, filter: 'bandpass', freq: 3500, to: 1500, q: 1.2 });
  },
  flip: () => { // two quick swishes as the card turns over
    noise({ dur: 0.08, gain: 0.2, filter: 'bandpass', freq: 2500, to: 5000, q: 1.5 });
    noise({ at: 0.11, dur: 0.1, gain: 0.24, filter: 'bandpass', freq: 4500, to: 1800, q: 1.5 });
    tone({ at: 0.2, type: 'sine', freq: 180, to: 110, dur: 0.08, gain: 0.2 });
  },

  // Choosing an attack style
  styleMelee: () => {
    tone({ type: 'triangle', freq: 1480, dur: 0.35, gain: 0.12 });
    tone({ type: 'sine', freq: 2960, detune: 12, dur: 0.25, gain: 0.06 });
    noise({ dur: 0.04, gain: 0.08, filter: 'highpass', freq: 5000 });
  },
  styleRanged: () => {
    tone({ type: 'sawtooth', freq: 196, to: 180, dur: 0.22, gain: 0.08 });
    tone({ type: 'triangle', freq: 392, to: 370, dur: 0.2, gain: 0.08 });
  },
  styleMagic: () => chord([784, 988, 1319], { type: 'sine', dur: 0.3, gain: 0.07, spread: 0.04 }),

  // Attacks
  swingMelee: () => noise({ dur: 0.22, gain: 0.35, filter: 'bandpass', freq: 500, to: 2600, q: 0.8, attack: 0.04 }),
  swingRanged: () => {
    tone({ type: 'sawtooth', freq: 160, to: 140, dur: 0.18, gain: 0.12 });
    noise({ at: 0.03, dur: 0.18, gain: 0.22, filter: 'bandpass', freq: 3000, to: 900, q: 2 });
  },
  swingMagic: () => {
    chord([523, 659, 784, 1047], { type: 'sine', dur: 0.25, gain: 0.07, spread: 0.035 });
    noise({ dur: 0.3, gain: 0.08, filter: 'highpass', freq: 6000, attack: 0.08 });
  },
  hit: () => {
    tone({ type: 'sine', freq: 140, to: 45, dur: 0.22, gain: 0.55 });
    noise({ dur: 0.09, gain: 0.3, filter: 'lowpass', freq: 2500, to: 400 });
  },
  dot: () => noise({ dur: 0.25, gain: 0.12, filter: 'bandpass', freq: 900, to: 400, q: 2, attack: 0.03 }),
  heal: () => chord([659, 831, 988, 1319], { type: 'sine', dur: 0.6, gain: 0.08, spread: 0.07, attack: 0.02 }),
  ko: () => {
    tone({ type: 'sawtooth', freq: 220, to: 55, dur: 0.6, gain: 0.12 });
    tone({ at: 0.05, type: 'sine', freq: 90, to: 35, dur: 0.5, gain: 0.5 });
    noise({ at: 0.05, dur: 0.4, gain: 0.2, filter: 'lowpass', freq: 800, to: 120 });
  },

  // Ability families (match the visual families in AbilityEffect.js)
  fire: () => {
    noise({ dur: 0.7, gain: 0.35, filter: 'lowpass', freq: 400, to: 2200, attack: 0.08 });
    noise({ at: 0.1, dur: 0.5, gain: 0.12, filter: 'bandpass', freq: 3000, q: 3 });
  },
  frost: () => {
    [2093, 2637, 3136, 2349, 2794].forEach((f, i) => tone({ at: i * 0.05, type: 'sine', freq: f, dur: 0.25, gain: 0.07 }));
    noise({ dur: 0.35, gain: 0.1, filter: 'highpass', freq: 5000 });
  },
  lightning: () => {
    noise({ dur: 0.05, gain: 0.5, filter: 'highpass', freq: 1500 });
    tone({ type: 'square', freq: 1800, to: 80, dur: 0.18, gain: 0.08 });
    noise({ at: 0.04, dur: 0.6, gain: 0.3, filter: 'lowpass', freq: 600, to: 100 });
  },
  nature: () => {
    for (let i = 0; i < 4; i++) noise({ at: i * 0.07, dur: 0.12, gain: 0.12, filter: 'bandpass', freq: 2500 + i * 400, q: 2 });
    tone({ type: 'triangle', freq: 330, to: 440, dur: 0.35, gain: 0.08, attack: 0.05 });
  },
  earth: () => {
    tone({ type: 'sine', freq: 80, to: 35, dur: 0.5, gain: 0.6 });
    noise({ dur: 0.45, gain: 0.35, filter: 'lowpass', freq: 500, to: 80 });
    noise({ at: 0.08, dur: 0.12, gain: 0.15, filter: 'bandpass', freq: 1200, q: 2 });
  },
  wind: () => noise({ dur: 0.6, gain: 0.3, filter: 'bandpass', freq: 400, to: 2400, q: 3, attack: 0.15 }),
  shield: () => {
    [523, 1307, 2194, 3011].forEach((f, i) => tone({ type: 'sine', freq: f, dur: 0.7 - i * 0.12, gain: 0.12 / (i + 1) }));
    noise({ dur: 0.04, gain: 0.2, filter: 'highpass', freq: 3000 });
  },
  stun: () => {
    tone({ type: 'triangle', freq: 1400, to: 500, dur: 0.25, gain: 0.1 });
    tone({ at: 0.18, type: 'triangle', freq: 1200, to: 450, dur: 0.25, gain: 0.08 });
    tone({ at: 0.36, type: 'triangle', freq: 1000, to: 400, dur: 0.25, gain: 0.06 });
  },
  dark: () => {
    tone({ type: 'sawtooth', freq: 110, to: 55, dur: 0.8, gain: 0.1, attack: 0.1 });
    tone({ type: 'sawtooth', freq: 116, to: 58, dur: 0.8, gain: 0.08, attack: 0.1 });
    noise({ dur: 0.7, gain: 0.15, filter: 'lowpass', freq: 1200, to: 150, attack: 0.1 });
  },
  arcane: () => {
    [523, 784, 1047, 1568, 2093].forEach((f, i) => tone({ at: i * 0.045, type: 'sine', freq: f, dur: 0.35, gain: 0.07 }));
    noise({ dur: 0.4, gain: 0.07, filter: 'highpass', freq: 7000, attack: 0.05 });
  },
  light: () => {
    chord([880, 1109, 1319, 1760], { type: 'sine', dur: 0.8, gain: 0.07, attack: 0.15 });
    noise({ dur: 0.6, gain: 0.06, filter: 'highpass', freq: 8000, attack: 0.1 });
  },
  slash: () => {
    noise({ dur: 0.1, gain: 0.35, filter: 'highpass', freq: 2500, to: 6000 });
    noise({ at: 0.12, dur: 0.1, gain: 0.3, filter: 'highpass', freq: 3000, to: 7000 });
    tone({ at: 0.02, type: 'sine', freq: 150, to: 60, dur: 0.15, gain: 0.3 });
  },
  shot: () => {
    tone({ type: 'sawtooth', freq: 150, to: 130, dur: 0.15, gain: 0.12 });
    noise({ at: 0.02, dur: 0.15, gain: 0.25, filter: 'bandpass', freq: 3500, to: 1200, q: 2 });
    tone({ at: 0.17, type: 'sine', freq: 200, to: 70, dur: 0.12, gain: 0.4 });
  },

  // Results
  roundWin: () => chord([523, 659, 784, 1047], { type: 'triangle', dur: 0.45, gain: 0.12, spread: 0.08 }),
  roundLoss: () => chord([392, 311, 262], { type: 'triangle', dur: 0.5, gain: 0.12, spread: 0.12 }),
  gameWin: () => {
    chord([523, 659, 784], { type: 'triangle', dur: 0.22, gain: 0.12, spread: 0.12 });
    chord([1047, 1319, 1568], { at: 0.4, type: 'triangle', dur: 1.2, gain: 0.08 });
    chord([523, 784], { at: 0.4, type: 'sawtooth', dur: 1.2, gain: 0.03, attack: 0.05 });
  },
  gameLoss: () => {
    chord([392, 370, 311], { type: 'triangle', dur: 0.4, gain: 0.12, spread: 0.25 });
    chord([131, 156, 196], { at: 0.75, type: 'triangle', dur: 1.4, gain: 0.1, attack: 0.05 });
  },
};

// Don't stack the same sound when several things trigger it at once.
const lastPlayed = {};

export function play(name, delayMs = 0) {
  if (settings.muted || settings.volume === 0) return;
  const fn = SOUNDS[name];
  if (!fn) return;
  const run = () => {
    if (!ensureContext() || ctx.state !== 'running') return;
    const now = performance.now();
    if (lastPlayed[name] && now - lastPlayed[name] < 40) return;
    lastPlayed[name] = now;
    try {
      fn();
    } catch (e) {
      // A failed effect should never break the game.
    }
  };
  if (delayMs > 0) setTimeout(run, delayMs);
  else run();
}

export const SOUND_NAMES = Object.keys(SOUNDS);
