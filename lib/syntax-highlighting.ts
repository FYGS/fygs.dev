import { bundledLanguages, createHighlighter } from "shiki";

export async function highlightCode(code: string, lang: string) {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: Object.keys(bundledLanguages),
  });

  const html = highlighter.codeToHtml(code, {
    lang,
    theme: "github-dark",
  });

  return html;
}
