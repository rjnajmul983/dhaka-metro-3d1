import { STATIONS } from '../config.js';

export class MissionSystem {
  constructor(onToast, onComplete, announcementSys) {
    this.onToast = onToast;
    this.onComplete = onComplete;
    this.announcementSys = announcementSys;
    this.activeMission = null;
    this.currentTargetIdx = 0;
    this.score = 0;
    this.stopsCompleted = 0;
    this.hasTicket = false;
    this.gatePassed = false;
    this.boardedCab = false;
  }

  start(mission) {
    this.activeMission = mission;
    this.currentTargetIdx = 0;
    this.score = 0;
    this.stopsCompleted = 0;
    this.hasTicket = false;
    this.gatePassed = false;
    this.boardedCab = false;
    this.announcementSys.reset();
  }

  onTicketBought(typeName) {
    if (!this.hasTicket) {
      this.hasTicket = true;
      this.score += 50;
      this.onToast(`🎫 ${typeName} সংগ্রহ করেছেন! (+50 স্কোর) এবার AFC গেট স্ক্যান করুন।`);
    }
  }

  onGateScanned() {
    if (!this.gatePassed) {
      this.gatePassed = true;
      this.score += 50;
      this.onToast('✅ AFC গেট খুলেছে! (+50 স্কোর) প্ল্যাটফর্মে গিয়ে ট্রেনের ক্যাবে উঠুন।');
    }
  }

  getNextStation() {
    if (!this.activeMission) return STATIONS[0];
    const stId = this.activeMission.targetStations[this.currentTargetIdx];
    return STATIONS[stId] || STATIONS[STATIONS.length - 1];
  }

  getRouteProgress(trainZ) {
    if (!this.activeMission) return 0;
    const startZ = STATIONS[this.activeMission.startStation].z;
    const endStId = this.activeMission.targetStations[this.activeMission.targetStations.length - 1];
    const endZ = STATIONS[endStId].z;
    if (startZ === endZ) return 0;
    return Math.max(0, Math.min(1, (startZ - trainZ) / (startZ - endZ)));
  }

  getObjectiveText() {
    if (!this.hasTicket) return 'টিকিট কাউন্টার (TVM)-এর কাছে গিয়ে টিকিট কাটুন';
    if (!this.gatePassed) return 'স্মার্ট AFC গেটের কাছে গিয়ে কার্ড/টিকিট স্ক্যান করুন';
    if (!this.boardedCab) return 'ট্রেনের সামনের ড্রাইভার ক্যাবে গিয়ে উঠুন';
    const next = this.getNextStation();
    return `${next.nameBn} স্টেশনে থামুন ও দরজা খুলুন`;
  }

  onCabBoarded() {
    if (!this.boardedCab) {
      this.boardedCab = true;
      this.score += 100;
      this.onToast('🚆 ক্যাবে উঠেছেন! (+100 স্কোর) যাত্রা শুরু করুন।');
      const next = this.getNextStation();
      this.announcementSys.announce(`ঢাকা মেট্রো রেলে স্বাগতম। পরবর্তী স্টেশন, ${next.nameBn}।`);
    }
  }

  checkStationStop(trainZ, speedKmh, doorsOpen) {
    if (!this.activeMission || !this.boardedCab) return;
    const target = this.getNextStation();
    const dist = Math.abs(trainZ - target.z);

    this.announcementSys.checkApproach(target, dist);

    if (dist < 28 && speedKmh < 1.0 && doorsOpen) {
      this.stopsCompleted++;
      const accuracyBonus = Math.max(100, Math.round(320 - dist * 8));
      this.score += accuracyBonus;
      this.onToast(`✅ ${target.nameBn} স্টেশনে সফল স্টপেজ! (+${accuracyBonus})`);
      this.announcementSys.announceArrival(target);

      this.currentTargetIdx++;
      if (this.currentTargetIdx >= this.activeMission.targetStations.length) {
        this.onComplete({
          mission: this.activeMission,
          score: this.score,
          stops: this.stopsCompleted
        });
      }
    }
  }
}
