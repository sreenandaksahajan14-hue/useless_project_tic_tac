/**
 * Noir & Tactile Audio Engine
 * Procedural synthesis of vintage typewriters, ink stamps, paper shreds, camera shutters, and gavels.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      switch (type) {
        case 'place-x':
          this.playTypewriterKey(now, 850);
          break;
        case 'place-o':
        case 'stamp-light':
          this.playStamp(now, 0.2, 140);
          break;
        case 'stamp-heavy':
        case 'double-deal':
        case 'rebrand':
          this.playStamp(now, 0.4, 85);
          break;
        case 'shred':
        case 'vaporize':
          this.playPaperRip(now);
          break;
        case 'camera':
        case 'freeze':
          this.playCameraShutter(now);
          break;
        case 'gavel':
          this.playGavel(now);
          break;
        case 'siren':
        case 'charges':
          this.playNoirSiren(now);
          break;
        case 'typewriter':
        case 'tick':
          this.playTypewriterKey(now, 1100 + (Math.random() * 200 - 100));
          break;
        case 'objection':
          this.playCameraShutter(now);
          this.playStamp(now + 0.1, 0.35, 90);
          break;
        default:
          this.playTypewriterKey(now, 1000);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playTypewriterKey(t, pitch = 950) {
    // Mechanical key-strike click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.035);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  playStamp(t, volume = 0.3, baseFreq = 110) {
    // Heavy wooden rubber stamp impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // Ink slap slap-back
    const slap = this.ctx.createOscillator();
    const slapGain = this.ctx.createGain();
    slap.type = 'triangle';
    slap.frequency.setValueAtTime(450, t);
    slap.frequency.exponentialRampToValueAtTime(60, t + 0.06);
    slapGain.gain.setValueAtTime(volume * 0.7, t);
    slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    slap.connect(slapGain);
    slapGain.connect(this.ctx.destination);
    slap.start(t);
    slap.stop(t + 0.07);
  }

  playPaperRip(t) {
    // Noise buffer synthesis for paper tearing/redaction
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playCameraShutter(t) {
    // Vintage reporter flashbulb & mechanical shutter
    this.playTypewriterKey(t, 1600);
    setTimeout(() => {
      if (this.ctx) this.playTypewriterKey(this.ctx.currentTime, 750);
    }, 60);
  }

  playGavel(t) {
    // Courtroom gavel impact with resonant wooden soundboard
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);

    // Hard wood crack
    const crack = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crack.type = 'triangle';
    crack.frequency.setValueAtTime(700, t);
    crack.frequency.exponentialRampToValueAtTime(70, t + 0.1);
    crackGain.gain.setValueAtTime(0.4, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    crack.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crack.start(t);
    crack.stop(t + 0.12);
  }

  playNoirSiren(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(750, t + 0.2);
    osc.frequency.linearRampToValueAtTime(450, t + 0.4);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }
}

export const sound = new SoundEngine();
