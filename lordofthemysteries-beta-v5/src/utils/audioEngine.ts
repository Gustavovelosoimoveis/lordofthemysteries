/**
 * Orchestral Dark Academia Ambient Audio Synthesizer for Lord of the Mysteries text RPG
 * Synthesizes acoustic piano, cello drone, and Victorian rain/wind ambience using Web Audio API
 * Transitions dynamically between 'calm' (calmaria) and 'tension' (tensão)
 */

import { AudioMood } from "../types";

export type { AudioMood };

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private pianoGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private tensionDroneGain: GainNode | null = null;

  private currentMood: AudioMood = "calm";
  private masterVolume: number = 0.22;
  private timerId: number | null = null;

  // Audio nodes for continuous layers
  private rainSource: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;

  // Classical minor chords for 'calm' (Melancholic Satie / Chopin nocturne feel in Dm, Am, Em, F)
  private calmChords = [
    [146.83, 220.0, 261.63, 293.66, 349.23, 440.0], // D minor
    [110.0, 164.81, 220.0, 261.63, 329.63, 440.0], // A minor
    [174.61, 220.0, 261.63, 349.23, 440.0, 523.25], // F major
    [130.81, 196.0, 246.94, 293.66, 392.0, 493.88], // E minor 7
    [116.54, 146.83, 174.61, 220.0, 293.66, 349.23], // Bb major 7
    [98.0, 146.83, 196.0, 233.08, 293.66, 392.0],  // G minor
  ];

  // Cryptic, ambient suspended minor chords for 'mystery' (Occult inquiry, hermetic symbols, strange whispers)
  private mysteryChords = [
    [110.0, 164.81, 246.94, 293.66, 370.0, 440.0], // A sus2/add9 mistério
    [146.83, 220.0, 277.18, 329.63, 440.0, 554.37], // D minor/major 7 arcano
    [130.81, 196.0, 246.94, 311.13, 392.0, 493.88], // E minor aug
    [98.0, 146.83, 207.65, 246.94, 293.66, 415.3],   // G minor cryptic
  ];

  // Luminous, open resonant chords for 'discovery' (Epiphany, uncovered diary, deciphered clues)
  private discoveryChords = [
    [174.61, 220.0, 261.63, 329.63, 392.0, 523.25], // F major 9 solene
    [130.81, 164.81, 196.0, 246.94, 329.63, 493.88], // C major 7 revelation
    [146.83, 220.0, 293.66, 369.99, 440.0, 587.33], // D major lídio
    [110.0, 164.81, 220.0, 277.18, 329.63, 440.0],  // A major épico suave
  ];

  // Dark, dissonant, diminished and tritone chords for 'tension' (Suspense & eldritch dread)
  private tensionChords = [
    [73.42, 110.0, 155.56, 220.0, 311.13, 440.0], // D diminished / Tritone
    [82.41, 116.54, 164.81, 233.08, 329.63, 466.16], // E diminished
    [65.41, 98.0, 138.59, 196.0, 277.18, 392.0],   // C# diminished
    [77.78, 110.0, 155.56, 207.65, 293.66, 415.3],  // Eb minor-major / dissonant
    [87.31, 123.47, 174.61, 246.94, 349.23, 493.88], // F diminished
  ];

  private currentChordIdx = 0;
  private moodListeners: ((mood: AudioMood) => void)[] = [];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.pianoGain = this.ctx.createGain();
        this.pianoGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.pianoGain.connect(this.masterGain);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.rainGain.connect(this.masterGain);

        this.tensionDroneGain = this.ctx.createGain();
        this.tensionDroneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.tensionDroneGain.connect(this.masterGain);
      }
    }
  }

  public subscribeMood(listener: (mood: AudioMood) => void): () => void {
    this.moodListeners.push(listener);
    return () => {
      this.moodListeners = this.moodListeners.filter((l) => l !== listener);
    };
  }

  public getMood(): AudioMood {
    return this.currentMood;
  }

  public setMood(newMood: AudioMood) {
    if (this.currentMood === newMood) return;
    this.currentMood = newMood;

    this.moodListeners.forEach((l) => l(newMood));

    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;

    if (newMood === "tension") {
      // Swell tension drone & make rain more ominous
      if (this.tensionDroneGain) {
        this.tensionDroneGain.gain.cancelScheduledValues(now);
        this.tensionDroneGain.gain.linearRampToValueAtTime(0.35, now + 1.8);
      }
      if (this.rainFilter) {
        this.rainFilter.frequency.exponentialRampToValueAtTime(1100, now + 2.0);
      }
      if (this.rainGain) {
        this.rainGain.gain.linearRampToValueAtTime(0.3, now + 1.5);
      }
    } else if (newMood === "mystery") {
      // Soft eerie resonance, subtle rain whispering
      if (this.tensionDroneGain) {
        this.tensionDroneGain.gain.cancelScheduledValues(now);
        this.tensionDroneGain.gain.linearRampToValueAtTime(0.12, now + 2.0);
      }
      if (this.rainFilter) {
        this.rainFilter.frequency.exponentialRampToValueAtTime(450, now + 2.5);
      }
      if (this.rainGain) {
        this.rainGain.gain.linearRampToValueAtTime(0.15, now + 2.0);
      }
    } else if (newMood === "discovery") {
      // Open, airy and luminous harmonic presence
      if (this.tensionDroneGain) {
        this.tensionDroneGain.gain.cancelScheduledValues(now);
        this.tensionDroneGain.gain.exponentialRampToValueAtTime(0.04, now + 2.0);
      }
      if (this.rainFilter) {
        this.rainFilter.frequency.exponentialRampToValueAtTime(700, now + 2.2);
      }
      if (this.rainGain) {
        this.rainGain.gain.linearRampToValueAtTime(0.14, now + 2.0);
      }
    } else {
      // Calm, peaceful contemplation
      if (this.tensionDroneGain) {
        this.tensionDroneGain.gain.cancelScheduledValues(now);
        this.tensionDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      }
      if (this.rainFilter) {
        this.rainFilter.frequency.exponentialRampToValueAtTime(550, now + 2.5);
      }
      if (this.rainGain) {
        this.rainGain.gain.linearRampToValueAtTime(0.18, now + 2.0);
      }
    }
  }

  public setVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isRunning) return;
    this.isRunning = true;

    this.startRainAmbience();
    this.startTensionDrone();
    this.scheduleNextPianoNote();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.stopContinuousNodes();
  }

  private stopContinuousNodes() {
    try {
      this.rainSource?.stop();
      this.rainSource?.disconnect();
      this.droneOsc1?.stop();
      this.droneOsc1?.disconnect();
      this.droneOsc2?.stop();
      this.droneOsc2?.disconnect();
    } catch (e) {
      // ignore
    }
    this.rainSource = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
  }

  private startRainAmbience() {
    if (!this.ctx || !this.rainGain) return;

    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Warm Victorian rain noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        output[i] = (b0 + b1 + b2) * 0.12;
      }

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = noiseBuffer;
      this.rainSource.loop = true;

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = "lowpass";
      this.rainFilter.frequency.setValueAtTime(this.currentMood === "tension" ? 950 : 550, this.ctx.currentTime);

      this.rainSource.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainSource.start();
    } catch (err) {
      console.warn("Rain ambience could not start:", err);
    }
  }

  private startTensionDrone() {
    if (!this.ctx || !this.tensionDroneGain) return;

    try {
      const now = this.ctx.currentTime;
      // Dark cello / low string drone
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();

      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(55.0, now); // Low A1

      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(82.41, now); // E2 fifth

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, now);

      // Tremolo LFO for subtle breathing pulse
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.4, now);
      lfoGain.gain.setValueAtTime(35, now);
      lfo.connect(filter.frequency);
      lfo.start(now);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.tensionDroneGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
    } catch (err) {
      console.warn("Tension drone could not start:", err);
    }
  }

  private scheduleNextPianoNote() {
    if (!this.isRunning || !this.ctx) return;

    const chordsList =
      this.currentMood === "tension"
        ? this.tensionChords
        : this.currentMood === "mystery"
        ? this.mysteryChords
        : this.currentMood === "discovery"
        ? this.discoveryChords
        : this.calmChords;

    const chord = chordsList[this.currentChordIdx % chordsList.length];
    const noteFreq = chord[Math.floor(Math.random() * chord.length)];

    this.playPianoTone(noteFreq, this.currentMood);

    // Occasionally change chord
    if (Math.random() > 0.55) {
      this.currentChordIdx = (this.currentChordIdx + 1) % chordsList.length;
    }

    // Dynamic pacing by mood
    let delay: number;
    if (this.currentMood === "tension") {
      delay = 1100 + Math.random() * 1600; // 1.1s to 2.7s - rápido e instável
    } else if (this.currentMood === "mystery") {
      delay = 2600 + Math.random() * 2800; // 2.6s to 5.4s - notas esparsas e misteriosas
    } else if (this.currentMood === "discovery") {
      delay = 1800 + Math.random() * 2000; // 1.8s to 3.8s - cadência inspirada e solene
    } else {
      delay = 2400 + Math.random() * 2600; // 2.4s to 5.0s - calmaria contemplativa
    }

    this.timerId = window.setTimeout(() => {
      this.scheduleNextPianoNote();
    }, delay);
  }

  private playPianoTone(freq: number, mood: AudioMood) {
    if (!this.ctx || !this.pianoGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (mood === "tension") {
      // Sharper harmonic profile, occasional dissonant attack
      osc.type = Math.random() > 0.4 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = 0.22 + Math.random() * 0.1;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(2600, freq * 4.5), now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.pianoGain);

      osc.start(now);
      osc.stop(now + 2.4);
    } else if (mood === "mystery") {
      // Ethereal, suspended bell-like harmonic tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = 0.18 + Math.random() * 0.08;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(Math.min(2200, freq * 2.5), now);
      filter.Q.setValueAtTime(1.5, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.pianoGain);

      osc.start(now);
      osc.stop(now + 4.6);
    } else if (mood === "discovery") {
      // Warm, ringing, luminous acoustic felt piano
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = 0.19 + Math.random() * 0.06;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(2200, freq * 3.8), now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 3.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.pianoGain);

      osc.start(now);
      osc.stop(now + 4.0);
    } else {
      // Calm, warm felt-hammer piano tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = 0.16 + Math.random() * 0.07;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.9);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(1600, freq * 3.2), now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 3.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.pianoGain);

      osc.start(now);
      osc.stop(now + 4.1);
    }
  }

  /**
   * Delicate Victorian sound effect: whisper of aged parchment page turning
   * triggered upon scene and turn narrative arrival.
   */
  public playTurnTransitionSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.frequency.exponentialRampToValueAtTime(450, now + 0.4);
      bandpass.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      noiseSource.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.46);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Antique resonant chime / pendulum undertone for when a dilemma arrives
   */
  public playDilemmaTensionCue() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now); // A2 low chime
      osc.frequency.exponentialRampToValueAtTime(108, now + 1.2);

      oscHarmonic.type = "triangle";
      oscHarmonic.frequency.setValueAtTime(220, now); // Octave overtone
      oscHarmonic.frequency.exponentialRampToValueAtTime(216, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 1.6);
      oscHarmonic.stop(now + 1.6);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Tactile clockwork quill tap when action is dispatched
   */
  public playActionSentCue() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // safe fallback
    }
  }

  private lastQuillSoundTime = 0;

  /**
   * Realistic tactile Victorian quill scratch sound on parchment
   * Synthesizes soft metallic nib friction with paper fibers
   */
  public playQuillScratchSound() {
    const nowMs = performance.now();
    // Throttle to keep the sound delicate, atmospheric and non-abrasive (every ~90ms max)
    if (nowMs - this.lastQuillSoundTime < 85) return;
    this.lastQuillSoundTime = nowMs;

    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const duration = 0.035 + Math.random() * 0.025; // 35-60ms stroke
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate soft friction noise with random micro-variations
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass centered at quill nib resonance (~2400-3400Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      const centerFreq = 2200 + Math.random() * 900;
      filter.frequency.setValueAtTime(centerFreq, now);
      filter.frequency.exponentialRampToValueAtTime(centerFreq * 0.85, now + duration);
      filter.Q.setValueAtTime(2.2, now);

      const gain = this.ctx.createGain();
      // Audible tactile UI feedback for quill strokes on parchment (0.18 base gain)
      const strokeVolume = 0.18;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(strokeVolume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      // Connect directly to destination so tactile typewriter feedback remains audible even if ambient theme is muted
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.01);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Authentic vintage parchment page turn / unroll sound
   * Uses filtered white noise sweep to synthesize paper rustle
   */
  public playPageTurnSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate soft rustling noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter to simulate crisp paper texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.26);
      filter.Q.setValueAtTime(1.4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16 * this.masterVolume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.3);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Eldritch dissonant chime and low shudder when sanity drops
   */
  public playSanityDropCue() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;

      // Dissonant minor second cluster (microtonal madness)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const subGain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sawtooth";
      subOsc.type = "triangle";

      osc1.frequency.setValueAtTime(329.63, now); // E4
      osc1.frequency.exponentialRampToValueAtTime(311.13, now + 0.8); // Eb4 (dissonant slide)

      osc2.frequency.setValueAtTime(349.23, now); // F4 (minor second clash)
      osc2.frequency.exponentialRampToValueAtTime(320.0, now + 0.8);

      subOsc.frequency.setValueAtTime(55.0, now); // A1 sub rumble
      subOsc.frequency.linearRampToValueAtTime(45.0, now + 1.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      subGain.gain.setValueAtTime(0.18 * this.masterVolume, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
      subOsc.stop(now + 1.5);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Resonant celestial chord and mystical bell chime when an occult Pathway is discovered
   */
  public playPathwayDiscoveryCue() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;

      // Golden harmonic progression (celestial bell arpeggio: 370Hz, 466Hz, 554Hz, 698Hz, 880Hz)
      const freqs = [369.99, 466.16, 554.37, 698.46, 880.0];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq, now + idx * 0.08);
        filter.Q.setValueAtTime(4.0, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = 2.4 - idx * 0.15;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.18 * this.masterVolume, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      });
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Evaluates text context (scene, dilemma, dialogue) to dynamically determine whether
   * the atmosphere is 'tension', 'discovery', 'mystery' or 'calm'.
   */
  public detectMoodFromText(text: string): AudioMood {
    if (!text) return "calm";
    const lower = text.toLowerCase();

    // 1. High Tension / Eldritch Danger
    const tensionKeywords = [
      "perigo", "arma", "revólver", "sangue", "monstro", "loucura", "corrupção",
      "passos rápidos", "encapuzado", "emboscada", "perseguição", "pânico", "morte",
      "cadáver", "ameaça", "grito", "ferimento", "desespero", "ataque", "lâmina",
      "facção", "veneno", "abismo", "sombra rastejante", "fuga", "armadilha",
      "mutação", "espírito maligno", "perda de controle", "urgência", "coração dispara", "tensão"
    ];

    let tensionHits = 0;
    for (const kw of tensionKeywords) {
      if (lower.includes(kw)) {
        tensionHits++;
        if (tensionHits >= 2) return "tension";
      }
    }

    // 2. Epiphany / Arcane Discovery / Solved Clue
    const discoveryKeywords = [
      "descoberta", "descobri", "compreendi", "verdade", "revelação", "fórmula",
      "decifrei", "desvendar", "segredo revelado", "iluminação", "compreensão",
      "diário encontrado", "pista crucial", "evidência irrefutável", "compreendi a lógica"
    ];

    for (const kw of discoveryKeywords) {
      if (lower.includes(kw)) return "discovery";
    }

    // 3. Occult Mystery / Hermetic Inquiry
    const mysteryKeywords = [
      "ocultismo", "ritual", "enigma", "símbolo", "hermes antigo", "tarô",
      "adivinhação", "sussurro", "estranheza", "anômalo", "sobrenatural", "místico",
      "beyonder", "sequência", "poção", "sociedade secreta", "lua carmesim",
      "sombras avermelhadas", "névoa estranha", "área restrita", "códice", "runas"
    ];

    let mysteryHits = 0;
    for (const kw of mysteryKeywords) {
      if (lower.includes(kw)) {
        mysteryHits++;
        if (mysteryHits >= 1) return "mystery";
      }
    }

    return "calm";
  }
}

export const audioEngine = new AmbientAudioEngine();
