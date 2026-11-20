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
    title: 'মিশন ১: উত্তরা টু পল্লবী',
    desc: 'টিকিট কেটে গেট পার হয়ে উত্তরা উত্তর থেকে পল্লবী পর্যন্ত নিরাপদে ট্রেন চালান।',
    startStation: 0,
    targetStations: [1, 2, 3],
    weather: 'day',
    speedLimit: 80
  },
  {
    id: 'm2',
    title: 'মিশন ২: ফার্মগেট রাশ আওয়ার',
    desc: 'সন্ধ্যার ঢাকায় মিরপুর ১০ থেকে আগারগাঁও, ফার্মগেট হয়ে শাহবাগ পর্যন্ত এক্সপ্রেস যাত্রা।',
    startStation: 5,
    targetStations: [8, 10, 12],
    weather: 'sunset',
    speedLimit: 90
  },
  {
    id: 'm3',
    title: 'মিশন ৩: বর্ষার রাতে মতিঝিল',
    desc: 'বৃষ্টির রাতে ফার্মগেট থেকে ঢাকা বিশ্ববিদ্যালয় হয়ে মতিঝিল পর্যন্ত সতর্ক ড্রাইভিং।',
    startStation: 10,
    targetStations: [12, 13, 15],
    weather: 'rain',
    speedLimit: 70
  },
  {
    id: 'm4',
    title: 'মিশন ৪: ফুল MRT-6 চ্যালেঞ্জ',
    desc: 'উত্তরা উত্তর থেকে মতিঝিল! মূল স্টেশনগুলোতে থেমে সম্পূর্ণ ঢাকা অতিক্রম করুন।',
    startStation: 0,
    targetStations: [3, 5, 8, 10, 13, 15],
    weather: 'night',
    speedLimit: 95
  }
];

export const TRAIN_PHYSICS = {
  maxSpeedKmh: 105,
  accelRate: 19,
  brakeRate: 30,
  emergencyBrake: 58,
  drag: 2.0
};
