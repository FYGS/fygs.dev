/**
 * Second line of defence on the SVG that Mermaid produces (the first is `securityLevel: "strict"`, which makes Mermaid
 * encode HTML in labels and disable click handlers). The SVG is inserted into the page as markup, so whatever a
 * diagram source can still smuggle into it is removed here: scripts, event-handler attributes, executable or remote
 * addresses, external stylesheets and plugins. Labels keep their (HTML-in-`foreignObject`) text formatting.
 *
 * Runs in the browser (DOMParser). If the markup cannot be parsed, nothing is shown.
 */

/** Elements that run or load something: dropped with their content. */
const DROPPED = new Set([
  "script", "iframe", "frame", "object", "embed", "applet", "link", "meta", "base", "form", "input", "button", "textarea",
  "select", "audio", "video", "source", "track", "image", "animate", "set", "animatemotion", "animatetransform", "use",
  "feimage", "template", "noscript", "portal",
]);

/** HTML tags kept inside `foreignObject` labels. Anything else is unwrapped (its text stays). */
const LABEL_HTML = new Set(["div", "span", "p", "br", "b", "strong", "i", "em", "u", "code", "pre", "small", "sub", "sup", "ul", "ol", "li"]);

/** Attributes that never survive. */
const FORBIDDEN_ATTRIBUTE = /^on/i;

function isSafeReference(value: string): boolean {
  const compact = value.replace(/[\u0000- \u007F-\u009F]+/g, "").toLowerCase();
  return compact === "" || compact.startsWith("#");
}

/** A stylesheet without `@import` and without a `url()` that leaves the document (`url(#marker)` is fine). */
export function cleanSvgCss(css: string): string {
  return css
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\(/gi, "(")
    .replace(/url\(\s*(['"]?)(?!#)[^)]*\)/gi, "none")
    .replace(/behavior\s*:[^;}]*/gi, "");
}

function cleanElement(element: Element): void {
  const name = element.localName.toLowerCase();

  for (const attribute of Array.from(element.attributes)) {
    const attributeName = attribute.name.toLowerCase();
    if (FORBIDDEN_ATTRIBUTE.test(attributeName)) {
      element.removeAttribute(attribute.name);
    } else if (attributeName === "href" || attributeName === "xlink:href" || attributeName === "src" || attributeName === "srcset") {
      // In a diagram a reference points inside the document; a link to the outside would be a hole
      if (!isSafeReference(attribute.value)) element.removeAttribute(attribute.name);
    } else if (attributeName === "style") {
      element.setAttribute(attribute.name, cleanSvgCss(attribute.value));
    }
  }

  if (name === "style") element.textContent = cleanSvgCss(element.textContent ?? "");

  for (const child of Array.from(element.children)) {
    const childName = child.localName.toLowerCase();
    const inHtml = child.namespaceURI === "http://www.w3.org/1999/xhtml";
    if (DROPPED.has(childName)) {
      child.remove();
    } else if (inHtml && !LABEL_HTML.has(childName)) {
      // Unknown HTML in a label: keep the text, lose the element
      child.replaceWith(...Array.from(child.childNodes));
      cleanElement(element);
      return;
    } else {
      cleanElement(child);
    }
  }
}

/** One pass: parse the way the browser will when the markup is inserted, remove what is active, serialise. */
function cleanOnce(markup: string): string {
  const document = new DOMParser().parseFromString(`<!doctype html><body>${markup}`, "text/html");
  const root = document.body.querySelector("svg");
  if (!root) return "";
  cleanElement(root);
  return root.outerHTML;
}

/**
 * The SVG with everything active removed, or "" when it is not a diagram or cannot be made safe. The result is cleaned
 * a second time and must come out unchanged: markup that a second parse would turn into something new (the trick behind
 * mutation XSS) is refused instead of shown.
 */
export function cleanMermaidSvg(svg: string): string {
  if (typeof DOMParser === "undefined" || !svg.trim()) return "";
  const once = cleanOnce(svg);
  if (!once) return "";
  return cleanOnce(once) === once ? once : "";
}
