import { normalizeRoute } from "../normalize";
import { aiMasteryQuizzes } from "./ai-mastery";
import { algorithmsQuizzes } from "./algorithms";
import { architectureQuizzes } from "./architecture";
import { backendQuizzes } from "./backend";
import { bestPracticesQuizzes } from "./best-practices";
import { careerQuizzes } from "./career";
import { dataScienceQuizzes } from "./data-science";
import { dataStructuresQuizzes } from "./data-structures";
import { frontendQuizzes } from "./frontend";
import { gitMasteryQuizzes } from "./git-mastery";
import { practiceQuizzes } from "./practice";
import { securityDevopsQuizzes } from "./security-devops";
import { systemDesignQuizzes } from "./system-design";
import { typescriptMasteryQuizzes } from "./typescript-mastery";
import type { AreaQuizzes, TopicQuestion } from "./types";

export type { AreaQuizzes, QuestionDifficulty, TopicQuestion } from "./types";

export const QUIZZES: AreaQuizzes = {
  ...aiMasteryQuizzes,
  ...algorithmsQuizzes,
  ...architectureQuizzes,
  ...backendQuizzes,
  ...bestPracticesQuizzes,
  ...careerQuizzes,
  ...dataScienceQuizzes,
  ...dataStructuresQuizzes,
  ...frontendQuizzes,
  ...gitMasteryQuizzes,
  ...practiceQuizzes,
  ...securityDevopsQuizzes,
  ...systemDesignQuizzes,
  ...typescriptMasteryQuizzes,
};

/** The self-check questions of a topic (any form of the path), or an empty list. */
export function questionsFor(path: string): TopicQuestion[] {
  return QUIZZES[normalizeRoute(path)] ?? [];
}
