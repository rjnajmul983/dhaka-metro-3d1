import * as THREE from 'three';
import { createCharacter } from './characterModel.js';

function createSignTexture(titleBn, titleEn) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#006a4e';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#f42a41';
  ctx.fillRect(0, 112, 512, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(titleBn, 256, 56);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(titleEn.toUpperCase(), 256, 96);
  return new THREE.CanvasTexture(canvas);
}

function createStopMarkerTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(10, 10, 108, 108);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STOP', 64, 62);
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('থামুন', 64, 98);
  return new THREE.CanvasTexture(canvas);
}

function createTvmTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#006a4e';
  ctx.fillRect(0, 0, 128, 256);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(14, 34, 100, 84);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TICKET', 64, 72);
  ctx.fillText('টিকিট', 64, 102);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(28, 146, 72, 22);
  return new THREE.CanvasTexture(canvas);
}

const sharedStopTex = createStopMarkerTex();
const sharedTvmTex = createTvmTex();

export function createStation(stationData) {
  const group = new THREE.Group();
  group.position.set(0, 0, stationData.z);

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });
  const darkRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.5 });
  const yellowLineMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.4, roughness: 0.5 });
  const lightStripMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.38,
    metalness: 0.2,
    roughness: 0.1
  });

  const length = 148;
  const platform = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.4, length), concreteMat);
  platform.position.set(5.3, 0.7, 45);
  platform.receiveShadow = true;
  group.add(platform);

  const safetyLine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, length), yellowLineMat);
  safetyLine.position.set(2.3, 1.42, 45);
  group.add(safetyLine);

  // 3D Ticket Vending Machine
  const tvmMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 2.2, 1.4),
    new THREE.MeshStandardMaterial({ map: sharedTvmTex, roughness: 0.4 })
  );
  tvmMesh.position.set(7.7, 2.5, -21);
  group.add(tvmMesh);

  // 3D AFC Smart Gates
  const afcMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
  const gateLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const flapMat = new THREE.MeshStandardMaterial({ color: 0xf42a41, transparent: true, opacity: 0.75 });
  const gateFlaps = [];

  [3.0, 5.2, 7.4].forEach((gx) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 1.6), afcMat);
    pillar.position.set(gx, 1.98, -14.5);
    group.add(pillar);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.28), gateLedMat);
    led.position.set(gx, 2.58, -15.1);
    group.add(led);
  });

  [4.1, 6.3].forEach((fx) => {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.85, 0.08), flapMat);
    flap.position.set(fx, 1.9, -14.5);
    group.add(flap);
    gateFlaps.push({ mesh: flap });
  });

  // Animated PSD
  const psdPanels = [];
  for (let z = -15; z <= 105; z += 10) {
    const fixedGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 6.2), glassMat);
    fixedGlass.position.set(2.02, 2.5, z);
    group.add(fixedGlass);
    const slideDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 3.6), glassMat);
    slideDoor.position.set(1.92, 2.45, z + 5);
    group.add(slideDoor);
    psdPanels.push({ mesh: slideDoor, baseZ: z + 5 });
  }

  // STOP Marker
  const stopBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.9), new THREE.MeshBasicMaterial({ map: sharedStopTex }));
  stopBoard.position.set(2.1, 3.2, -11);
  group.add(stopBoard);

  // Canopy & Lights
  const roof = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, length + 6), darkRoofMat);
  roof.position.set(3.2, 7.6, 45);
  group.add(roof);

  for (let z = -15; z <= 105; z += 24) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6.2, 8), concreteMat);
    col.position.set(7.8, 4.5, z);
    group.add(col);
    const led = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 6), lightStripMat);
    led.position.set(4.8, 7.25, z);
    group.add(led);
    if (z > -10) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 3.6), benchMat);
      bench.position.set(6.8, 1.68, z + 6);
      group.add(bench);
    }
  }

  const signTex = createSignTexture(stationData.nameBn, stationData.nameEn);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  [-10, 45, 95].forEach((sz) => {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 5.6), signMat);
    sign.position.set(7.2, 5.2, sz);
    group.add(sign);
  });

  // Animated Commuters
  const npcs = [];
  const shirtColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
  for (let i = 0; i < 6; i++) {
    const npc = createCharacter(shirtColors[i % shirtColors.length], 0x334155, false);
    const baseX = 3.5 + (i % 3) * 1.05;
    npc.mesh.position.set(baseX, 1.4, -2 + i * 18);
    npc.mesh.rotation.y = -Math.PI / 2;
    group.add(npc.mesh);
    npcs.push({ char: npc, baseX });
  }

  let psdProgress = 0;
  let gateOpen = false;
  let gateProgress = 0;

  return {
    mesh: group,
    z: stationData.z,
    setAfcGateOpen(open) {
      gateOpen = open;
      gateLedMat.color.setHex(open ? 0x22c55e : 0xef4444);
    },
    update(dt, trainZ, doorsOpen) {
      const isHere = Math.abs(trainZ - stationData.z) < 35;
      const target = isHere && doorsOpen ? 1 : 0;
      psdProgress += (target - psdProgress) * Math.min(1, dt * 6);

      if (psdProgress > 0.005 || target > 0) {
        for (const p of psdPanels) p.mesh.position.z = p.baseZ + psdProgress * 2.2;
      }

      const gTarget = gateOpen ? 1 : 0;
      gateProgress += (gTarget - gateProgress) * Math.min(1, dt * 8);
      if (gateProgress > 0.005 || gTarget > 0) {
        for (const f of gateFlaps) f.mesh.scale.x = Math.max(0.05, 1 - gateProgress * 0.95);
      }

      if (Math.abs(trainZ - stationData.z) < 160) {
        for (const n of npcs) {
          const targetX = target > 0 ? 2.65 : n.baseX;
          const dx = targetX - n.char.mesh.position.x;
          const moving = Math.abs(dx) > 0.05;
          if (moving) n.char.mesh.position.x += Math.sign(dx) * dt * 1.4;
          n.char.animate(moving, dt);
        }
      }
    }
  };
}
