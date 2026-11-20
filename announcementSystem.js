export class AnnouncementSystem {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.enabled = true;
    this.elBanner = document.getElementById('pa-banner');
    this.elText = document.getElementById('pa-text');
    this.lastApproachedId = -1;
    this.hideTimer = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  reset() { this.lastApproachedId = -1; }

  announce(textBn) {
    if (!this.enabled) return;
    this.audio.playPAChime();
    this.elText.textContent = textBn;
    this.elBanner.classList.remove('hidden');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.elBanner.classList.add('hidden'), 5200);

    if ('speechSynthesis' in window && !this.audio.muted) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textBn);
        utter.lang = 'bn-BD';
        utter.rate = 0.96;
        utter.volume = this.audio.volume;
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('bn'));
        if (bnVoice) utter.voice = bnVoice;
        setTimeout(() => window.speechSynthesis.speak(utter), 320);
      } catch (_) {}
    }
  }

  checkApproach(station, distMeters) {
    if (!station) return;
    if (distMeters > 45 && distMeters < 155 && this.lastApproachedId !== station.id) {
      this.lastApproachedId = station.id;
      this.announce(`পরবর্তী স্টেশন, ${station.nameBn}। দরজা ডান দিকে খুলবে।`);
    }
  }

  announceArrival(station) {
    this.announce(`${station.nameBn} স্টেশনে স্বাগতম। সাবধানে নামুন ও উঠুন।`);
  }

  announceDoorsClosing() {
    this.announce('দরজা বন্ধ হচ্ছে, অনুগ্রহ করে নিরাপদ দূরত্বে থাকুন।');
  }
}
