/** Whether stored lesson content is HTML (written by the rich-text editor) rather than Markdown. */
export function looksLikeHtml(content: string): boolean {
  return /^\s*<(p|h[1-6]|ul|ol|pre|blockquote|div|table|img|hr|figure)\b/i.test(content);
}
