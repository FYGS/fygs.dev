import { algorithmsSystemDesignItems } from "./algorithms-system-design";
import { architecturePlaygroundItems } from "./architecture-playground";
import { careerSecurityItems } from "./career-security";
import { frontendBackendItems } from "./frontend-backend";
import { resourcesItems } from "./resources";
import { subpagesItems } from "./subpages";
import type { SearchIndexItem } from "./types";

export type { SearchIndexItem } from "./types";

// Index de recherche complet pour tous les sujets
// (the order of the groups is the order of the original single array)
export const searchIndex: SearchIndexItem[] = [
  ...algorithmsSystemDesignItems,
  ...frontendBackendItems,
  ...architecturePlaygroundItems,
  ...careerSecurityItems,
  ...resourcesItems,
  ...subpagesItems,
];
