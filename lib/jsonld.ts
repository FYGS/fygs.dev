/**
 * JSON-LD is a JSON document inside a <script> element. Inside HTML, "</script>" ends the element wherever it appears,
 * so a title containing it would let its author write markup after it. Escaping `<`, `>` and `&` (and the two line
 * separators that older parsers treat as line ends in scripts) as \uXXXX keeps the JSON identical for a reader and
 * makes the text inert for an HTML parser. Use it for EVERY JSON-LD script.
 */

const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  " ": "\\u2028",
  " ": "\\u2029",
};

const UNSAFE = new RegExp("[<>&\\u2028\\u2029]", "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, (character) => ESCAPES[character]);
}
