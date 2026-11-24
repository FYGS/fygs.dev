/**
 * Which client networks were recently rate-limited, kept in this process. The proof-of-work asks more work from a
 * network that just hit a limit (see pow.ts). Dependency-free on purpose: lib/rate-limit.ts reports into it.
 *
 * Bucket = the /24 of an IPv4 address or the /64 of an IPv6 one, a stand-in for "same ISP, same office, same botnet
 * neighbourhood" (no ASN database is shipped). A per-instance view is enough here: it only tunes a difficulty.
 */

const HOT_WINDOW_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 5_000;
const hot = new Map<string, { hits: number; lastMs: number }>();

/** `192.0.2.7` -> `192.0.2`, `2001:db8:1:2:3:4:5:6` -> `2001:db8:1:2`, anything else -> `unknown`. */
export function ipBucketOf(ip: string): string {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip.split(".").slice(0, 3).join(".");
  if (!ip.includes(":") || !/^[0-9a-fA-F:.]+$/.test(ip)) return "unknown";
  // Expand "::" so that the first four groups are the /64 whatever the shorthand
  const [head, tail] = ip.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = ip.includes("::") && tail ? tail.split(":") : [];
  const missing = ip.includes("::") ? Math.max(0, 8 - headParts.length - tailParts.length) : 0;
  const groups = [...headParts, ...Array<string>(missing).fill("0"), ...tailParts];
  if (groups.length < 4) return "unknown";
  return groups
    .slice(0, 4)
    .map((group) => group.toLowerCase().replace(/^0+(?=.)/, ""))
    .join(":");
}

/** A request from this network was refused by a rate limit. */
export function markHot(bucket: string, nowMs = Date.now()): void {
  if (bucket === "unknown") return;
  const entry = hot.get(bucket);
  if (entry && nowMs - entry.lastMs < HOT_WINDOW_MS) {
    entry.hits += 1;
    entry.lastMs = nowMs;
    return;
  }
  hot.set(bucket, { hits: 1, lastMs: nowMs });
  if (hot.size > MAX_BUCKETS) {
    for (const [key, value] of hot) {
      if (nowMs - value.lastMs >= HOT_WINDOW_MS) hot.delete(key);
    }
    for (const key of hot.keys()) {
      if (hot.size <= MAX_BUCKETS / 2) break;
      hot.delete(key);
    }
  }
}

/** 0 (calm) to 3 (hammering): how much extra work to ask from this network. */
export function heat(bucket: string, nowMs = Date.now()): 0 | 1 | 2 | 3 {
  const entry = hot.get(bucket);
  if (!entry || nowMs - entry.lastMs >= HOT_WINDOW_MS) return 0;
  if (entry.hits >= 20) return 3;
  if (entry.hits >= 5) return 2;
  return 1;
}

/** Test helper. */
export function __resetHotBuckets(): void {
  hot.clear();
}
