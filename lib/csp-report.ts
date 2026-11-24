/**
 * Normalisation of Content-Security-Policy violation reports.
 *
 * Browsers send either the legacy `report-uri` shape
 *   { "csp-report": { "violated-directive": ..., "blocked-uri": ... } }
 * (Content-Type application/csp-report) or the Reporting API shape
 *   [{ "type": "csp-violation", "body": { "effectiveDirective": ..., "blockedURL": ... } }]
 * (application/reports+json). Both become a CspViolation that holds NO personal
 * data: no query strings, no script sample, no referrer, no user agent, no IP.
 */

export interface CspViolation {
  /** e.g. "script-src-elem" */
  directive: string;
  /** "inline" | "eval" | "data" | "blob" | "self" | an origin such as "https://cdn.example.com" */
  blocked: string;
  /** Path of the document (first 3 segments, no query) */
  page: string;
  /** Origin + path of the script that triggered it, when it was a file */
  scriptUrl?: string;
  line?: number;
  disposition: "report" | "enforce";
}

const MAX_FIELD = 200;

const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v.slice(0, 2_000) : undefined);
const int = (v: unknown): number | undefined => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : undefined);

function parseUrl(raw: string | undefined): URL | null {
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/** Reduce what was blocked to a category or an origin. Never a full URL. */
export function classifyBlocked(raw: string | undefined): string {
  if (!raw) return "unknown";
  if (raw === "inline" || raw === "eval" || raw === "self" || raw === "wasm-eval" || raw === "trusted-types-policy") return raw;
  if (raw.startsWith("data:")) return "data";
  if (raw.startsWith("blob:")) return "blob";
  if (raw.startsWith("about:")) return "about";
  const url = parseUrl(raw);
  if (url && ["http:", "https:", "ws:", "wss:"].includes(url.protocol)) return url.origin.slice(0, MAX_FIELD);
  return "other";
}

export function pagePath(raw: string | undefined): string {
  const url = parseUrl(raw);
  if (!url) return "unknown";
  return url.pathname.split("/").slice(0, 4).join("/").slice(0, MAX_FIELD) || "/";
}

function sourceOf(raw: string | undefined): string | undefined {
  const url = parseUrl(raw);
  if (!url || !/^https?:$/.test(url.protocol)) return undefined;
  return `${url.origin}${url.pathname}`.slice(0, MAX_FIELD);
}

function fromLegacy(report: Record<string, unknown>): CspViolation | null {
  const directive = str(report["effective-directive"]) ?? str(report["violated-directive"]);
  if (!directive) return null;
  return {
    directive: directive.split(" ")[0].slice(0, 64),
    blocked: classifyBlocked(str(report["blocked-uri"])),
    page: pagePath(str(report["document-uri"])),
    scriptUrl: sourceOf(str(report["source-file"])),
    line: int(report["line-number"]),
    disposition: report["disposition"] === "enforce" ? "enforce" : "report",
  };
}

function fromReportingApi(body: Record<string, unknown>): CspViolation | null {
  const directive = str(body.effectiveDirective) ?? str(body.violatedDirective);
  if (!directive) return null;
  return {
    directive: directive.split(" ")[0].slice(0, 64),
    blocked: classifyBlocked(str(body.blockedURL)),
    page: pagePath(str(body.documentURL)),
    scriptUrl: sourceOf(str(body.sourceFile)),
    line: int(body.lineNumber),
    disposition: body.disposition === "enforce" ? "enforce" : "report",
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Extract violations from any supported payload; ignores anything else. At most 10 per request. */
export function parseCspReports(payload: unknown): CspViolation[] {
  const out: CspViolation[] = [];
  const push = (v: CspViolation | null) => {
    if (v && out.length < 10) out.push(v);
  };
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (isObject(item) && item.type === "csp-violation" && isObject(item.body)) push(fromReportingApi(item.body));
    }
  } else if (isObject(payload)) {
    if (isObject(payload["csp-report"])) push(fromLegacy(payload["csp-report"]));
    else if (payload.type === "csp-violation" && isObject(payload.body)) push(fromReportingApi(payload.body));
  }
  return out;
}

/** Stable signature used to log each distinct violation once per interval. */
export const violationKey = (v: CspViolation) =>
  `${v.disposition}|${v.directive}|${v.blocked}|${v.page}|${v.scriptUrl ?? ""}|${v.line ?? ""}`;

/**
 * Remembers which signatures were logged recently, so a page that violates the
 * policy on every view does not write a line per view. Bounded in size.
 */
export class ViolationThrottle {
  private seen = new Map<string, { lastLogMs: number; suppressed: number }>();
  constructor(
    private readonly intervalMs = 10 * 60_000,
    private readonly maxEntries = 500,
  ) {}

  /** Returns null when the violation should stay quiet, else how many identical ones were skipped. */
  shouldLog(key: string, nowMs: number): { suppressed: number } | null {
    const entry = this.seen.get(key);
    if (entry && nowMs - entry.lastLogMs < this.intervalMs) {
      entry.suppressed += 1;
      return null;
    }
    const suppressed = entry?.suppressed ?? 0;
    if (!entry && this.seen.size >= this.maxEntries) {
      const oldest = this.seen.keys().next().value;
      if (oldest !== undefined) this.seen.delete(oldest);
    }
    this.seen.delete(key);
    this.seen.set(key, { lastLogMs: nowMs, suppressed: 0 });
    return { suppressed };
  }

  clear() {
    this.seen.clear();
  }
}
