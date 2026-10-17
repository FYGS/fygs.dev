import * as THREE from "three";
import { getColorForState } from "./elements";
import type { ArrayElement } from "./types";

// Libérer la géométrie, le matériau et la texture d'un objet de la scène
function disposeObject(object: THREE.Object3D) {
  if (object instanceof THREE.Mesh) {
    object.geometry.dispose();
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose());
    } else {
      object.material.dispose();
    }
  } else if (object instanceof THREE.Sprite) {
    if (
      object.material instanceof THREE.SpriteMaterial &&
      object.material.map
    ) {
      object.material.map.dispose();
    }
    object.material.dispose();
  }
}

// Créer les cubes pour représenter le tableau
export function rebuildCubes(scene: THREE.Scene, array: ArrayElement[]): THREE.Mesh[] {
  // Supprimer uniquement les cubes et sprites, pas les lumières ni le plan
  const objectsToRemove = [];
  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];
    // Ne supprime pas les lumières ni le plan (qui est le premier mesh ajouté)
    if (
      (object instanceof THREE.Mesh &&
        object.geometry instanceof THREE.BoxGeometry) ||
      object instanceof THREE.Sprite
    ) {
      objectsToRemove.push(object);
    }
  }

  // Maintenant supprime les objets identifiés
  objectsToRemove.forEach((object) => {
    disposeObject(object);
    scene.remove(object);
  });

  // Créer de nouveaux cubes
  const cubes: THREE.Mesh[] = [];

  array.forEach((item, index) => {
    const cubeGeometry = new THREE.BoxGeometry(1, item.value / 2, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: getColorForState(item.state),
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      index * 1.5 - (array.length * 1.5) / 2 + 0.75,
      item.value / 4,
      0
    );

    // Créer un sprite pour afficher la valeur
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      canvas.width = 64;
      canvas.height = 64;
      context.fillStyle = "#000000";
      context.font = "Bold 24px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(item.value.toString(), 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(
        index * 1.5 - (array.length * 1.5) / 2 + 0.75,
        item.value / 2 + 1,
        0
      );
      sprite.scale.set(1, 1, 1);

      scene.add(cube);
      scene.add(sprite);
    } else {
      scene.add(cube);
    }

    cubes.push(cube);
  });

  return cubes;
}

// Mettre à jour l'état des cubes
export function updateCubeColors(cubes: THREE.Mesh[], array: ArrayElement[]) {
  array.forEach((item, index) => {
    if (index < cubes.length) {
      const cube = cubes[index];
      if (
        !Array.isArray(cube.material) &&
        cube.material instanceof THREE.MeshStandardMaterial
      ) {
        cube.material.color.set(getColorForState(item.state));
      }
    }
  });
}

// Supprimer tous les objets de la scène
export function disposeScene(scene: THREE.Scene) {
  while (scene.children.length > 0) {
    const object = scene.children[0];
    disposeObject(object);
    scene.remove(object);
  }
}
