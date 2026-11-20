import * as THREE from 'three';

function createGradientSkyTexture(topHex, midHex, bottomHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, topHex);
  grad.addColorStop(0.52, midHex);
  grad.addColorStop(1.0, bottomHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

    // 1. Gradient Sky Dome
    this.skyTextures = {
      day: createGradientSkyTexture('#0284c7', '#7dd3fc', '#e0f2fe'),
      sunset: createGradientSkyTexture('#312e81', '#ea580c', '#fde047'),
      night: createGradientSkyTexture('#020617', '#0f172a', '#1e293b'),
      rain: createGradientSkyTexture('#0f172a', '#1e293b', '#334155'),
      fog: createGradientSkyTexture('#94a3b8', '#cbd5e1', '#e2e8f0')
    };
    this.skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(540, 24, 16),
      new THREE.MeshBasicMaterial({ map: this.skyTextures.day, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    this.scene.add(this.skyDome);

    // 2. 3D Drifting Clouds
    this.cloudsGroup = new THREE.Group();
    this.clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, transparent: true, opacity: 0.88 });
    this.cloudMat = cloudMat;
    const puffGeo = new THREE.DodecahedronGeometry(1, 1);

    for (let i = 0; i < 26; i++) {
      const c = new THREE.Group();
      const puffs = 3 + (i % 3);
      for (let p = 0; p < puffs; p++) {
        const m = new THREE.Mesh(puffGeo, cloudMat);
        const s = 7 + Math.random() * 8;
        m.scale.set(s * 1.4, s * 0.65, s);
        m.position.set((p - 1.2) * 8, Math.random() * 2.5, (Math.random() - 0.5) * 5);
        c.add(m);
      }
      c.position.set((Math.random() - 0.5) * 420, 95 + Math.random() * 55, (Math.random() - 0.5) * 520);
      this.cloudsGroup.add(c);
      this.clouds.push({ mesh: c, speed: 2.5 + Math.random() * 3.5 });
    }
    this.scene.add(this.cloudsGroup);

    // 3. Flying Birds Flock (Crows / Shalik in Dhaka Sky)
    this.birdsGroup = new THREE.Group();
    this.birds = [];
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
    const wingGeo = new THREE.PlaneGeometry(0.9, 0.35);
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Group();
      const leftWing = new THREE.Mesh(wingGeo, birdMat);
      leftWing.position.x = -0.45;
      const rightWing = new THREE.Mesh(wingGeo, birdMat);
      rightWing.position.x = 0.45;
      b.add(leftWing, rightWing);
      b.position.set((Math.random() - 0.5) * 140, 26 + Math.random() * 28, (Math.random() - 0.5) * 180);
      this.birdsGroup.add(b);
      this.birds.push({
        group: b, leftWing, rightWing,
        phase: Math.random() * Math.PI * 2,
        speed: 8 + Math.random() * 5,
        angle: Math.random() * Math.PI * 2
      });
    }
    this.scene.add(this.birdsGroup);

    // 4. Floating Golden Dust / Night Fireflies
    const fireflyCount = 260;
    const ffPos = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 90;
      ffPos[i * 3 + 1] = -6 + Math.random() * 22;
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    this.fireflyMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.32, transparent: true, opacity: 0.65 });
    this.fireflies = new THREE.Points(ffGeo, this.fireflyMat);
    this.scene.add(this.fireflies);

    // 5. Rain Particles
    const rainCount = 1350;
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

    // 6. Night Starfield
    const starCount = 500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 700;
      starPos[i * 3 + 1] = 85 + Math.random() * 190;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 700;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, fog: false }));
    this.stars.visible = false;
    this.scene.add(this.stars);

    // 7. Celestial Disc (Sun / Moon)
    this.celestial = new THREE.Mesh(
      new THREE.SphereGeometry(15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false })
    );
    this.scene.add(this.celestial);
  }

  setWeather(mode) {
    const idx = this.modes.indexOf(mode);
    if (idx !== -1) this.currentIndex = idx;
    this.currentMode = mode;

    this.skyDome.material.map = this.skyTextures[mode] || this.skyTextures.day;
    this.skyDome.material.needsUpdate = true;

    if (mode === 'day') {
      this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.0015);
      this.sunLight.color.setHex(0xfffbeb);
      this.sunLight.intensity = 1.65;
      this.ambientLight.intensity = 0.72;
      this.cloudMat.color.setHex(0xffffff);
      this.cloudsGroup.visible = true;
      this.birdsGroup.visible = true;
      this.fireflies.visible = false;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xfef08a);
      return { label: '☀️ দিন', isNight: false, isRain: false, slippery: false };
    } else if (mode === 'sunset') {
      this.scene.fog = new THREE.FogExp2(0xfb923c, 0.0021);
      this.sunLight.color.setHex(0xfdba74);
      this.sunLight.intensity = 1.35;
      this.ambientLight.intensity = 0.52;
      this.cloudMat.color.setHex(0xfdba74);
      this.cloudsGroup.visible = true;
      this.birdsGroup.visible = true;
      this.fireflyMat.color.setHex(0xfde047);
      this.fireflies.visible = true;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xf97316);
      return { label: '🌇 সন্ধ্যা', isNight: true, isRain: false, slippery: false };
    } else if (mode === 'night') {
      this.scene.fog = new THREE.FogExp2(0x0b1320, 0.0028);
      this.sunLight.color.setHex(0x64748b);
      this.sunLight.intensity = 0.35;
      this.ambientLight.intensity = 0.28;
      this.cloudMat.color.setHex(0x1e293b);
      this.cloudsGroup.visible = true;
      this.birdsGroup.visible = false;
      this.fireflyMat.color.setHex(0xa3e635);
      this.fireflies.visible = true;
      this.rainPoints.visible = false;
      this.stars.visible = true;
      this.celestial.visible = true;
      this.celestial.material.color.setHex(0xe2e8f0);
      return { label: '🌙 রাত', isNight: true, isRain: false, slippery: false };
    } else if (mode === 'fog') {
      this.scene.fog = new THREE.FogExp2(0xcbd5e1, 0.0078);
      this.sunLight.color.setHex(0xe2e8f0);
      this.sunLight.intensity = 0.72;
      this.ambientLight.intensity = 0.65;
      this.cloudsGroup.visible = false;
      this.birdsGroup.visible = false;
      this.fireflies.visible = false;
      this.rainPoints.visible = false;
      this.stars.visible = false;
      this.celestial.visible = false;
      return { label: '🌫️ কুয়াশা', isNight: false, isRain: false, slippery: false };
    } else {
      this.scene.fog = new THREE.FogExp2(0x1e293b, 0.0040);
      this.sunLight.color.setHex(0x94a3b8);
      this.sunLight.intensity = 0.5;
      this.ambientLight.intensity = 0.35;
      this.cloudMat.color.setHex(0x334155);
      this.cloudsGroup.visible = true;
      this.birdsGroup.visible = false;
      this.fireflies.visible = false;
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
    this.skyDome.position.set(focusPos.x, 0, focusPos.z);
    this.celestial.position.set(focusPos.x + 120, 145, focusPos.z - 330);
    if (this.stars.visible) this.stars.position.set(focusPos.x, 0, focusPos.z);

    // Drift Clouds
    if (this.cloudsGroup.visible) {
      this.cloudsGroup.position.set(focusPos.x, 0, focusPos.z);
      for (const c of this.clouds) {
        c.mesh.position.x += c.speed * dt;
        if (c.mesh.position.x > 220) c.mesh.position.x = -220;
      }
    }

    // Animate Flying Birds
    if (this.birdsGroup.visible) {
      this.birdsGroup.position.set(focusPos.x, 0, focusPos.z);
      for (const b of this.birds) {
        b.phase += dt * 11;
        b.angle += dt * 0.22;
        const flap = Math.sin(b.phase) * 0.65;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
        b.group.position.x += Math.cos(b.angle) * b.speed * dt;
        b.group.position.z += Math.sin(b.angle) * b.speed * dt;
        b.group.rotation.y = -b.angle;
      }
    }

    // Float Golden Dust / Fireflies
    if (this.fireflies.visible) {
      this.fireflies.position.set(focusPos.x, 0, focusPos.z);
      const p = this.fireflies.geometry.attributes.position.array;
      for (let i = 1; i < p.length; i += 3) {
        p[i] += Math.sin(performance.now() * 0.002 + i) * 0.45 * dt;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }

    // Rain + Lightning
    if (this.rainPoints.visible) {
      this.rainPoints.position.set(focusPos.x, 0, focusPos.z);
      const pos = this.rainPoints.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 34 * dt;
        if (pos[i] < -5) pos[i] = 40;
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;

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
