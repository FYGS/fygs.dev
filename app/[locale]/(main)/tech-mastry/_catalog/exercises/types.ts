/**
 * Hands-on exercises of a lesson. Four kinds, all checked locally and all usable without a mouse:
 * put steps in order, match terms to definitions, fill the blanks of a code sample, sort items into categories.
 */

interface ExerciseBase {
  /** Unique across the whole catalog, e.g. "git-workflows-order-1" */
  id: string;
  /** What to do, one or two sentences */
  prompt: string;
  /** Shown after the answer is checked: why it is so, and what the tempting mistake gets wrong */
  explanation: string;
}

/** Put the steps in the right order. `steps` is the CORRECT order; the learner sees them mixed. */
export interface OrderExercise extends ExerciseBase {
  type: "order";
  steps: string[];
}

/** Match each term with its definition. `pairs` holds the right pairs; the learner sees the definitions mixed. */
export interface MatchExercise extends ExerciseBase {
  type: "match";
  pairs: Array<{ term: string; definition: string }>;
}

/**
 * Fill the blanks of a code (or command) sample. `code` marks blanks as {{1}}, {{2}}... in order of appearance;
 * `blanks[i]` gives the choices of blank i+1 and the index of the right one.
 */
export interface FillExercise extends ExerciseBase {
  type: "fill";
  code: string;
  blanks: Array<{ options: string[]; answer: number }>;
}

/** Sort items into categories (two to four). `category` is the index in `categories`. */
export interface ClassifyExercise extends ExerciseBase {
  type: "classify";
  categories: string[];
  items: Array<{ text: string; category: number }>;
}

export type TopicExercise = OrderExercise | MatchExercise | FillExercise | ClassifyExercise;

/** The exercises of an area, by topic route. */
export type AreaExercises = Record<string, TopicExercise[]>;
