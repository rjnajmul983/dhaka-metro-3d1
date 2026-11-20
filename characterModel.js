import * as THREE from 'three';

export function createCharacter(shirtColor = 0x0ea5e9, pantsColor = 0x1e293b, isOperator = false) {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a077, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.28), shirtMat);
  torso.position.y = 1.16;
  torso.castShadow = true;
  group.add(torso);

  if (isOperator) {
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), new THREE.MeshStandardMaterial({ color: 0xf42a41 }));
    tie.position.set(0, 1.2, 0.15);
    group.add(tie);
  }

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skinMat);
  head.position.y = 1.7;
  head.castShadow = true;
  group.add(head);

  [-0.07, 0.07].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), darkMat);
    eye.position.set(ex, 1.72, 0.16);
    group.add(eye);
  });

  if (isOperator) {
    const capTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.36), new THREE.MeshStandardMaterial({ color: 0x006a4e }));
    capTop.position.y = 1.9;
    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.16), darkMat);
    capVisor.position.set(0, 1.85, 0.2);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), accentMat);
    badge.position.set(0, 1.9, 0.19);
    group.add(capTop, capVisor, badge);
  } else {
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), darkMat);
    hair.position.y = 1.88;
    group.add(hair);
  }

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), shirtMat);
  leftArm.position.set(-0.35, 1.15, 0);
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), shirtMat);
  rightArm.position.set(0.35, 1.15, 0);
  group.add(leftArm, rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), pantsMat);
  leftLeg.position.set(-0.14, 0.42, 0);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), pantsMat);
  rightLeg.position.set(0.14, 0.42, 0);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.1, 0.25), darkMat);
  leftShoe.position.set(0, -0.36, 0.03);
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.1, 0.25), darkMat);
  rightShoe.position.set(0, -0.36, 0.03);
  rightLeg.add(rightShoe);

  group.add(leftLeg, rightLeg);

  let walkCycle = Math.random() * Math.PI * 2;

  return {
    mesh: group,
    animate(isMoving, dt) {
      if (isMoving) {
        walkCycle += dt * 10;
        const swing = Math.sin(walkCycle) * 0.55;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.8;
        rightArm.rotation.x = swing * 0.8;
      } else {
        walkCycle += dt * 2.2;
        leftLeg.rotation.x *= 0.85;
        rightLeg.rotation.x *= 0.85;
        leftArm.rotation.x = Math.sin(walkCycle) * 0.04;
        rightArm.rotation.x = -Math.sin(walkCycle) * 0.04;
      }
    }
  };
}
