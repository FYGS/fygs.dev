import { algorithmsSystemDesignItems } from "./algorithms-system-design";
import { architecturePlaygroundItems } from "./architecture-playground";
import { careerSecurityItems } from "./career-security";
import { catalogSearchItems } from "./catalog-items";
import { frontendBackendItems } from "./frontend-backend";
import { resourcesItems } from "./resources";
import { subpagesItems } from "./subpages";
import type { SearchIndexItem } from "./types";

export type { SearchIndexItem } from "./types";

// Index de recherche complet pour tous les sujets
// (the order of the groups is the order of the original single array)
const handWritten: SearchIndexItem[] = [
  ...algorithmsSystemDesignItems,
  ...frontendBackendItems,
  ...architecturePlaygroundItems,
  ...careerSecurityItems,
  ...resourcesItems,
  ...subpagesItems,
];

// then every page of the catalog that no hand-written entry describes
export const searchIndex: SearchIndexItem[] = [
  ...handWritten,
  ...catalogSearchItems(new Set(handWritten.map((item) => item.href))),
];
