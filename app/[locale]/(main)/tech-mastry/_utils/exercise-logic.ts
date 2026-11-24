import type { ClassifyExercise, FillExercise, MatchExercise, OrderExercise } from "../_catalog/exercises";

/**
 * The rules of the hands-on exercises, apart from any React so that they can be tested alone.
 * The mixing is seeded by the exercise id: the server and the browser render the same page, and a learner
 * who comes back finds the exercise in the same state.
 */

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A permutation of 0..n-1 that is never the identity (n >= 2), the same for the same seed. */
export function mixedOrder(n: number, seed: string): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let state = hash(seed) || 1;
  for (let i = n - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (n >= 2 && order.every((value, index) => value === index)) order.push(order.shift() as number);
  return order;
}

/** For each position of the learner's arrangement: is the step in the right place? `arrangement[i]` is a step index. */
export function checkOrder(exercise: OrderExercise, arrangement: number[]): boolean[] {
  return arrangement.map((step, position) => step === position);
}

/** `choice[i]` is the index (in `pairs`) of the definition chosen for term i, or null. */
export function checkMatch(exercise: MatchExercise, choice: Array<number | null>): boolean[] {
  return exercise.pairs.map((_, index) => choice[index] === index);
}

/** `choice[i]` is the index of the option chosen for blank i+1, or null. */
export function checkFill(exercise: FillExercise, choice: Array<number | null>): boolean[] {
  return exercise.blanks.map((blank, index) => choice[index] === blank.answer);
}

/** `choice[i]` is the category chosen for item i, or null. */
export function checkClassify(exercise: ClassifyExercise, choice: Array<number | null>): boolean[] {
  return exercise.items.map((item, index) => choice[index] === item.category);
}

export const allRight = (results: boolean[]) => results.length > 0 && results.every(Boolean);

export type CodePart = { text: string } | { blank: number };

/** Splits a code sample at its {{n}} markers: [{text}, {blank: 1}, {text}, ...]. Blank numbers start at 1. */
export function splitCode(code: string): CodePart[] {
  const parts: CodePart[] = [];
  let last = 0;
  for (const match of code.matchAll(/\{\{(\d+)\}\}/g)) {
    if (match.index > last) parts.push({ text: code.slice(last, match.index) });
    parts.push({ blank: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return parts;
}
