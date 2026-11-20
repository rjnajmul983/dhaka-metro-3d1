import * as THREE from 'three';

function createBuildingTexture(baseHex, isNight = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 128, 256);
  for (let y = 12; y < 244; y += 22) {
    for (let x = 10; x < 118; x += 22) {
      const lit = isNight && Math.random() > 0.45;
      ctx.fillStyle = lit ? '#fde047' : '#1e293b';
      ctx.fillRect(x, y, 14, 12);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createDhakaCity(totalLength = 6600) {
  const cityGroup = new THREE.Group();
  const trafficVehicles = [];
  const buildingMaterials = [];

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, totalLength + 600), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -10, -totalLength / 2 + 100);
  ground.receiveShadow = true;
  cityGroup.add(ground);

  const divider = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.3, totalLength + 500),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  divider.position.set(-2.2, -9.85, -totalLength / 2 + 100);
  cityGroup.add(divider);

  const viaductMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const viaduct = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.2, totalLength + 400), viaductMat);
  viaduct.position.set(-2.2, -0.6, -totalLength / 2 + 100);
  viaduct.receiveShadow = true;
  cityGroup.add(viaduct);

  [-7.7, 3.3].forEach((px) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, totalLength + 400), viaductMat);
    wall.position.set(px, 0.5, -totalLength / 2 + 100);
    cityGroup.add(wall);
  });

  const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  [-5.15, -3.65, -0.75, 0.75].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, totalLength + 400), railMat);
    rail.position.set(rx, 0.08, -totalLength / 2 + 100);
    cityGroup.add(rail);
  });

  const wireMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
  [-4.4, 0].forEach((wx) => {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, totalLength + 400), wireMat);
    wire.position.set(wx, 5.95, -totalLength / 2 + 100);
    cityGroup.add(wire);
  });

  const pillarCount = Math.ceil((totalLength + 240) / 36);
  const pillarInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.15, 1.35, 9.5, 8), viaductMat, pillarCount);
  const mastInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.2, 6.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 }),
    pillarCount
  );

  const dummy = new THREE.Object3D();
  for (let i = 0; i < pillarCount; i++) {
    const z = 120 - i * 36;
    dummy.position.set(-2.2, -5.2, z);
    dummy.updateMatrix();
    pillarInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(-2.2, 3.1, z);
    dummy.updateMatrix();
    mastInst.setMatrixAt(i, dummy.matrix);
  }
  cityGroup.add(pillarInst, mastInst);

  const treeCount = Math.ceil(totalLength / 28) * 2;
  const trunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.25, 0.35, 3.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c4033 }),
    treeCount
  );
  const crownInst = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(2.2, 0),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }),
    treeCount
  );
  let tIdx = 0;
  for (let z = 120; z > -totalLength - 80; z -= 28) {
    [-16, 15].forEach((tx) => {
      if (tIdx >= treeCount) return;
      dummy.position.set(tx, -8.4, z);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(tIdx, dummy.matrix);
      dummy.position.set(tx, -6.0, z);
      dummy.updateMatrix();
      crownInst.setMatrixAt(tIdx, dummy.matrix);
      tIdx++;
    });
  }
  cityGroup.add(trunkInst, crownInst);

  const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const lampGeo = new THREE.BoxGeometry(0.6, 0.25, 0.6);
  for (let z = 100; z > -totalLength; z -= 70) {
    const head = new THREE.Mesh(lampGeo, lampHeadMat);
    head.position.set(-2.2, -3.5, z);
    cityGroup.add(head);
  }

  const palettes = ['#d6d3d1', '#cbd5e1', '#fde68a', '#fecaca', '#bfdbfe', '#a8a29e'];
  palettes.forEach((hex) => {
    buildingMaterials.push({
      dayTex: createBuildingTexture(hex, false),
      nightTex: createBuildingTexture(hex, true),
      mat: new THREE.MeshStandardMaterial({ map: createBuildingTexture(hex, false), roughness: 0.85 })
    });
  });

  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  for (let z = 140; z > -totalLength - 140; z -= 30) {
    [-1, 1].forEach((side) => {
      const width = 11 + Math.random() * 14;
      const depth = 12 + Math.random() * 12;
      const height = 15 + Math.random() * 38;
      const bm = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
      const b = new THREE.Mesh(bGeo, bm.mat);
      b.scale.set(width, height, depth);
      b.position.set(side * (24 + width / 2 + Math.random() * 12) - 2, -10 + height / 2, z);
      cityGroup.add(b);
    });
  }

  const busColors = [0xef4444, 0x2563eb, 0xf59e0b, 0x10b981];
  for (let i = 0; i < 55; i++) {
    const type = i % 3;
    let mesh;
    if (type === 0) {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 7.8), new THREE.MeshStandardMaterial({ color: busColors[i % busColors.length] }));
      mesh.position.y = -8.65;
    } else if (type === 1) {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 2.4), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      mesh.position.y = -9.25;
    } else {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 3.8), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      mesh.position.y = -9.35;
    }
    const lane = i % 2 === 0 ? -10 : 7;
    const dir = lane < 0 ? 1 : -1;
    mesh.position.x = lane;
    mesh.position.z = -Math.random() * totalLength;
    cityGroup.add(mesh);
    trafficVehicles.push({ mesh, speed: (7 + Math.random() * 13) * dir });
  }

  return {
    mesh: cityGroup,
    setNightMode(isNight) {
      for (const bm of buildingMaterials) {
        bm.mat.map = isNight ? bm.nightTex : bm.dayTex;
        bm.mat.emissive = new THREE.Color(isNight ? 0x332b00 : 0x000000);
        bm.mat.needsUpdate = true;
      }
      lampHeadMat.color.setHex(isNight ? 0xfef08a : 0x64748b);
    },
    update(dt) {
      for (const c of trafficVehicles) {
        c.mesh.position.z += c.speed * dt;
        if (c.mesh.position.z > 200) c.mesh.position.z = -totalLength;
        if (c.mesh.position.z < -totalLength - 100) c.mesh.position.z = 180;
      }
    }
  };
}
