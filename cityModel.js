import * as THREE from 'three';

function createRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1e242b';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }
  ctx.fillStyle = '#facc15';
  ctx.fillRect(22, 0, 8, 512);
  ctx.fillRect(482, 0, 8, 512);
  ctx.fillStyle = '#e2e8f0';
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(138, y, 8, 36);
    ctx.fillRect(366, y, 8, 36);
  }
  ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
  for (let x = 44; x < 468; x += 28) {
    if (x > 228 && x < 284) continue;
    ctx.fillRect(x, 0, 14, 34);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 140);
  return tex;
}

function createCurbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < 256; y += 64) {
    ctx.fillStyle = (y / 64) % 2 === 0 ? '#dc2626' : '#f8fafc';
    ctx.fillRect(0, y, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 320);
  return tex;
}

function createBuildingTexture(baseHex, accentHex, isNight = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 48) {
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, y, 256, 6);
    for (let x = 14; x < 240; x += 46) {
      const lit = isNight && Math.random() > 0.42;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + 12, 30, 24);
      ctx.fillStyle = lit ? '#fde047' : '#334155';
      ctx.fillRect(x + 2, y + 14, 26, 20);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(x, y + 26, 30, 2);
      ctx.fillRect(x + 14, y + 14, 2, 20);
      if ((x + y) % 3 === 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 32, y + 22, 10, 10);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 34, y + 24, 5, 5);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createShopSignTexture(titleBn, subBn, bgHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(titleBn, 256, 62);
  ctx.fillStyle = '#fef08a';
  ctx.font = '600 22px sans-serif';
  ctx.fillText(subBn, 256, 100);
  return new THREE.CanvasTexture(canvas);
}

function createBillboardTexture(line1, line2, bg1, bg2) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, bg1);
  grad.addColorStop(1, bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(line1, 256, 112);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(line2, 256, 172);
  return new THREE.CanvasTexture(canvas);
}

function createDhakaVehicle(type, colorHex) {
  const g = new THREE.Group();
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.15 });
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  if (type === 0) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.45, 2.55, 8.2), new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 }));
    body.position.y = 1.65;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.35, 8.22), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    stripe.position.y = 1.45;
    const wind = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 8.24), glassMat);
    wind.position.y = 2.15;
    g.add(body, stripe, wind);
    [-0.85, 0.85].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), headMat);
      hl.position.set(hx, 0.95, 4.12);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), tailMat);
      tl.position.set(hx, 0.95, -4.12);
      g.add(hl, tl);
    });
  } else if (type === 1) {
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.85, 2.45), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }));
    lower.position.y = 0.72;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.72, 1.9), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }));
    roof.position.set(0, 1.45, -0.1);
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.1), headMat);
    hl.position.set(0, 0.75, 1.24);
    g.add(lower, roof, hl);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.7, 4.0), new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.35, roughness: 0.4 }));
    body.position.y = 0.65;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.58, 2.0), glassMat);
    cabin.position.set(0, 1.22, -0.15);
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.08), headMat);
    hl1.position.set(-0.55, 0.68, 2.01);
    const hl2 = hl1.clone(); hl2.position.x = 0.55;
    g.add(body, cabin, hl1, hl2);
  }

  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  const wz = type === 0 ? [-2.6, 2.6] : [-0.9, 0.9];
  const wx = type === 0 ? 1.2 : type === 1 ? 0.65 : 0.88;
  wz.forEach((z) => {
    [-wx, wx].forEach((x) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, 0.35, z);
      g.add(w);
    });
  });
  return g;
}

// Iconic Dhaka Landmarks Builder (v6)
function addDhakaLandmarks(cityGroup) {
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.2 });

  // 1. Diabari Lake & Depot Shed (Near Uttara North z = +80)
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(80, 180), waterMat);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(-65, -9.9, 60);
  cityGroup.add(lake);

  const depotShed = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 65), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  depotShed.position.set(42, -5, 110);
  cityGroup.add(depotShed);

  // 2. National Parliament House (জাতীয় সংসদ ভবন) near Bijoy Sarani (z = -3860)
  const parliament = new THREE.Group();
  parliament.position.set(-72, -10, -3860);
  const mainBlock = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 32, 8), concreteMat);
  mainBlock.position.y = 16;
  const parlLake = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), waterMat);
  parlLake.rotation.x = -Math.PI / 2;
  parlLake.position.y = 0.2;
  parliament.add(mainBlock, parlLake);
  cityGroup.add(parliament);

  // 3. Farmgate Footover Bridge (z = -4280)
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.4, roughness: 0.5 });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(32, 1.2, 4.2), bridgeMat);
  bridgeDeck.position.set(-2.2, -4.6, -4280);
  cityGroup.add(bridgeDeck);

  // 4. Raju Sculpture & TSC Landmark near Dhaka University (z = -5460)
  const rajuBase = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 2.2, 12), concreteMat);
  rajuBase.position.set(-28, -8.9, -5460);
  const rajuStatue = new THREE.Mesh(new THREE.ConeGeometry(2.8, 7.5, 6), new THREE.MeshStandardMaterial({ color: 0x78716c }));
  rajuStatue.position.set(-28, -4.2, -5460);
  cityGroup.add(rajuBase, rajuStatue);

  // 5. Shapla Chattar (শাপলা চত্বর) & Bangladesh Bank Tower at Motijheel (z = -6380)
  const shaplaGroup = new THREE.Group();
  shaplaGroup.position.set(-26, -10, -6380);
  const fountain = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 1.6, 16), waterMat);
  fountain.position.y = 0.8;
  const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(3.8, 0), new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x38bdf8, emissiveIntensity: 0.25 }));
  lotus.position.y = 4.6;
  shaplaGroup.add(fountain, lotus);
  cityGroup.add(shaplaGroup);

  const bbTower = new THREE.Mesh(
    new THREE.BoxGeometry(22, 68, 22),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.35, roughness: 0.4 })
  );
  bbTower.position.set(42, 24, -6380);
  cityGroup.add(bbTower);
}

export function createDhakaCity(totalLength = 6600) {
  const cityGroup = new THREE.Group();
  const trafficVehicles = [];
  const buildingMaterials = [];
  const glowMaterials = [];
  const atpSignals = [];

  // Ground, Road, Curbs, Divider
  const baseGround = new THREE.Mesh(new THREE.PlaneGeometry(460, totalLength + 700), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 }));
  baseGround.rotation.x = -Math.PI / 2;
  baseGround.position.set(0, -10.05, -totalLength / 2 + 100);
  cityGroup.add(baseGround);

  const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, totalLength + 600), new THREE.MeshStandardMaterial({ map: createRoadTexture(), roughness: 0.88 }));
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(-2.2, -9.98, -totalLength / 2 + 100);
  roadMesh.receiveShadow = true;
  cityGroup.add(roadMesh);

  const curbMat = new THREE.MeshStandardMaterial({ map: createCurbTexture(), roughness: 0.8 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  [-17.5, 13.1].forEach((sx) => {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, totalLength + 600), sidewalkMat);
    sidewalk.position.set(sx, -9.82, -totalLength / 2 + 100);
    cityGroup.add(sidewalk);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, totalLength + 600), curbMat);
    curb.position.set(sx < 0 ? sx + 2.3 : sx - 2.3, -9.8, -totalLength / 2 + 100);
    cityGroup.add(curb);
  });

  const divider = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, totalLength + 500), curbMat);
  divider.position.set(-2.2, -9.78, -totalLength / 2 + 100);
  cityGroup.add(divider);

  // Viaduct & Rails
  const viaductMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const viaduct = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.2, totalLength + 400), viaductMat);
  viaduct.position.set(-2.2, -0.6, -totalLength / 2 + 100);
  viaduct.receiveShadow = true;
  cityGroup.add(viaduct);

  [-7.7, 3.3].forEach((px) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.15, totalLength + 400), viaductMat);
    wall.position.set(px, 0.52, -totalLength / 2 + 100);
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

  // Trackside ATP Rail Signals (Every 800m)
  const sigPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  for (let z = -220; z > -totalLength; z -= 800) {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.18), sigPoleMat);
    pole.position.set(2.4, 2.1, z);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), bulbMat);
    bulb.position.set(2.4, 3.8, z + 0.12);
    cityGroup.add(pole, bulb);
    atpSignals.push({ z, bulbMat, isRed: false, timer: Math.random() * 12 });
  }

  // Instanced Pillars, OCS Masts, Trees & Streetlights
  const pillarCount = Math.ceil((totalLength + 240) / 36);
  const pillarInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.15, 1.35, 9.5, 8), viaductMat, pillarCount);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 });
  const mastInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 6.3, 0.22), mastMat, pillarCount);
  const armInst = new THREE.InstancedMesh(new THREE.BoxGeometry(5.6, 0.16, 0.16), mastMat, pillarCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < pillarCount; i++) {
    const z = 120 - i * 36;
    dummy.position.set(-2.2, -5.2, z); dummy.updateMatrix(); pillarInst.setMatrixAt(i, dummy.matrix);
    dummy.position.set(-2.2, 3.15, z); dummy.updateMatrix(); mastInst.setMatrixAt(i, dummy.matrix);
    dummy.position.set(-2.2, 6.05, z); dummy.updateMatrix(); armInst.setMatrixAt(i, dummy.matrix);
  }
  cityGroup.add(pillarInst, mastInst, armInst);

  const treeCount = Math.ceil(totalLength / 32) * 2;
  const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.34, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x5c4033 }), treeCount);
  const crownInst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(2.2, 0), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }), treeCount);
  let tIdx = 0;
  for (let z = 120; z > -totalLength - 80; z -= 32) {
    [-16.8, 12.5].forEach((tx) => {
      if (tIdx >= treeCount) return;
      dummy.position.set(tx, -8.2, z); dummy.updateMatrix(); trunkInst.setMatrixAt(tIdx, dummy.matrix);
      dummy.position.set(tx, -5.8, z); dummy.updateMatrix(); crownInst.setMatrixAt(tIdx, dummy.matrix);
      tIdx++;
    });
  }
  cityGroup.add(trunkInst, crownInst);

  const lampCount = Math.ceil(totalLength / 58) * 2;
  const poleInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 6), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 }), lampCount);
  const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const lampInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.22, 0.38), lampHeadMat, lampCount);
  let lIdx = 0;
  for (let z = 110; z > -totalLength - 40; z -= 58) {
    [-15.4, 11.0].forEach((lx) => {
      if (lIdx >= lampCount) return;
      dummy.position.set(lx, -6.7, z); dummy.updateMatrix(); poleInst.setMatrixAt(lIdx, dummy.matrix);
      dummy.position.set(lx < 0 ? lx + 0.55 : lx - 0.55, -3.65, z); dummy.updateMatrix(); lampInst.setMatrixAt(lIdx, dummy.matrix);
      lIdx++;
    });
  }
  cityGroup.add(poleInst, lampInst);

  // Iconic Landmarks
  addDhakaLandmarks(cityGroup);

  // Bengali Shops & Billboards
  const shopSpecs = [
    ['ঢাকা বিরিয়ানি হাউস', 'কাচ্চি • তেহারি • বোরহানি', '#b91c1c'],
    ['বিসমিল্লাহ ফার্মেসি', '২৪ ঘন্টা ঔষধ ও সেবা', '#047857'],
    ['মায়ের দোয়া স্টোর', 'মুদি ও ডিপার্টমেন্টাল শপ', '#1d4ed8'],
    ['রহমান টেলিকম', 'মোবাইল • বিকাশ • রিচার্জ', '#0f766e'],
    ['মিরপুর হোটেল', 'বাংলা খাবার ও মিষ্টান্ন', '#c2410c'],
    ['নিউ ফ্যাশন হাউস', 'পোশাক ও গার্মেন্টস', '#6d28d9'],
    ['ডিজিটাল প্রিন্ট জোন', 'ফটোস্ট্যাট • কম্পিউটার', '#0369a1'],
    ['আমানত বেকারি', 'তাজা কেক ও বিস্কুট', '#92400e']
  ];
  const shopMaterials = shopSpecs.map(([t1, t2, bg]) => {
    const tex = createShopSignTexture(t1, t2, bg);
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.15, roughness: 0.4 });
    glowMaterials.push(mat);
    return mat;
  });

  const billboardSpecs = [
    ['ঢাকা মেট্রো রেল', 'দ্রুত, নিরাপদ ও আধুনিক যাত্রা', '#006a4e', '#047857'],
    ['স্বপ্নের ঢাকা শহর', 'পরিচ্ছন্ন ও সবুজ নগরী গড়ি', '#1e3a8a', '#2563eb'],
    ['সোনালী চা — খাঁটি স্বাদ', 'প্রতিটি সকালের সেরা সঙ্গী', '#9a3412', '#d97706'],
    ['ডিজিটাল বাংলাদেশ', 'স্মার্ট সার্ভিস এখন হাতের মুঠোয়', '#4c1d95', '#7c3aed']
  ];
  const billboardMaterials = billboardSpecs.map(([l1, l2, c1, c2]) => {
    const tex = createBillboardTexture(l1, l2, c1, c2);
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.2, roughness: 0.35 });
    glowMaterials.push(mat);
    return mat;
  });

  const palettes = [
    ['#d6d3d1', '#a8a29e'], ['#cbd5e1', '#94a3b8'], ['#fde68a', '#d97706'],
    ['#fecaca', '#dc2626'], ['#bfdbfe', '#3b82f6'], ['#e7e5e4', '#78716c']
  ];
  palettes.forEach(([hex, acc]) => {
    const dayTex = createBuildingTexture(hex, acc, false);
    const nightTex = createBuildingTexture(hex, acc, true);
    buildingMaterials.push({ dayTex, nightTex, mat: new THREE.MeshStandardMaterial({ map: dayTex, roughness: 0.85 }) });
  });

  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  const tankGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.9, 8);
  const tankBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
  const tankBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });

  let bCounter = 0;
  for (let z = 140; z > -totalLength - 140; z -= 32) {
    [-1, 1].forEach((side) => {
      bCounter++;
      const width = 12 + Math.random() * 12;
      const depth = 14 + Math.random() * 10;
      const height = 16 + Math.random() * 34;
      const bm = buildingMaterials[bCounter % buildingMaterials.length];
      const bx = side < 0 ? -20.5 - width / 2 : 16.0 + width / 2;
      const b = new THREE.Mesh(bGeo, bm.mat);
      b.scale.set(width, height, depth);
      b.position.set(bx, -10 + height / 2, z);
      cityGroup.add(b);

      const roofY = -10 + height;
      const chilekotha = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 4.2), parapetMat);
      chilekotha.position.set(bx, roofY + 1.4, z);
      cityGroup.add(chilekotha);

      const tank = new THREE.Mesh(tankGeo, bCounter % 2 === 0 ? tankBlackMat : tankBlueMat);
      tank.position.set(bx + (side < 0 ? 2.5 : -2.5), roofY + 0.95, z + 2.5);
      cityGroup.add(tank);

      const frontX = side < 0 ? bx + width / 2 + 0.12 : bx - width / 2 - 0.12;
      const signMat = shopMaterials[bCounter % shopMaterials.length];
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.85, Math.min(depth - 2, 10.5)), signMat);
      signBoard.position.set(frontX, -5.6, z);
      cityGroup.add(signBoard);

      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.2, Math.min(depth - 3, 9.5)), shutterMat);
      shutter.position.set(frontX, -8.35, z);
      cityGroup.add(shutter);

      if (bCounter % 6 === 0) {
        const bbMat = billboardMaterials[(bCounter / 6) % billboardMaterials.length];
        const bb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 11.5), bbMat);
        bb.position.set(side < 0 ? bx + width / 2 - 1 : bx - width / 2 + 1, roofY + 3.4, z);
        cityGroup.add(bb);
      }
    });
  }

  // Traffic
  const busColors = [0xdc2626, 0x2563eb, 0xd97706, 0x059669];
  const carColors = [0xf8fafc, 0x94a3b8, 0x1e293b, 0x3b82f6];
  for (let i = 0; i < 54; i++) {
    const type = i % 3;
    const color = type === 0 ? busColors[i % busColors.length] : carColors[i % carColors.length];
    const veh = createDhakaVehicle(type, color);
    const lane = i % 2 === 0 ? -9.2 : 5.4;
    const dir = lane < 0 ? 1 : -1;
    if (dir < 0) veh.rotation.y = Math.PI;
    veh.position.set(lane, -9.98, -Math.random() * totalLength);
    cityGroup.add(veh);
    trafficVehicles.push({ mesh: veh, speed: (7 + Math.random() * 13) * dir });
  }

  return {
    mesh: cityGroup,
    setNightMode(isNight) {
      for (const bm of buildingMaterials) {
        bm.mat.map = isNight ? bm.nightTex : bm.dayTex;
        bm.mat.emissive = new THREE.Color(isNight ? 0x332b00 : 0x000000);
        bm.mat.needsUpdate = true;
      }
      for (const gm of glowMaterials) gm.emissiveIntensity = isNight ? 0.95 : 0.15;
      lampHeadMat.color.setHex(isNight ? 0xfef08a : 0x64748b);
    },
    update(dt) {
      for (const c of trafficVehicles) {
        c.mesh.position.z += c.speed * dt;
        if (c.mesh.position.z > 200) c.mesh.position.z = -totalLength;
        if (c.mesh.position.z < -totalLength - 100) c.mesh.position.z = 180;
      }
      // Cycle ATP signals
      for (const sig of atpSignals) {
        sig.timer -= dt;
        if (sig.timer <= 0) {
          sig.isRed = !sig.isRed;
          sig.timer = sig.isRed ? 6 : 16;
          sig.bulbMat.color.setHex(sig.isRed ? 0xef4444 : 0x22c55e);
        }
      }
    }
  };
}
