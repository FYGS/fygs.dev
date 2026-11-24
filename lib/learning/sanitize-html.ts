/**
 * Sanitising of lesson HTML. Lesson text is written in the course editor (rich text, stored as HTML) or
 * as Markdown with raw HTML allowed (rehype-raw). Either way it is shown to other people, so what the
 * author typed is reduced to a white list: titles, text, lists, code, quotes, links, images, tables, video.
 * No script, no style, no event handler, no `javascript:` address, no unknown element survives.
 *
 * A rehype plugin working on the hast tree, after rehype-raw. It has no dependency so it can be tested
 * on its own; the list is wide on purpose (everything the editor can produce), strict on what runs.
 */

import { VIDEO_EMBED_SOURCES } from "@/lib/csp.mjs";

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

const TEXT_TAGS = [
  "p", "br", "hr", "span", "div", "section", "article", "aside", "header", "footer", "figure", "figcaption",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "del", "ins", "mark", "small", "sub", "sup", "abbr", "cite", "q", "kbd", "samp", "var", "time", "dfn",
  "blockquote", "pre", "code",
  "ul", "ol", "li", "dl", "dt", "dd",
  "details", "summary",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "a", "img", "picture", "source", "video", "track", "audio",
  "iframe", "input",
];
const ALLOWED_TAGS = new Set(TEXT_TAGS);

/** Removed together with what is inside them (their content is code, not text). */
const DROP_WITH_CONTENT = new Set(["script", "style", "template", "object", "embed", "applet", "noscript", "textarea", "select", "option", "button", "form", "svg", "math", "link", "meta", "base", "title", "head"]);

/**
 * Attributes allowed on every element. Deliberately absent: `id` and `name` (an author-chosen id can collide with the
 * application's own anchors, skip links and lookups, or shadow a window property: heading ids come from rehype-slug,
 * which runs after this plugin), `role` and `aria-describedby`/`aria-labelledby` (they re-purpose an element or point at
 * ids that no longer exist), `style`, `data-*` and every event handler.
 */
const GLOBAL_ATTRIBUTES = ["title", "lang", "dir", "className", "ariaLabel", "ariaHidden"];
/** Free-text attributes are kept short: a tooltip or a label is not a place for a paragraph. */
const MAX_LABEL_LENGTH = 200;
const LANGUAGE_TAG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8}){0,3}$/;
const TAG_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel", "hrefLang"],
  img: ["src", "alt", "width", "height", "loading", "srcSet", "sizes"],
  source: ["src", "srcSet", "type", "media", "sizes"],
  video: ["src", "poster", "controls", "width", "height", "preload", "loop", "muted", "playsInline", "autoPlay"],
  audio: ["src", "controls", "preload", "loop", "muted"],
  track: ["src", "kind", "srcLang", "label", "default"],
  iframe: ["src", "width", "height", "allowFullScreen", "loading", "title"],
  th: ["colSpan", "rowSpan", "scope", "align"],
  td: ["colSpan", "rowSpan", "align"],
  col: ["span"],
  colgroup: ["span"],
  ol: ["start", "reversed", "type"],
  li: ["value"],
  time: ["dateTime"],
  q: ["cite"],
  blockquote: ["cite"],
  details: ["open"],
  input: ["type", "checked", "disabled"],
  code: [],
};

const URL_ATTRIBUTES = new Set(["href", "src", "poster", "cite"]);
const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/)|#|\.{0,2}\/|[^:/?#]*(?:[/?#]|$))/i;
/** Same hosts as the `frame-src` of the Content-Security-Policy: an iframe the policy would block is not kept. */
const EMBED_HOSTS = new Set(VIDEO_EMBED_SOURCES.map((source) => new URL(source).hostname));
const SAFE_CLASS = /^(language-[\w+#.-]+|hljs[\w-]*|token|[\w-]*highlight[\w-]*|contains-task-list|task-list-item|footnotes|sr-only)$/;

function isSafeUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // control characters and spaces are skipped by browsers: "java\nscript:" must not slip through
  const normalised = value.replace(/[\u0000- \u007f-\u009f]/g, "");
  return SAFE_URL.test(normalised) && !/^(javascript|data|vbscript|file|blob):/i.test(normalised);
}

function isAllowedEmbed(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && EMBED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function cleanProperties(tag: string, properties: Record<string, unknown> = {}): Record<string, unknown> | null {
  const allowed = new Set([...GLOBAL_ATTRIBUTES, ...(TAG_ATTRIBUTES[tag] ?? [])]);
  const clean: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(properties)) {
    if (!allowed.has(name)) continue; // includes every on* handler, style, data-* and srcdoc
    if (name === "className") {
      const classes = (Array.isArray(value) ? value : [value]).filter((c): c is string => typeof c === "string" && SAFE_CLASS.test(c));
      if (classes.length > 0) clean.className = classes;
      continue;
    }
    if (URL_ATTRIBUTES.has(name)) {
      if (tag === "iframe" ? !isAllowedEmbed(value) : !isSafeUrl(value)) continue;
    }
    if (name === "srcSet" && typeof value === "string" && value.split(",").some((part) => !isSafeUrl(part.trim().split(/\s+/)[0]))) continue;
    if (name === "target" && value !== "_blank" && value !== "_self") continue;
    if ((name === "title" || name === "ariaLabel") && (typeof value !== "string" || value.length > MAX_LABEL_LENGTH)) continue;
    if (name === "lang" && (typeof value !== "string" || !LANGUAGE_TAG.test(value))) continue;
    if (name === "dir" && value !== "ltr" && value !== "rtl" && value !== "auto") continue;
    if (name === "ariaHidden" && value !== true && value !== false && value !== "true" && value !== "false") continue;
    clean[name] = value;
  }

  if (tag === "input") {
    // only the disabled check boxes of task lists ("- [ ] to do")
    if (clean.type !== "checkbox") return null;
    clean.disabled = true;
  }
  if (tag === "iframe" && !clean.src) return null;
  if (tag === "a" && clean.target === "_blank") clean.rel = ["noopener", "noreferrer"];
  return clean;
}

function sanitizeChildren(children: HastNode[] | undefined): HastNode[] {
  const out: HastNode[] = [];
  for (const node of children ?? []) {
    if (node.type === "text") {
      out.push(node);
    } else if (node.type === "element" && node.tagName) {
      const tag = node.tagName.toLowerCase();
      if (DROP_WITH_CONTENT.has(tag)) continue;
      const inner = sanitizeChildren(node.children);
      if (!ALLOWED_TAGS.has(tag)) {
        out.push(...inner); // unknown element: its text stays, the element goes
        continue;
      }
      const properties = cleanProperties(tag, node.properties);
      if (properties === null) continue;
      out.push({ ...node, tagName: tag, properties, children: inner });
    }
    // comments, doctypes, processing instructions and unknown node types are dropped
  }
  return out;
}

/** rehype plugin: `.use(rehypeSanitizeLessonHtml)` after `rehype-raw`. */
export function rehypeSanitizeLessonHtml() {
  return (tree: HastNode) => {
    tree.children = sanitizeChildren(tree.children);
  };
}
