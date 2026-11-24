import type {
  AlgorithmType,
  ArrayElement,
  BinarySearchStep,
  ElementState,
  InterpolationSearchStep,
  JumpSearchStep,
  LinearSearchStep,
} from "./types";

// Mettre à jour l'état du tableau pour une étape de l'animation
export function applySearchStep(
  prev: ArrayElement[],
  step: unknown,
  algorithm: AlgorithmType,
  setResult: (result: string) => void
): ArrayElement[] {
  const newArray = [...prev].map((item) => ({
    ...item,
    state: "default" as ElementState,
  }));

  if (algorithm === "linear") {
    // Pour la recherche linéaire
    const linearStep = step as LinearSearchStep;
    if (linearStep.index >= 0) {
      newArray[linearStep.index].state = linearStep.state;

      // Marquer les éléments déjà visités
      for (let i = 0; i < linearStep.index; i++) {
        newArray[i].state = "searching";
      }
    } else if (linearStep.state === "not-found") {
      // Tous les éléments ont été vérifiés mais non trouvés
      newArray.forEach((item) => {
        item.state = "not-found";
      });
    }
  } else if (algorithm === "binary") {
    // Pour la recherche binaire
    const binaryStep = step as BinarySearchStep;
    if (binaryStep.mid >= 0) {
      newArray[binaryStep.mid].state = binaryStep.state;

      // Marquer la plage de recherche actuelle
      for (let i = binaryStep.left; i <= binaryStep.right; i++) {
        if (i !== binaryStep.mid) {
          newArray[i].state = "current";
        }
      }
    } else if (binaryStep.state === "not-found") {
      // Élément non trouvé
      newArray.forEach((item) => {
        item.state = "not-found";
      });
    }
  } else if (algorithm === "jump") {
    // Pour la recherche par saut
    const jumpStep = step as JumpSearchStep;
    if (jumpStep.blockSearch) {
      // Phase de recherche par blocs
      if (
        jumpStep.prev !== undefined &&
        jumpStep.current !== undefined
      ) {
        for (
          let i = jumpStep.prev;
          i <= jumpStep.current && i < newArray.length;
          i++
        ) {
          newArray[i].state = "current";
        }

        if (jumpStep.current < newArray.length) {
          newArray[jumpStep.current].state = "searching";
        }

        // Marquer les blocs précédents comme visités
        for (let i = 0; i < jumpStep.prev; i++) {
          newArray[i].state = "searching";
        }
      }
    } else if (jumpStep.index !== undefined && jumpStep.index >= 0) {
      // Phase de recherche linéaire dans le bloc
      if (jumpStep.state) {
        newArray[jumpStep.index].state = jumpStep.state;
      }

      // Marquer les éléments déjà visités dans le bloc
      if (jumpStep.prev !== undefined) {
        for (let i = jumpStep.prev; i < jumpStep.index; i++) {
          newArray[i].state = "searching";
        }
      }
    } else if (jumpStep.state === "not-found") {
      // Élément non trouvé
      newArray.forEach((item) => {
        item.state = "not-found";
      });
    }
  } else if (algorithm === "interpolation") {
    // Pour la recherche par interpolation
    const interpolationStep = step as InterpolationSearchStep;
    if (
      interpolationStep.pos !== undefined &&
      interpolationStep.pos >= 0
    ) {
      if (interpolationStep.state) {
        newArray[interpolationStep.pos].state = interpolationStep.state;
      }

      // Marquer la plage de recherche actuelle
      if (
        interpolationStep.low !== undefined &&
        interpolationStep.high !== undefined
      ) {
        for (
          let i = interpolationStep.low;
          i <= interpolationStep.high;
          i++
        ) {
          if (i !== interpolationStep.pos) {
            newArray[i].state = "current";
          }
        }
      }

      // Afficher la formule d'interpolation
      if (interpolationStep.formula) {
        setResult(`Formule: ${interpolationStep.formula}`);
      }
    } else if (interpolationStep.state === "not-found") {
      // Élément non trouvé
      newArray.forEach((item) => {
        item.state = "not-found";
      });
    }
  }

  return newArray;
}
