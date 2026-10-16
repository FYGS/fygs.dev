import type { PlaygroundTemplate } from "../_types";

import { playgroundTemplates } from "./templates";

export { playgroundTemplates };

export function getTemplateById(id: string): PlaygroundTemplate | undefined {
  return playgroundTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): PlaygroundTemplate[] {
  return playgroundTemplates.filter((t) => t.category === category);
}
