export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.motorOsc = null;
    this.motorGain = null;
    this.rainGain = null;
    this.isInit = false;
    this.volume = 0.8;
    this.muted = false;
    this.clackTimer = 0;
    this.warnTimer = 0;
  }

  init() {
    if (this.isInit) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);

    this.motorOsc = this.ctx.createOscillator();
    this.motorGain = this.ctx.createGain();
    this.motorOsc.type = 'sawtooth';
    this.motorOsc.frequency.value = 55;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    this.motorGain.gain.value = 0.0;
    this.motorOsc.connect(filter);
    filter.connect(this.motorGain);
    this.motorGain.connect(this.masterGain);
    this.motorOsc.start();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = noiseBuffer;
    rainSrc.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.6;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;

    rainSrc.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSrc.start();

    this.isInit = true;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setRainActive(active) {
    if (!this.isInit || !this.rainGain) return;
    this.rainGain.gain.setTargetAtTime(active ? 0.09 : 0.0, this.ctx.currentTime, 0.3);
  }

  updateMotor(speedKmh, isDriving, dt, isOverspeed) {
    if (!this.isInit || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const norm = Math.min(speedKmh / 100, 1);
    const targetFreq = 48 + norm * 250;
    const targetGain = isDriving && speedKmh > 0.5 ? 0.028 + norm * 0.075 : 0.0;

    this.motorOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.motorGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);

    if (isDriving && speedKmh > 8 && !this.muted) {
      this.clackTimer += dt * (speedKmh / 18);
      if (this.clackTimer >= 1) {
        this.clackTimer = 0;
        this.playRailClack(norm);
      }
    }

    if (isDriving && isOverspeed && !this.muted) {
      this.warnTimer += dt;
      if (this.warnTimer >= 0.75) {
        this.warnTimer = 0;
        this.playBeep(880, 0.08, 0.06);
      }
    } else {
      this.warnTimer = 0.7;
    }
  }

  playRailClack(intensity) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.05);
    gain.gain.setValueAtTime(0.03 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playBeep(freq, dur, vol) {
    if (!this.isInit) this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  playGateSuccess() {
    this.playBeep(1046.5, 0.12, 0.12);
    setTimeout(() => this.playBeep(1318.5, 0.18, 0.12), 110);
  }

  playPAChime() {
    if (!this.isInit) this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [659.25, 523.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.22);
      gain.gain.setValueAtTime(0.11, now + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.48);
    });
  }

  playHorn() {
    if (!this.isInit) this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [311.13, 392.0].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  playDoorChime() {
    if (!this.isInit) this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0.1, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.38);
    });
  }
}
