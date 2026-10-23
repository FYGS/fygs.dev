import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { looksLikeHtml } from "./html-detect";

export { looksLikeHtml };

/**
 * Lesson content is stored either as HTML (what the rich-text editor writes) or as Markdown (what the seed and
 * older lessons hold). Learners see both through the same renderer (react-markdown + rehype-raw). The editor only
 * speaks HTML, so Markdown is converted when a lesson is opened for editing, and saved as HTML from then on:
 * the author never sees `# Title` as literal text, and the formatting survives the first edit.
 */
export function lessonContentToEditorHtml(content: string | null | undefined): string {
  if (!content || !content.trim()) return "";
  if (looksLikeHtml(content)) return content;
  return renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, content));
}
