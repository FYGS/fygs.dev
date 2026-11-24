import { isIP } from "node:net";

/**
 * Which IP addresses a server may connect to on behalf of a user-supplied address: public ones only. Everything that
 * reaches the platform's own network, a metadata service, or a neighbour on the same host is refused.
 * No dependency: the ranges are short and every one is covered by a test.
 */

type Cidr4 = readonly [string, number];

/** IPv4 ranges that are not the public Internet (RFC 6890 and relatives). */
const BLOCKED_V4: readonly Cidr4[] = [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata (169.254.169.254)
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay (deprecated)
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, broadcast
];

function v4ToInt(address: string): number | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = value * 256 + n;
  }
  return value;
}

function inCidr4(value: number, [base, bits]: Cidr4): boolean {
  const baseValue = v4ToInt(base) as number;
  const size = 2 ** (32 - bits);
  return value >= baseValue && value < baseValue + size;
}

export function isBlockedIPv4(address: string): boolean {
  const value = v4ToInt(address);
  if (value === null) return true; // not an address we understand: refuse
  return BLOCKED_V4.some((range) => inCidr4(value, range));
}

/** Expands an IPv6 address into eight 16-bit groups, or null when it is malformed. Accepts a trailing dotted IPv4. */
export function parseIPv6(address: string): number[] | null {
  let text = address.toLowerCase();
  const zone = text.indexOf("%");
  if (zone !== -1) text = text.slice(0, zone);
  if (text.startsWith("[") && text.endsWith("]")) text = text.slice(1, -1);

  // A dotted IPv4 tail (::ffff:1.2.3.4) counts for two groups
  const lastColon = text.lastIndexOf(":");
  if (lastColon !== -1 && text.slice(lastColon + 1).includes(".")) {
    const v4 = v4ToInt(text.slice(lastColon + 1));
    if (v4 === null) return null;
    text = `${text.slice(0, lastColon + 1)}${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }

  const halves = text.split("::");
  if (halves.length > 2) return null;
  const parse = (chunk: string): number[] | null => {
    if (chunk === "") return [];
    const groups = chunk.split(":");
    const out: number[] = [];
    for (const group of groups) {
      if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
      out.push(parseInt(group, 16));
    }
    return out;
  };
  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  if (!head || !tail) return null;
  if (halves.length === 1) return head.length === 8 ? head : null;
  const missing = 8 - head.length - tail.length;
  if (missing < 1) return null;
  return [...head, ...new Array<number>(missing).fill(0), ...tail];
}

const groupsToV4 = (high: number, low: number) => `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;

export function isBlockedIPv6(address: string): boolean {
  const groups = parseIPv6(address);
  if (!groups) return true;
  const [g0, g1, g2, g3, g4, g5, g6, g7] = groups;

  const allZeroUpTo = (count: number) => groups.slice(0, count).every((g) => g === 0);
  if (allZeroUpTo(8)) return true; // :: unspecified
  if (allZeroUpTo(7) && g7 === 1) return true; // ::1 loopback

  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible (::a.b.c.d): judge the embedded IPv4
  if (allZeroUpTo(5) && (g5 === 0xffff || g5 === 0)) return isBlockedIPv4(groupsToV4(g6, g7));
  // NAT64 (64:ff9b::/96): judge the embedded IPv4
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) return isBlockedIPv4(groupsToV4(g6, g7));

  if ((g0 & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((g0 & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((g0 & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((g0 & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (g0 === 0x100 && g1 === 0 && g2 === 0 && g3 === 0) return true; // 100::/64 discard
  if (g0 === 0x2001 && g1 === 0) return true; // 2001::/32 Teredo
  if (g0 === 0x2001 && g1 === 0xdb8) return true; // 2001:db8::/32 documentation
  if (g0 === 0x2002) return true; // 2002::/16 6to4 (embeds an IPv4 we cannot trust)
  return false;
}

/** True when the server must not connect to this address. Anything that is not an IP address is refused. */
export function isBlockedIp(address: string): boolean {
  const version = isIP(address.startsWith("[") ? address.slice(1, -1) : address);
  if (version === 4) return isBlockedIPv4(address);
  if (version === 6) return isBlockedIPv6(address);
  return true;
}
