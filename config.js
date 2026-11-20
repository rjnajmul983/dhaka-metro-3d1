export const STATIONS = [
  { id: 0, nameBn: 'উত্তরা উত্তর', nameEn: 'Uttara North', z: 0 },
  { id: 1, nameBn: 'উত্তরা সেন্টার', nameEn: 'Uttara Center', z: -400 },
  { id: 2, nameBn: 'উত্তরা দক্ষিণ', nameEn: 'Uttara South', z: -800 },
  { id: 3, nameBn: 'পল্লবী', nameEn: 'Pallabi', z: -1220 },
  { id: 4, nameBn: 'মিরপুর ১১', nameEn: 'Mirpur 11', z: -1640 },
  { id: 5, nameBn: 'মিরপুর ১০', nameEn: 'Mirpur 10', z: -2060 },
  { id: 6, nameBn: 'কাজীপাড়া', nameEn: 'Kazipara', z: -2480 },
  { id: 7, nameBn: 'শেওড়াপাড়া', nameEn: 'Shewrapara', z: -2900 },
  { id: 8, nameBn: 'আগারগাঁও', nameEn: 'Agargaon', z: -3340 },
  { id: 9, nameBn: 'বিজয় সরণি', nameEn: 'Bijoy Sarani', z: -3780 },
  { id: 10, nameBn: 'ফার্মগেট', nameEn: 'Farmgate', z: -4200 },
  { id: 11, nameBn: 'কারওয়ান বাজার', nameEn: 'Karwan Bazar', z: -4620 },
  { id: 12, nameBn: 'শাহবাগ', nameEn: 'Shahbagh', z: -5040 },
  { id: 13, nameBn: 'ঢাকা বিশ্ববিদ্যালয়', nameEn: 'Dhaka University', z: -5460 },
  { id: 14, nameBn: 'বাংলাদেশ সচিবালয়', nameEn: 'Secretariat', z: -5880 },
  { id: 15, nameBn: 'মতিঝিল', nameEn: 'Motijheel', z: -6320 }
];

export const MISSIONS = [
  {
    id: 'm1',
    title: 'মিশন ১: দিয়াবাড়ি টু পল্লবী',
    desc: 'টিকিট কেটে গেট পার হয়ে উত্তরা উত্তর থেকে পল্লবী পর্যন্ত নিরাপদে ট্রেন চালান।',
    startStation: 0,
    targetStations: [1, 2, 3],
    weather: 'day',
    speedLimit: 80,
    rewardTk: 500
  },
  {
    id: 'm2',
    title: 'মিশন ২: ফার্মগেট রাশ আওয়ার',
    desc: 'সন্ধ্যার ঢাকায় মিরপুর ১০ থেকে সংসদ ভবন ও ফার্মগেট হয়ে শাহবাগ এক্সপ্রেস।',
    startStation: 5,
    targetStations: [8, 10, 12],
    weather: 'sunset',
    speedLimit: 90,
    rewardTk: 800
  },
  {
    id: 'm3',
    title: 'মিশন ৩: ঝড়-বৃষ্টির রাতে মতিঝিল',
    desc: 'বজ্রপাত ও পিচ্ছিল লাইনে ফার্মগেট থেকে টিএসসি হয়ে মতিঝিল শাপলা চত্বর।',
    startStation: 10,
    targetStations: [12, 13, 15],
    weather: 'rain',
    speedLimit: 70,
    rewardTk: 1200
  },
  {
    id: 'm4',
    title: 'মিশন ৪: শীতের কুয়াশায় ফুল MRT-6',
    desc: 'ঘন কুয়াশায় উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত সম্পূর্ণ ঢাকা অতিক্রম করুন।',
    startStation: 0,
    targetStations: [3, 5, 8, 10, 13, 15],
    weather: 'fog',
    speedLimit: 85,
    rewardTk: 2000
  }
];

export const TRAIN_SKINS = [
  { id: 'classic', name: 'ক্লাসিক MRT-6', price: 0, body: 0xe2e8f0, stripe1: 0x006a4e, stripe2: 0xf42a41 },
  { id: 'victory', name: 'বিজয় দিবস স্পেশাল', price: 500, body: 0x064e3b, stripe1: 0xf42a41, stripe2: 0xfacc15 },
  { id: 'ekushey', name: 'একুশে ফেব্রুয়ারি', price: 900, body: 0x18181b, stripe1: 0xf8fafc, stripe2: 0xdc2626 },
  { id: 'golden', name: 'গোল্ডেন এক্সপ্রেস', price: 1500, body: 0xfef3c7, stripe1: 0xd97706, stripe2: 0x006a4e }
];

export const RANKS = [
  { minXp: 0, title: 'ট্রেইনি অপারেটর' },
  { minXp: 500, title: 'জুনিয়র পাইলট' },
  { minXp: 1500, title: 'সিনিয়র অপারেটর' },
  { minXp: 3500, title: 'চিফ কন্ট্রোলার' }
];

export const TRAIN_PHYSICS = {
  maxSpeedKmh: 105,
  accelRate: 19,
  brakeRate: 30,
  emergencyBrake: 58,
  drag: 2.0
};
