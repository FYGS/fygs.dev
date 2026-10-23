/** Quiz and exam questions: the shape the editors send and the rules a question must follow. Pure, shared by browser and server. */

export interface QuestionInput {
  /** Present when the question already exists: its id is kept so past attempts keep pointing at it. */
  id?: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string | null;
}

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

/** Returns the cleaned questions, or the first problem found (with its position for the editor). */
export function validateQuestions(
  questions: readonly QuestionInput[],
): { ok: true; questions: QuestionInput[] } | { ok: false; error: string } {
  const cleaned: QuestionInput[] = [];
  for (let i = 0; i < questions.length; i++) {
    const n = i + 1;
    const q = questions[i];
    const text = q.question.trim();
    if (!text) return { ok: false, error: `Question ${n} : l'énoncé est vide.` };
    const options = q.options.map((o) => o.trim());
    if (options.length < MIN_OPTIONS) return { ok: false, error: `Question ${n} : au moins ${MIN_OPTIONS} réponses sont nécessaires.` };
    if (options.length > MAX_OPTIONS) return { ok: false, error: `Question ${n} : ${MAX_OPTIONS} réponses au maximum.` };
    if (options.some((o) => !o)) return { ok: false, error: `Question ${n} : une réponse est vide.` };
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
      return { ok: false, error: `Question ${n} : deux réponses sont identiques.` };
    }
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= options.length) {
      return { ok: false, error: `Question ${n} : choisissez la bonne réponse.` };
    }
    cleaned.push({ id: q.id, question: text, options, correct: q.correct, explanation: q.explanation?.trim() || null });
  }
  return { ok: true, questions: cleaned };
}
