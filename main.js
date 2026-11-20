import * as THREE from 'three';
import { STATIONS, MISSIONS, TRAIN_PHYSICS, TRAIN_SKINS, RANKS } from './config.js';
import { AudioEngine } from './audio.js';
import { createDhakaMetroTrain } from './models/trainModel.js';
import { createCharacter } from './models/characterModel.js';
import { createStation } from './models/stationModel.js';
import { createDhakaCity } from './models/cityModel.js';
import { WeatherSystem } from './systems/weatherSystem.js';
import { AnnouncementSystem } from './systems/announcementSystem.js';
import { MissionSystem } from './systems/missionSystem.js';

setTimeout(() => {
  const sp = document.getElementById('splash-screen');
  if (sp) {
    sp.style.opacity = '0';
    setTimeout(() => sp.remove(), 500);
  }
}, 1300);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Core Three.js with Cinematic ACES Filmic Tone Mapping (v11)
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 860);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Procedural Environment Reflection Map for Metallic Train & Glass (v11)
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
envScene.add(new THREE.HemisphereLight(0x7dd3fc, 0x334155, 2.2));
const envBox = new THREE.Mesh(
  new THREE.SphereGeometry(20, 12, 8),
  new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.BackSide })
);
envScene.add(envBox);
scene.environment = pmrem.fromScene(envScene, 0.04).texture;
pmrem.dispose();

// Natural Hemisphere + Directional Lighting (v11)
const ambientLight = new THREE.HemisphereLight(0xbae6fd, 0x334155, 0.78);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
sunLight.position.set(60, 120, 40);
scene.add(sunLight);

const city = createDhakaCity(6600);
scene.add(city.mesh);

const stationObjs = STATIONS.map((st) => {
  const s = createStation(st);
  scene.add(s.mesh);
  return s;
});

const train = createDhakaMetroTrain(false);
scene.add(train.mesh);

const aiTrain = createDhakaMetroTrain(true);
aiTrain.mesh.rotation.y = Math.PI;
aiTrain.mesh.position.set(-4.4, 0, -520);
scene.add(aiTrain.mesh);

const player = createCharacter(0x16a34a, 0x0f172a, true);
scene.add(player.mesh);

const audio = new AudioEngine();
const weather = new WeatherSystem(scene, sunLight, ambientLight, audio);
const announcement = new AnnouncementSystem(audio);

// Career Profile
const career = Object.assign(
  { money: 250, xp: 0, unlockedSkins: ['classic'], activeSkin: 'classic' },
  JSON.parse(localStorage.getItem('dhaka_metro_career_v10') || '{}')
);

function saveCareer() {
  localStorage.setItem('dhaka_metro_career_v10', JSON.stringify(career));
  let rankTitle = RANKS[0].title;
  for (const r of RANKS) if (career.xp >= r.minXp) rankTitle = r.title;
  document.getElementById('menu-rank').textContent = `🎖️ ${rankTitle}`;
  document.getElementById('menu-money').textContent = `💰 ৳ ${career.money}`;
  document.getElementById('garage-money').textContent = `৳ ${career.money}`;
  const skinObj = TRAIN_SKINS.find((s) => s.id === career.activeSkin) || TRAIN_SKINS[0];
  train.applySkin(skinObj);
}

// Persistent Settings
const settings = Object.assign(
  { quality: 'medium', volume: 80, muted: false, sens: 10, showFps: false, announce: true, vibrate: true },
  JSON.parse(localStorage.getItem('dhaka_metro_settings_v10') || '{}')
);

function haptic(ms = 35) {
  if (settings.vibrate && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (_) {}
  }
}

function applySettings() {
  if (settings.quality === 'low') {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.85));
    renderer.shadowMap.enabled = false;
    sunLight.castShadow = false;
  } else if (settings.quality === 'medium') {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.shadowMap.enabled = true;
    sunLight.castShadow = true;
  } else {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    sunLight.castShadow = true;
  }
  audio.setVolume(settings.volume / 100);
  audio.setMuted(settings.muted);
  announcement.setEnabled(settings.announce);
  document.getElementById('hud-fps').classList.toggle('hidden', !settings.showFps);
  localStorage.setItem('dhaka_metro_settings_v10', JSON.stringify(settings));
}

let isSlippery = false;
function applyWeatherState(wState) {
  document.getElementById('hud-weather-badge').textContent = wState.label;
  isSlippery = !!wState.slippery;
  city.setNightMode(wState.isNight);
  city.setRainMode(wState.isRain);
  train.setNightMode(wState.isNight);
  aiTrain.setNightMode(wState.isNight);
  audio.setRainActive(wState.isRain);
}

async function requestLandscapeFullscreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (_) {}
}

// UI Elements
const elMenu = document.getElementById('main-menu');
const elHud = document.getElementById('hud');
const elDrivingHud = document.getElementById('driving-hud');
const elWalkingHud = document.getElementById('walking-hud');
const elToast = document.getElementById('toast');
const elSpeedWarn = document.getElementById('speed-warning');
const elSpeedCluster = document.getElementById('speed-cluster');
const elMissionComplete = document.getElementById('mission-complete');
const elMissionList = document.getElementById('mission-list');
const elSettingsModal = document.getElementById('settings-modal');
const elTicketModal = document.getElementById('ticket-modal');
const elGarageModal = document.getElementById('garage-modal');
const elRestoreHud = document.getElementById('btn-restore-hud');

const btnTicketInteract = document.getElementById('btn-ticket-interact');
const btnGateInteract = document.getElementById('btn-gate-interact');
const btnBoardMobile = document.getElementById('btn-board-mobile');

let selectedMission = MISSIONS[0];
let startStationObj = stationObjs[0];
let gameState = 'menu';
let cameraMode = 0;
let slowMo = false;

let speedKmh = 0;
let throttle = 0;
let brake = 0;
const keys = {};

// Touch-Drag Camera
const camOrbit = { yaw: 0, pitch: 0, dragging: false, pointerId: null, lastX: 0, lastY: 0 };
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (gameState === 'menu') return;
  camOrbit.dragging = true;
  camOrbit.pointerId = e.pointerId;
  camOrbit.lastX = e.clientX;
  camOrbit.lastY = e.clientY;
});
window.addEventListener('pointermove', (e) => {
  if (!camOrbit.dragging || e.pointerId !== camOrbit.pointerId) return;
  const dx = e.clientX - camOrbit.lastX;
  const dy = e.clientY - camOrbit.lastY;
  camOrbit.lastX = e.clientX;
  camOrbit.lastY = e.clientY;
  const mult = (settings.sens / 10) * 0.005;
  camOrbit.yaw -= dx * mult;
  camOrbit.pitch = THREE.MathUtils.clamp(camOrbit.pitch + dy * mult, -0.35, 0.55);
});
window.addEventListener('pointerup', (e) => { if (e.pointerId === camOrbit.pointerId) camOrbit.dragging = false; });

// Virtual Joystick
const joy = { active: false, x: 0, y: 0, touchId: null };
const joyZone = document.getElementById('joystick-zone');
const joyKnob = document.getElementById('joystick-knob');
const maxRadius = 34;

function updateJoystick(clientX, clientY) {
  const rect = joyZone.querySelector('.joystick-base').getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxRadius) { dx = (dx / dist) * maxRadius; dy = (dy / dist) * maxRadius; }
  joy.x = dx / maxRadius;
  joy.y = dy / maxRadius;
  joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
}
function resetJoystick() {
  joy.active = false; joy.x = 0; joy.y = 0; joy.touchId = null;
  joyKnob.style.transform = 'translate(0px, 0px)';
}
joyZone.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation();
  joy.active = true; joy.touchId = e.pointerId;
  joyZone.setPointerCapture(e.pointerId);
  updateJoystick(e.clientX, e.clientY);
});
joyZone.addEventListener('pointermove', (e) => { if (joy.active && e.pointerId === joy.touchId) updateJoystick(e.clientX, e.clientY); });
joyZone.addEventListener('pointerup', (e) => { if (e.pointerId === joy.touchId) resetJoystick(); });
joyZone.addEventListener('pointercancel', resetJoystick);

function showToast(msg) {
  elToast.textContent = msg;
  elToast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => elToast.classList.add('hidden'), 3000);
}

const missionSys = new MissionSystem(showToast, (result) => {
  gameState = 'menu';
  const reward = result.mission.rewardTk || 500;
  career.money += reward;
  career.xp += result.score;
  saveCareer();
  haptic([80, 60, 120]);

  elHud.classList.add('hidden');
  elRestoreHud.classList.add('hidden');
  elMissionComplete.classList.remove('hidden');
  document.getElementById('mc-summary').textContent = `${result.mission.title} সফলভাবে শেষ হয়েছে!`;
  document.getElementById('mc-score').textContent = result.score;
  document.getElementById('mc-reward').textContent = `৳ ${reward}`;
  document.getElementById('mc-stops').textContent = result.stops;
}, announcement);

MISSIONS.forEach((m, idx) => {
  const card = document.createElement('div');
  card.className = 'mission-card' + (idx === 0 ? ' active' : '');
  card.innerHTML = `<div class="m-title">${m.title} (+৳${m.rewardTk})</div><div class="m-desc">${m.desc}</div>`;
  card.onclick = () => {
    document.querySelectorAll('.mission-card').forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    selectedMission = m;
  };
  elMissionList.appendChild(card);
});

function renderGarage() {
  const list = document.getElementById('skin-list');
  list.innerHTML = '';
  TRAIN_SKINS.forEach((sk) => {
    const owned = career.unlockedSkins.includes(sk.id);
    const active = career.activeSkin === sk.id;
    const card = document.createElement('div');
    card.className = 'skin-card' + (active ? ' active' : '');
    const c1 = '#' + sk.body.toString(16).padStart(6, '0');
    const c2 = '#' + sk.stripe1.toString(16).padStart(6, '0');
    const c3 = '#' + sk.stripe2.toString(16).padStart(6, '0');
    card.innerHTML = `
      <div class="skin-swatch" style="background: linear-gradient(90deg, ${c1} 45%, ${c2} 75%, ${c3} 100%)"></div>
      <div class="skin-name">${sk.name}</div>
      <div class="skin-price">${active ? '✅ সক্রিয়' : owned ? 'ব্যবহার করুন' : '🔒 ৳ ' + sk.price}</div>
    `;
    card.onclick = () => {
      if (owned) {
        career.activeSkin = sk.id;
        saveCareer(); renderGarage();
        showToast(`🎨 ${sk.name} সেট করা হয়েছে!`);
      } else if (career.money >= sk.price) {
        career.money -= sk.price;
        career.unlockedSkins.push(sk.id);
        career.activeSkin = sk.id;
        saveCareer(); renderGarage();
        audio.playGateSuccess();
        showToast(`🎉 ${sk.name} আনলক হয়েছে!`);
      } else {
        showToast(`❌ আরও ৳ ${sk.price - career.money} প্রয়োজন!`);
      }
    };
    list.appendChild(card);
  });
}

function startGame() {
  requestLandscapeFullscreen();
  audio.init();
  applySettings();
  saveCareer();
  missionSys.start(selectedMission);

  const startSt = STATIONS[selectedMission.startStation];
  startStationObj = stationObjs[selectedMission.startStation];
  stationObjs.forEach((s) => s.setAfcGateOpen(false));

  train.mesh.position.set(0, 0, startSt.z);
  train.setDoorsOpen(false);
  speedKmh = 0; throttle = 0; brake = 0;
  camOrbit.yaw = 0; camOrbit.pitch = 0;
  slowMo = false;
  aiTrain.mesh.position.z = startSt.z - 550;

  player.mesh.position.set(5.6, 1.4, startSt.z - 21);
  player.mesh.visible = true;

  document.getElementById('hud-ticket-badge').textContent = '🎫 টিকিট নেই';
  applyWeatherState(weather.setWeather(selectedMission.weather));
  document.getElementById('hud-limit').textContent = selectedMission.speedLimit;

  gameState = 'walking';
  elMenu.classList.add('hidden');
  elMissionComplete.classList.add('hidden');
  elTicketModal.classList.add('hidden');
  elGarageModal.classList.add('hidden');
  elRestoreHud.classList.add('hidden');
  elHud.classList.remove('hidden');
  elDrivingHud.classList.add('hidden');
  elWalkingHud.classList.remove('hidden');
}

function buyTicket(typeName) {
  audio.playGateSuccess();
  haptic(40);
  missionSys.onTicketBought(typeName);
  document.getElementById('hud-ticket-badge').textContent = `✅ ${typeName}`;
  elTicketModal.classList.add('hidden');
}

function scanAfcGate() {
  if (!missionSys.hasTicket) {
    audio.playBeep(260, 0.2, 0.12);
    haptic([40, 40, 40]);
    showToast('❌ আগে টিকিট কাউন্টার (TVM) থেকে টিকিট কাটুন!');
    return;
  }
  audio.playGateSuccess();
  haptic(50);
  startStationObj.setAfcGateOpen(true);
  missionSys.onGateScanned();
}

function toggleBoardCab() {
  if (gameState === 'walking') {
    if (!missionSys.gatePassed) { showToast('আগে টিকিট কেটে AFC গেট পার হোন!'); return; }
    const cabPos = new THREE.Vector3(0, 1.4, train.mesh.position.z - 10);
    if (player.mesh.position.distanceTo(cabPos) < 13) {
      gameState = 'driving';
      player.mesh.visible = false;
      camOrbit.yaw = 0; camOrbit.pitch = 0;
      elDrivingHud.classList.remove('hidden');
      elWalkingHud.classList.add('hidden');
      missionSys.onCabBoarded();
    } else {
      showToast('ট্রেনের সামনের ক্যাবের আরও কাছে যান!');
    }
  } else if (gameState === 'driving') {
    if (speedKmh > 1) { showToast('নামার আগে ট্রেন সম্পূর্ণ থামান!'); return; }
    gameState = 'walking';
    player.mesh.position.set(4.2, 1.4, train.mesh.position.z - 8);
    player.mesh.visible = true;
    elDrivingHud.classList.add('hidden');
    elWalkingHud.classList.remove('hidden');
  }
}

function toggleDoors() {
  if (gameState !== 'driving') return;
  if (speedKmh > 1) { showToast('চলন্ত অবস্থায় দরজা খোলা যাবে না!'); return; }
  const nextState = !train.isDoorsOpen();
  train.setDoorsOpen(nextState);
  audio.playDoorChime();
  haptic(30);
  if (!nextState) announcement.announceDoorsClosing();
  const pill = document.getElementById('pill-doors');
  pill.textContent = nextState ? 'দরজা খোলা' : 'দরজা বন্ধ';
  pill.className = 'pill ' + (nextState ? 'open' : 'closed');
}

btnTicketInteract.onclick = () => elTicketModal.classList.remove('hidden');
document.getElementById('btn-close-ticket').onclick = () => elTicketModal.classList.add('hidden');
document.getElementById('btn-buy-single').onclick = () => buyTicket('সিঙ্গেল টিকিট');
document.getElementById('btn-buy-mrtpass').onclick = () => buyTicket('MRT Pass');
btnGateInteract.onclick = scanAfcGate;

document.getElementById('btn-open-garage').onclick = () => { renderGarage(); elGarageModal.classList.remove('hidden'); };
document.getElementById('btn-close-garage').onclick = () => elGarageModal.classList.add('hidden');

document.getElementById('btn-creator').onclick = () => { elHud.classList.add('hidden'); elRestoreHud.classList.remove('hidden'); };
elRestoreHud.onclick = () => { elRestoreHud.classList.add('hidden'); elHud.classList.remove('hidden'); };
document.getElementById('btn-slowmo').onclick = (e) => {
  slowMo = !slowMo;
  e.currentTarget.classList.toggle('active', slowMo);
  showToast(slowMo ? '⏱️ স্লো-মোশন চালু (0.5x)' : '⏱️ নরমাল স্পিড');
};

const volInput = document.getElementById('setting-volume');
const volLabel = document.getElementById('vol-label');
const sensInput = document.getElementById('setting-sens');
const sensLabel = document.getElementById('sens-label');
const muteInput = document.getElementById('setting-mute');
const fpsInput = document.getElementById('setting-fps');
const announceInput = document.getElementById('setting-announce');
const vibrateInput = document.getElementById('setting-vibrate');
const qualityBtns = document.querySelectorAll('#graphics-selector button');

function syncSettingsUI() {
  volInput.value = settings.volume;
  volLabel.textContent = `${settings.volume}%`;
  sensInput.value = settings.sens;
  sensLabel.textContent = `${(settings.sens / 10).toFixed(1)}x`;
  muteInput.checked = settings.muted;
  fpsInput.checked = settings.showFps;
  announceInput.checked = settings.announce;
  vibrateInput.checked = settings.vibrate;
  qualityBtns.forEach((b) => b.classList.toggle('active', b.dataset.quality === settings.quality));
}

qualityBtns.forEach((btn) => {
  btn.onclick = () => { settings.quality = btn.dataset.quality; syncSettingsUI(); applySettings(); showToast(`গ্রাফিক্স: ${settings.quality.toUpperCase()}`); };
});
volInput.oninput = () => { settings.volume = Number(volInput.value); volLabel.textContent = `${settings.volume}%`; applySettings(); };
sensInput.oninput = () => { settings.sens = Number(sensInput.value); sensLabel.textContent = `${(settings.sens / 10).toFixed(1)}x`; applySettings(); };
muteInput.onchange = () => { settings.muted = muteInput.checked; applySettings(); };
fpsInput.onchange = () => { settings.showFps = fpsInput.checked; applySettings(); };
announceInput.onchange = () => { settings.announce = announceInput.checked; applySettings(); };
vibrateInput.onchange = () => { settings.vibrate = vibrateInput.checked; applySettings(); };

document.getElementById('btn-open-settings-menu').onclick = () => { syncSettingsUI(); elSettingsModal.classList.remove('hidden'); };
document.getElementById('btn-settings-hud').onclick = () => { syncSettingsUI(); elSettingsModal.classList.remove('hidden'); };
document.getElementById('btn-close-settings').onclick = () => elSettingsModal.classList.add('hidden');
document.getElementById('btn-toggle-fullscreen').onclick = requestLandscapeFullscreen;
document.getElementById('btn-force-landscape').onclick = requestLandscapeFullscreen;

document.getElementById('btn-start').onclick = startGame;
document.getElementById('btn-next-mission').onclick = () => { elMissionComplete.classList.add('hidden'); elMenu.classList.remove('hidden'); };
document.getElementById('btn-menu').onclick = () => { gameState = 'menu'; elHud.classList.add('hidden'); elMenu.classList.remove('hidden'); };
document.getElementById('btn-weather').onclick = () => applyWeatherState(weather.cycle());
document.getElementById('btn-camera').onclick = () => {
  cameraMode = (cameraMode + 1) % 3;
  camOrbit.yaw = 0; camOrbit.pitch = 0;
  showToast(['থার্ড পারসন', '৩ডি ড্রাইভার ক্যাব', 'ড্রোন সিনেম্যাটিক'][cameraMode]);
};
document.getElementById('btn-doors').onclick = toggleDoors;
document.getElementById('btn-horn').onclick = () => { audio.playHorn(); haptic(60); };
document.getElementById('btn-exit').onclick = toggleBoardCab;
btnBoardMobile.onclick = toggleBoardCab;

const bindHold = (id, key, vib = false) => {
  const el = document.getElementById(id);
  const down = (e) => { e.preventDefault(); e.stopPropagation(); keys[key] = true; if (vib) haptic(70); };
  const up = () => { keys[key] = false; };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
};
bindHold('btn-accel', 'KeyW');
bindHold('btn-brake', 'KeyS');
bindHold('btn-ebrake', 'Space', true);

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (gameState === 'menu') return;
  if (e.code === 'KeyE') toggleBoardCab();
  if (e.code === 'KeyO') toggleDoors();
  if (e.code === 'KeyH') audio.playHorn();
  if (e.code === 'KeyC') { cameraMode = (cameraMode + 1) % 3; camOrbit.yaw = 0; }
  if (e.code === 'KeyT') applyWeatherState(weather.cycle());
});
window.addEventListener('keyup', (e) => (keys[e.code] = false));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let fpsFrames = 0;
let fpsAccum = 0;

function animate() {
  requestAnimationFrame(animate);
  const rawDt = Math.min(clock.getDelta(), 0.05);
  const dt = slowMo ? rawDt * 0.45 : rawDt;

  fpsFrames++;
  fpsAccum += rawDt;
  if (fpsAccum >= 0.5) {
    document.getElementById('hud-fps').textContent = `${Math.round(fpsFrames / fpsAccum)} FPS`;
    fpsFrames = 0; fpsAccum = 0;
  }

  city.update(dt);
  train.update(dt, throttle, weather.currentMode === 'rain');

  aiTrain.mesh.position.z += 22 * dt;
  if (aiTrain.mesh.position.z > train.mesh.position.z + 320) {
    aiTrain.mesh.position.z = train.mesh.position.z - 850;
  }

  for (const s of stationObjs) s.update(dt, train.mesh.position.z, train.isDoorsOpen());

  if (gameState === 'walking') {
    let moveX = joy.x;
    let moveZ = joy.y;
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    const mag = Math.hypot(moveX, moveZ);
    const isMoving = mag > 0.1;
    if (isMoving) {
      const speed = 6.5;
      const nx = moveX / Math.max(1, mag);
      const nz = moveZ / Math.max(1, mag);
      player.mesh.position.x = THREE.MathUtils.clamp(player.mesh.position.x + nx * speed * dt, 2.6, 7.6);
      let nextZ = player.mesh.position.z + nz * speed * dt;
      const gateZ = startStationObj.z - 15.2;
      if (!missionSys.gatePassed && nextZ > gateZ) nextZ = gateZ;
      player.mesh.position.z = THREE.MathUtils.clamp(nextZ, startStationObj.z - 27, startStationObj.z + 110);
      player.mesh.rotation.y = Math.atan2(nx, nz);
    }
    player.animate(isMoving, dt);

    const tvmPos = new THREE.Vector3(7.5, 1.4, startStationObj.z - 21);
    const gatePos = new THREE.Vector3(5.2, 1.4, startStationObj.z - 15);
    const cabPos = new THREE.Vector3(0, 1.4, train.mesh.position.z - 10);

    btnTicketInteract.classList.toggle('hidden', !(!missionSys.hasTicket && player.mesh.position.distanceTo(tvmPos) < 4.5));
    btnGateInteract.classList.toggle('hidden', !(!missionSys.gatePassed && player.mesh.position.distanceTo(gatePos) < 4.5));
    btnBoardMobile.classList.toggle('hidden', !(missionSys.gatePassed && player.mesh.position.distanceTo(cabPos) < 13));

    const radius = 9.5;
    camera.position.lerp(new THREE.Vector3(
      player.mesh.position.x + Math.sin(camOrbit.yaw + 0.65) * radius,
      player.mesh.position.y + 4.2 + camOrbit.pitch * 5,
      player.mesh.position.z + Math.cos(camOrbit.yaw + 0.65) * radius
    ), 0.14);
    camera.lookAt(player.mesh.position.x, player.mesh.position.y + 1.3, player.mesh.position.z);
    weather.update(dt, player.mesh.position);
  } else if (gameState === 'driving') {
    if ((keys['KeyW'] || keys['ArrowUp']) && !train.isDoorsOpen()) {
      throttle = Math.min(1, throttle + dt * 1.8);
      brake = 0;
    } else {
      throttle = Math.max(0, throttle - dt * 2.5);
    }

    if (keys['KeyS'] || keys['ArrowDown']) {
      brake = Math.min(1, brake + dt * 2.5);
      throttle = 0;
    } else if (keys['Space']) {
      brake = 1;
      throttle = 0;
    } else {
      brake = Math.max(0, brake - dt * 3.0);
    }

    const grip = isSlippery ? 0.7 : 1.0;
    const accel = throttle * TRAIN_PHYSICS.accelRate;
    const decel = ((keys['Space'] ? TRAIN_PHYSICS.emergencyBrake : brake * TRAIN_PHYSICS.brakeRate) * grip) + TRAIN_PHYSICS.drag;
    speedKmh = THREE.MathUtils.clamp(speedKmh + (accel - decel) * dt, 0, TRAIN_PHYSICS.maxSpeedKmh);
    train.mesh.position.z -= (speedKmh / 3.6) * dt;

    const isOverspeed = speedKmh > selectedMission.speedLimit + 3;
    elSpeedWarn.classList.toggle('hidden', !isOverspeed);
    elSpeedCluster.classList.toggle('overspeed', isOverspeed);

    audio.updateMotor(speedKmh, true, dt, isOverspeed, brake);
    missionSys.checkStationStop(train.mesh.position.z, speedKmh, train.isDoorsOpen());

    document.getElementById('hud-speed').textContent = Math.round(speedKmh);
    document.getElementById('bar-throttle').style.height = `${Math.round(throttle * 100)}%`;
    document.getElementById('bar-brake').style.height = `${Math.round(brake * 100)}%`;

    const tz = train.mesh.position.z;
    if (cameraMode === 0) {
      const r = 27;
      camera.position.lerp(new THREE.Vector3(
        Math.sin(camOrbit.yaw + 0.35) * r,
        9.5 + camOrbit.pitch * 8,
        tz + Math.cos(camOrbit.yaw + 0.35) * r
      ), 0.14);
      camera.lookAt(0, 3, tz - 18);
    } else if (cameraMode === 1) {
      camera.position.set(0, 3.25, tz - 10.15);
      camera.lookAt(Math.sin(camOrbit.yaw) * 20, 2.85 - camOrbit.pitch * 12, tz - 50);
    } else {
      const t = clock.getElapsedTime() * 0.35;
      camera.position.lerp(new THREE.Vector3(Math.sin(t) * 28, 16, tz + Math.cos(t) * 28), 0.08);
      camera.lookAt(0, 3, tz - 10);
    }
    weather.update(dt, train.mesh.position);
  } else {
    const t = clock.getElapsedTime() * 0.2;
    camera.position.set(Math.sin(t) * 28, 14, Math.cos(t) * 28);
    camera.lookAt(0, 3, 0);
  }

  if (gameState !== 'menu') {
    const nextSt = missionSys.getNextStation();
    const dist = Math.max(0, Math.round(train.mesh.position.z - nextSt.z));
    document.getElementById('hud-station').textContent = nextSt.nameBn;
    document.getElementById('hud-dist').textContent = `দূরত্ব: ${dist} m`;
    document.getElementById('hud-objective').textContent = missionSys.getObjectiveText();
    document.getElementById('hud-score').textContent = missionSys.score;
    const pct = Math.round(missionSys.getRouteProgress(train.mesh.position.z) * 100);
    document.getElementById('route-fill').style.width = `${pct}%`;
    document.getElementById('route-train-dot').style.left = `${pct}%`;
  }

  renderer.render(scene, camera);
}

applySettings();
syncSettingsUI();
saveCareer();
applyWeatherState(weather.setWeather('day'));
animate();
