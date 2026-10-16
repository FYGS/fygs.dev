import type { DataStructureInfo, DataStructureType } from "../types";
import { linearStructures } from "./linear-structures";
import { nonLinearStructures } from "./non-linear-structures";

// Données des structures de données
export const dataStructures: Record<DataStructureType, DataStructureInfo> = {
  ...linearStructures,
  ...nonLinearStructures,
};
