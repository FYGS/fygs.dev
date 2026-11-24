// Types pour la visualisation
export type AlgorithmType = "linear" | "binary" | "jump" | "interpolation";
export type ElementState = "default" | "current" | "found" | "not-found" | "searching";

export type ArrayElement = {
  value: number;
  state: ElementState;
};

// Types pour les étapes d'animation
export type LinearSearchStep = {
  index: number;
  state: "found" | "searching" | "not-found";
};

export type BinarySearchStep = {
  left: number;
  right: number;
  mid: number;
  state: "found" | "searching" | "not-found";
};

export type JumpSearchStep = {
  prev?: number;
  current?: number;
  index?: number;
  state?: "found" | "searching" | "not-found";
  blockSearch?: boolean;
  message?: string;
};

export type InterpolationSearchStep = {
  low?: number;
  high?: number;
  pos?: number;
  state?: "found" | "searching" | "not-found";
  formula?: string;
};
