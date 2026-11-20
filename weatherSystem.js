import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene, sunLight, ambientLight) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;
    this.modes = ['day', 'sunset', 'night', 'rain'];
    this.currentIndex = 0;
    this.currentMode = 'day';

    const rainCount = 1300;
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 85;
      positions[i * 3 + 1] = Math.random() * 42;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 85;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.25, transparent: true, opacity: 0.75 });
    this.rainPoints = new THREE.Points(rainGeo, rainMat);
    this.rainPoints.visible = false;
    this.scene.add(this.rainPoints);
  }

  setWeather(mode) {
    const idx = this.modes.indexOf(mode);
    if (idx !== -1) this.currentIndex = idx;
    this.currentMode = mode;

    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x7dd3fc);
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0020);
      this.sunLight.color.setHex(0xfffbeb);
      this.sunLight.intensity = 1.6;
      this.ambientLight.intensity = 0.72;
      this.rainPoints.visible = false;
      return { label: '☀️ দিন', isNight: false, isRain: false };
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xf97316);
      this.scene.fog = new THREE.FogExp2(0xfb923c, 0.0026);
      this.sunLight.color.setHex(0xfdba74);
      this.sunLight.intensity = 1.2;
      this.ambientLight.intensity = 0.48;
      this.rainPoints.visible = false;
      return { label: '🌇 সন্ধ্যা', isNight: true, isRain: false };
    } else if (mode === 'night') {
      this.scene.background = new THREE.Color(0x0b1320);
      this.scene.fog = new THREE.FogExp2(0x0b1320, 0.0032);
      this.sunLight.color.setHex(0x64748b);
      this.sunLight.intensity = 0.35;
      this.ambientLight.intensity = 0.28;
      this.rainPoints.visible = false;
      return { label: '🌙 রাত', isNight: true, isRain: false };
    } else {
      this.scene.background = new THREE.Color(0x1e293b);
      this.scene.fog = new THREE.FogExp2(0x1e293b, 0.0042);
      this.sunLight.color.setHex(0x94a3b8);
      this.sunLight.intensity = 0.5;
      this.ambientLight.intensity = 0.35;
      this.rainPoints.visible = true;
      return { label: '🌧️ বৃষ্টি', isNight: true, isRain: true };
    }
  }

  cycle() {
    this.currentIndex = (this.currentIndex + 1) % this.modes.length;
    return this.setWeather(this.modes[this.currentIndex]);
  }

  update(dt, focusPos) {
    if (!this.rainPoints.visible) return;
    this.rainPoints.position.set(focusPos.x, 0, focusPos.z);
    const pos = this.rainPoints.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= 34 * dt;
      if (pos[i] < -5) pos[i] = 40;
    }
    this.rainPoints.geometry.attributes.position.needsUpdate = true;
  }
}
