import { normalizeRoute } from "../normalize";
import { aiMasteryExercises } from "./ai-mastery";
import { algorithmsExercises } from "./algorithms";
import { architectureExercises } from "./architecture";
import { backendExercises } from "./backend";
import { bestPracticesExercises } from "./best-practices";
import { careerExercises } from "./career";
import { dataScienceExercises } from "./data-science";
import { dataStructuresExercises } from "./data-structures";
import { frontendExercises } from "./frontend";
import { gitMasteryExercises } from "./git-mastery";
import { practiceExercises } from "./practice";
import { securityDevopsExercises } from "./security-devops";
import { systemDesignExercises } from "./system-design";
import { typescriptMasteryExercises } from "./typescript-mastery";
import type { AreaExercises, TopicExercise } from "./types";

export type { AreaExercises, ClassifyExercise, FillExercise, MatchExercise, OrderExercise, TopicExercise } from "./types";

export const EXERCISES: AreaExercises = {
  ...aiMasteryExercises,
  ...algorithmsExercises,
  ...architectureExercises,
  ...backendExercises,
  ...bestPracticesExercises,
  ...careerExercises,
  ...dataScienceExercises,
  ...dataStructuresExercises,
  ...frontendExercises,
  ...gitMasteryExercises,
  ...practiceExercises,
  ...securityDevopsExercises,
  ...systemDesignExercises,
  ...typescriptMasteryExercises,
};

/** The hands-on exercises of a topic (any form of the path), or an empty list. */
export function exercisesFor(path: string): TopicExercise[] {
  return EXERCISES[normalizeRoute(path)] ?? [];
}
