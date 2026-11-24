/**
 * Limits on the text laid out on a certificate: it is one page, whatever the account or the course is called. Text is cut
 * before layout so the work done and the space used are bounded.
 */

export const MAX_NAME_CHARS = 100;
export const MAX_TITLE_CHARS = 160;
export const MAX_COURSES_CHARS = 360;
/** Lines a block may use (the width wraps the text; this stops a very long string from filling the page). */
export const MAX_LINES = 3;

/** `text` cut to `max` characters (with an ellipsis). */
export function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
