/**
 * Ambient soundscape, synthesized entirely with the Web Audio API — no
 * audio files, no network. A soft mountain-air bed (filtered noise with a
 * slow LFO "breeze") plus occasional distant birdsong (two-partial chirps
 * on a randomized clock). Muted by default; constructed lazily on the
 * user's first toggle so autoplay policies are never violated.
 */

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private birdTimer: number | null = null;
  private running = false;

  get isRunning() {
    return this.running;
  }

  async enable() {
    if (this.running) return;
    if (!this.ctx) this.build();
    await this.ctx!.resume();
    const now = this.ctx!.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(0.16, now + 1.8);
    this.running = true;
    this.scheduleBird();
  }

  async disable() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.8);
    if (this.birdTimer) window.clearTimeout(this.birdTimer);
    this.birdTimer = null;
    this.running = false;
  }

  async toggle(): Promise<boolean> {
    if (this.running) await this.disable();
    else await this.enable();
    return this.running;
  }

  private build() {
    type WindowAudio = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WindowAudio).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // ---- wind bed: looped pink-ish noise → lowpass swept by an LFO ----
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.029 * white;
      b1 = 0.985 * b1 + 0.032 * white;
      b2 = 0.95 * b2 + 0.048 * white;
      data[i] = (b0 + b1 + b2) * 0.55;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 420;
    lowpass.Q.value = 0.4;

    const breeze = ctx.createOscillator();
    breeze.frequency.value = 0.07; // one gust ~every 14s
    const breezeDepth = ctx.createGain();
    breezeDepth.gain.value = 220;
    breeze.connect(breezeDepth);
    breezeDepth.connect(lowpass.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.5;

    noise.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(this.master);
    noise.start();
    breeze.start();
  }

  /** One distant two-note chirp; reschedules itself at random intervals. */
  private scheduleBird() {
    if (!this.running || !this.ctx || !this.master) return;
    const delay = 3500 + Math.random() * 7000;
    this.birdTimer = window.setTimeout(() => {
      if (!this.running || !this.ctx || !this.master) return;
      const ctx = this.ctx;
      const t0 = ctx.currentTime + 0.05;
      const base = 2300 + Math.random() * 1400;
      for (let n = 0; n < 2 + Math.floor(Math.random() * 2); n++) {
        const start = t0 + n * (0.16 + Math.random() * 0.08);
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const g = ctx.createGain();
        g.gain.value = 0;
        osc.frequency.setValueAtTime(base * (1 + Math.random() * 0.12), start);
        osc.frequency.exponentialRampToValueAtTime(
          base * (0.72 + Math.random() * 0.1),
          start + 0.12
        );
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.028 + Math.random() * 0.012, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
        osc.connect(g);
        g.connect(this.master);
        osc.start(start);
        osc.stop(start + 0.2);
      }
      this.scheduleBird();
    }, delay);
  }
}

let singleton: AmbientAudio | null = null;
export function getAmbientAudio(): AmbientAudio {
  if (!singleton) singleton = new AmbientAudio();
  return singleton;
}
