export type QuestionDifficulty = "easy" | "medium" | "hard";

/** One multiple-choice question of a topic's self-check. */
export interface TopicQuestion {
  /** Unique across the whole catalog, e.g. "git-workflows-1" */
  id: string;
  question: string;
  /** Exactly four options, none empty, none repeated */
  options: string[];
  correctIndex: number;
  /** Why the answer is right (and what the tempting wrong ones get wrong): one to three sentences */
  explanation: string;
  difficulty: QuestionDifficulty;
}

/** The questions of an area, by topic route. */
export type AreaQuizzes = Record<string, TopicQuestion[]>;
