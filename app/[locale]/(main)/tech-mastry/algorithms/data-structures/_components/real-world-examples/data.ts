import { hashTreeExamples } from "./data-hash-tree";
import { linearExamples } from "./data-linear";
import type { RealWorldExample } from "./types";

// Données des exemples concrets
export const realWorldExamples: RealWorldExample[] = [
  ...linearExamples,
  ...hashTreeExamples,
];
