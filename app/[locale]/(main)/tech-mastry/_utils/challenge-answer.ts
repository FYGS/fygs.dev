/**
 * Vérification d'une réponse saisie sous la forme « input => réponse »
 * (ex. « 1,2,5 | 11 => 3 »). L'input peut lui-même contenir des « | ».
 */
export interface ParsedAnswer {
  input: string;
  answer: string | null;
}

export function parseChallengeAnswer(raw: string): ParsedAnswer {
  const idx = raw.lastIndexOf("=>");
  if (idx === -1) return { input: raw.trim(), answer: null };
  return {
    input: raw.slice(0, idx).trim(),
    answer: raw.slice(idx + 2).trim(),
  };
}

export interface ChallengeEvaluation {
  /** Sortie de référence calculée par `verify` pour l'input saisi (ou message d'erreur). */
  expected: string;
  /** true seulement si une réponse a été fournie et qu'elle égale la sortie de référence. */
  correct: boolean;
}

export function evaluateChallengeAnswer(
  verify: (input: string) => string,
  raw: string,
): ChallengeEvaluation {
  const { input, answer } = parseChallengeAnswer(raw);
  let expected: string;
  try {
    expected = verify(input);
  } catch {
    return { expected: "Entrée invalide : respectez le format des exemples", correct: false };
  }
  return { expected, correct: answer !== null && answer === expected.trim() };
}
