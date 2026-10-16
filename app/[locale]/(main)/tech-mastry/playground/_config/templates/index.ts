import type { PlaygroundTemplate } from "../../_types";

import { backendAlgorithmsTemplates } from "./backend-algorithms";
import { frontendTemplates } from "./frontend";
import { fullstackTemplates } from "./fullstack";
import { languageTemplates } from "./language";
import { multiFileTemplates } from "./multi-file";
import { pythonTemplates } from "./python";

// The order of the groups is the display order of the original single array.
export const playgroundTemplates: PlaygroundTemplate[] = [
  ...languageTemplates,
  ...frontendTemplates,
  ...backendAlgorithmsTemplates,
  ...fullstackTemplates,
  ...pythonTemplates,
  ...multiFileTemplates,
];
