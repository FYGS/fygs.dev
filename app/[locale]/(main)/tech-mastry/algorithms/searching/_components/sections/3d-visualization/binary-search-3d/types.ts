// Types pour la visualisation
export type ElementState =
  | "default"
  | "current"
  | "found"
  | "not-found"
  | "searching"
  | "range";

export type ArrayElement = {
  value: number;
  state: ElementState;
};

// Type pour les étapes de l'algorithme
export type SearchStep = {
  left?: number;
  right?: number;
  mid?: number;
  state: ElementState;
  message?: string;
};
