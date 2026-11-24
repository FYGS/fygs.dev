import type { ArrayElement } from "./types";

export function createSortedArray(size: number): ArrayElement[] {
  const newArray: ArrayElement[] = [];
  for (let i = 0; i < size; i++) {
    newArray.push({
      value: i * 2 + 1, // Valeurs impaires pour un tableau trié
      state: "default",
    });
  }
  return newArray;
}

// Obtenir la couleur en fonction de l'état
export function getColorForState(state: string): number {
  switch (state) {
    case "default":
      return 0xcccccc;
    case "current":
      return 0x3b82f6; // blue-500
    case "found":
      return 0x10b981; // emerald-500
    case "not-found":
      return 0xef4444; // red-500
    case "range":
      return 0xf59e0b; // amber-500
    case "searching":
      return 0x8b5cf6; // violet-500
    default:
      return 0xcccccc;
  }
}
