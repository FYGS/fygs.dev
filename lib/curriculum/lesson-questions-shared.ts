/** Shapes and limits of the questions inbox, safe for the browser (no database access). */

export type QuestionFilter = "todo" | "answered" | "solved" | "all";

export const QUESTIONS_PAGE_SIZE = 15;
export const ANSWER_MIN_LENGTH = 10;
export const ANSWER_MAX_LENGTH = 5000;

export interface QuestionReply {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  fromTeam: boolean;
}

export interface LessonQuestion {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorName: string;
  isSolved: boolean;
  /** An administrator or an instructor already replied. */
  answeredByTeam: boolean;
  course: { id: string; title: string; slug: string };
  lesson: { title: string; slug: string };
  replies: QuestionReply[];
}

export interface QuestionPage {
  rows: LessonQuestion[];
  total: number;
  /** Questions not solved and without an answer from the team, whatever the filter: the badge of the menu. */
  todo: number;
  page: number;
  pages: number;
}
