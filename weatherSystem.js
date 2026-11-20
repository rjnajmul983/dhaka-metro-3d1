import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene, sunLight, ambientLight, audioEngine) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;
    this.audio = audioEngine;
    this.modes = ['day', 'sunset', 'night', 'rain', 'fog'];
    this.currentIndex = 0;
    this.currentMode = 'day';
    this.lightningTimer = 4;
    this.flashIntensity = 0;

    // Rain Particles
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

    // Starfield for Night Sky
    const starCount = 450;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 700;
      starPos[i * 3 + 1] = 80 + Math.random() * 180;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 700;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4 }));
    this.stars.visible = false;
    this.scene.add(this.stars);

    // Celestial Disc (Sun / Moon)
    this.celestial = new THREE.Mesh(
      new THREE.SphereGeometry(14, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    this.scene.add(this.celestial);
  }

  setWeather(mode) {
    const idx = this.modes.indexOf(mode);
    if (idx !== -1) this.currentIndex = idx;
    this.currentMode = mode;

    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x7dd3fc);
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0018);
      this.sunLight.color.setHex(0xfffbeb);
      this.sunLight.intensity = 1.6;
      this.ambientLight.intensity = 0.75;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xfef08a);
      return { label: '☀️ দিন', isNight: false, isRain: false, slippery: false };
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xf97316);
      this.scene.fog = new THREE.FogExp2(0xfb923c, 0.0024);
      this.sunLight.color.setHex(0xfdba74);
      this.sunLight.intensity = 1.25;
      this.ambientLight.intensity = 0.5;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xf97316);
      return { label: '🌇 সন্ধ্যা', isNight: true, isRain: false, slippery: false };
    } else if (mode === 'night') {
      this.scene.background = new THREE.Color(0x0b1320);
      this.scene.fog = new THREE.FogExp2(0x0b1320, 0.0030);
      this.sunLight.color.setHex(0x64748b);
      this.sunLight.intensity = 0.35;
      this.ambientLight.intensity = 0.28;
      this.rainPoints.visible = false;
      this.stars.visible = true;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xe2e8f0);
      return { label: '🌙 রাত', isNight: true, isRain: false, slippery: false };
    } else if (mode === 'fog') {
      this.scene.background = new THREE.Color(0xcbd5e1);
      this.scene.fog = new THREE.FogExp2(0xcbd5e1, 0.0085);
      this.sunLight.color.setHex(0xe2e8f0);
      this.sunLight.intensity = 0.7;
      this.ambientLight.intensity = 0.65;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = false;
      return { label: '🌫️ কুয়াশা', isNight: false, isRain: false, slippery: false };
    } else {
      this.scene.background = new THREE.Color(0x1e293b);
      this.scene.fog = new THREE.FogExp2(0x1e293b, 0.0042);
      this.sunLight.color.setHex(0x94a3b8);
      this.sunLight.intensity = 0.5;
      this.ambientLight.intensity = 0.35;
      this.rainPoints.visible = true;
      this.stars.visible = false;
      this.celestial.visible = false;
      return { label: '⛈️ ঝড়-বৃষ্টি', isNight: true, isRain: true, slippery: true };
    }
  }

  cycle() {
    this.currentIndex = (this.currentIndex + 1) % this.modes.length;
    return this.setWeather(this.modes[this.currentIndex]);
  }

  update(dt, focusPos) {
    this.celestial.position.set(focusPos.x + 120, 140, focusPos.z - 320);
    if (this.stars.visible) {
      this.stars.position.set(focusPos.x, 0, focusPos.z);
    }

    if (this.rainPoints.visible) {
      this.rainPoints.position.set(focusPos.x, 0, focusPos.z);
      const pos = this.rainPoints.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 34 * dt;
        if (pos[i] < -5) pos[i] = 40;
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;

      // Random Lightning Flash + Thunder
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 6 + Math.random() * 10;
        this.flashIntensity = 1.0;
        if (this.audio) this.audio.playThunder();
      }
      if (this.flashIntensity > 0) {
        this.flashIntensity = Math.max(0, this.flashIntensity - dt * 4.5);
        this.ambientLight.intensity = 0.35 + this.flashIntensity * 2.2;
      }
    }
  }
}
