import * as THREE from 'three';

function createDestinationTex(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, 128, 42);
  return new THREE.CanvasTexture(canvas);
}

export function createDhakaMetroTrain(isAI = false) {
  const trainGroup = new THREE.Group();
  const doors = [];

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.45, roughness: 0.3 });
  const greenStripeMat = new THREE.MeshStandardMaterial({ color: 0x006a4e, metalness: 0.2, roughness: 0.4 });
  const redStripeMat = new THREE.MeshStandardMaterial({ color: 0xf42a41, metalness: 0.2, roughness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.12,
    emissive: 0xfef08a,
    emissiveIntensity: 0.0
  });
  const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfffbeb, emissiveIntensity: 2.5 });
  const taillightMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0 });

  const carCount = 6;
  const carLength = 19;
  const carWidth = 3.0;
  const carHeight = 3.5;
  const gap = 0.6;

  let throttleLever = null;
  let wiperPivot = null;
  let spotLight = null;

  for (let i = 0; i < carCount; i++) {
    const car = new THREE.Group();
    const zOffset = i * (carLength + gap);
    car.position.set(0, 2.2, zOffset);

    const body = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight, carLength), bodyMat);
    body.castShadow = !isAI;
    body.receiveShadow = true;
    car.add(body);

    const ac = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.32, carLength - 3.5), darkMat);
    ac.position.y = carHeight / 2 + 0.16;
    car.add(ac);

    if (i === 1 || i === 4) {
      const panto = new THREE.Group();
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), darkMat);
      arm1.position.set(0, 0.5, -0.4);
      arm1.rotation.x = 0.45;
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), darkMat);
      arm2.position.set(0, 1.35, -0.4);
      arm2.rotation.x = -0.45;
      const collector = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.15), darkMat);
      collector.position.set(0, 1.85, 0);
      panto.add(arm1, arm2, collector);
      panto.position.set(0, carHeight / 2 + 0.25, 0);
      car.add(panto);
    }

    [-1, 1].forEach((side) => {
      const greenStripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, carLength + 0.02), greenStripeMat);
      greenStripe.position.set(side * (carWidth / 2 + 0.01), -0.45, 0);
      car.add(greenStripe);

      const redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, carLength + 0.02), redStripeMat);
      redStripe.position.set(side * (carWidth / 2 + 0.01), -0.74, 0);
      car.add(redStripe);

      for (let w = -6.5; w <= 6.5; w += 3.25) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 1.8), glassMat);
        win.position.set(side * (carWidth / 2 + 0.01), 0.45, w);
        car.add(win);
      }

      if (!isAI) {
        [-4.8, 4.8].forEach((dz) => {
          const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.65), bodyMat);
          const doorRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.65), bodyMat);
          doorLeft.position.set(side * (carWidth / 2 + 0.03), -0.35, dz - 0.34);
          doorRight.position.set(side * (carWidth / 2 + 0.03), -0.35, dz + 0.34);
          car.add(doorLeft, doorRight);
          doors.push({ left: doorLeft, right: doorRight, baseZ: dz });
        });
      }
    });

    [-6, 6].forEach((bz) => {
      const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.6), darkMat);
      bogie.position.set(0, -carHeight / 2 - 0.25, bz);
      car.add(bogie);
    });

    if (i === 0) {
      const nose = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight * 0.9, 1.8), bodyMat);
      nose.position.set(0, -0.1, -carLength / 2 - 0.7);
      car.add(nose);

      const ledMat = new THREE.MeshBasicMaterial({ map: createDestinationTex(isAI ? 'UTTARA NORTH' : 'MOTIJHEEL') });
      const ledBoard = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.36, 0.1), ledMat);
      ledBoard.position.set(0, 1.32, -carLength / 2 - 1.56);
      car.add(ledBoard);

      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.12), glassMat);
      windshield.position.set(0, 0.55, -carLength / 2 - 1.56);
      windshield.rotation.x = -0.22;
      car.add(windshield);

      [-0.95, 0.95].forEach((hx) => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.15), headlightMat);
        hl.position.set(hx, -0.65, -carLength / 2 - 1.58);
        car.add(hl);
      });

      if (!isAI) {
        const cabDash = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 0.9), darkMat);
        cabDash.position.set(0, 0.35, -carLength / 2 - 1.25);
        car.add(cabDash);

        const screenMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
        const dashScreen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.05), screenMat);
        dashScreen.position.set(0, 0.72, -carLength / 2 - 1.32);
        dashScreen.rotation.x = -0.4;
        car.add(dashScreen);

        const leverMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4 });
        throttleLever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.08), leverMat);
        throttleLever.position.set(-0.55, 0.78, -carLength / 2 - 1.18);
        car.add(throttleLever);

        wiperPivot = new THREE.Group();
        wiperPivot.position.set(0, 0.02, -carLength / 2 - 1.65);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), darkMat);
        blade.position.y = 0.45;
        wiperPivot.add(blade);
        car.add(wiperPivot);

        spotLight = new THREE.SpotLight(0xfffbeb, 65, 140, Math.PI / 5, 0.4);
        spotLight.position.set(0, 0.5, -carLength / 2 - 1.65);
        spotLight.target.position.set(0, -1, -carLength / 2 - 45);
        car.add(spotLight, spotLight.target);
      }
    }

    if (i === carCount - 1) {
      [-0.95, 0.95].forEach((hx) => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.15), taillightMat);
        tl.position.set(hx, -0.65, carLength / 2 + 0.06);
        car.add(tl);
      });
    }

    if (i < carCount - 1) {
      const gangway = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, gap + 0.2), darkMat);
      gangway.position.set(0, -0.1, carLength / 2 + gap / 2);
      car.add(gangway);
    }

    trainGroup.add(car);
  }

  let doorProgress = 0;
  let doorsOpen = false;
  let wiperTime = 0;

  return {
    mesh: trainGroup,
    setDoorsOpen(open) { doorsOpen = open; },
    isDoorsOpen() { return doorsOpen; },
    applySkin(skin) {
      if (!skin) return;
      bodyMat.color.setHex(skin.body);
      greenStripeMat.color.setHex(skin.stripe1);
      redStripeMat.color.setHex(skin.stripe2);
    },
    setNightMode(isNight) {
      glassMat.emissiveIntensity = isNight ? 0.55 : 0.0;
      if (spotLight) spotLight.intensity = isNight ? 90 : 20;
    },
    update(dt, throttleVal = 0, isRaining = false) {
      const target = doorsOpen ? 1 : 0;
      doorProgress += (target - doorProgress) * Math.min(1, dt * 6);
      for (const d of doors) {
        d.left.position.z = d.baseZ - 0.34 - doorProgress * 0.58;
        d.right.position.z = d.baseZ + 0.34 + doorProgress * 0.58;
      }
      if (throttleLever) throttleLever.rotation.x = -throttleVal * 0.7;
      if (wiperPivot) {
        if (isRaining) {
          wiperTime += dt * 5.0;
          wiperPivot.rotation.z = Math.sin(wiperTime) * 0.85;
        } else {
          wiperPivot.rotation.z *= 0.9;
        }
      }
    }
  };
}
