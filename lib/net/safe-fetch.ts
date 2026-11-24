import dns from "node:dns";
import type { LookupAddress, LookupOptions } from "node:dns";
import https from "node:https";
import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";

import { isBlockedIp } from "./ip-ranges";

/**
 * A GET to an address a user chose (an instructor's captions file), made by the server. What it guarantees:
 *  - HTTPS on port 443 only, no credentials in the address, no IP literal, no single-label or internal-looking name;
 *  - the name is resolved HERE and every address it resolves to must be public; the connection is made to the address
 *    that was checked (the check happens inside the socket's own `lookup`, so a DNS answer that changes between the
 *    check and the connection cannot redirect it: no rebinding);
 *  - no redirect is followed;
 *  - a hard deadline, and the body is read as a stream that stops at `maxBytes`.
 * Callers should answer every failure the same way: the kind of failure tells an attacker what is reachable.
 */

export type SafeFetchFailure =
  | "BAD_URL"
  | "BLOCKED_ADDRESS"
  | "REDIRECT"
  | "UPSTREAM_STATUS"
  | "BAD_CONTENT_TYPE"
  | "TOO_LARGE"
  | "TIMEOUT"
  | "NETWORK";

export class SafeFetchError extends Error {
  constructor(
    readonly code: SafeFetchFailure,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "SafeFetchError";
  }
}

const INTERNAL_SUFFIX = /(^|\.)(localhost|local|internal|intranet|lan|home|corp|private|test|invalid|example|onion)$/;

/** A URL object when `address` may be fetched, else a SafeFetchError("BAD_URL"). Cheap and synchronous: no DNS. */
export function validateOutboundUrl(address: string): URL {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    throw new SafeFetchError("BAD_URL");
  }
  if (url.protocol !== "https:") throw new SafeFetchError("BAD_URL", "https only");
  if (url.username || url.password) throw new SafeFetchError("BAD_URL", "no credentials");
  if (url.port !== "" && url.port !== "443") throw new SafeFetchError("BAD_URL", "port 443 only");

  // The URL parser already turned 2130706433, 0x7f.1, 0177.0.0.1 ... into dotted form; a trailing dot is a different spelling of the same name
  const host = url.hostname.toLowerCase().replace(/\.+$/, "");
  if (!host || host.startsWith("[") || isIP(host) !== 0) throw new SafeFetchError("BAD_URL", "no IP literal");
  if (!host.includes(".")) throw new SafeFetchError("BAD_URL", "single-label name");
  if (INTERNAL_SUFFIX.test(host)) throw new SafeFetchError("BAD_URL", "internal name");
  if (host.length > 253) throw new SafeFetchError("BAD_URL");
  url.hostname = host;
  return url;
}

type DnsLookup = (
  hostname: string,
  options: LookupOptions,
  callback: (error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void,
) => void;

/**
 * A `lookup` for a socket: resolves every address of the name, refuses the connection if ANY of them is not public
 * (a name that mixes public and private answers is an attack, not a mistake), and hands the checked address back.
 */
export function makeSafeLookup(resolve: DnsLookup = dns.lookup as unknown as DnsLookup) {
  return (
    hostname: string,
    options: LookupOptions | number | undefined,
    callback: (error: NodeJS.ErrnoException | null, address?: string | LookupAddress[], family?: number) => void,
  ) => {
    const wantsAll = typeof options === "object" && options !== null && options.all === true;
    resolve(hostname, { all: true, verbatim: true }, (error, addresses) => {
      if (error) return callback(error);
      if (!addresses || addresses.length === 0) return callback(new SafeFetchError("NETWORK", "no address") as NodeJS.ErrnoException);
      if (addresses.some((entry) => isBlockedIp(entry.address))) {
        return callback(new SafeFetchError("BLOCKED_ADDRESS") as NodeJS.ErrnoException);
      }
      if (wantsAll) return callback(null, addresses);
      callback(null, addresses[0].address, addresses[0].family);
    });
  };
}

export interface SafeFetchOptions {
  /** Largest body accepted, in bytes. */
  maxBytes: number;
  /** Total time allowed, connection and body. Default 10 s. */
  timeoutMs?: number;
  /** Accepted `Content-Type` values (without parameters); anything else is refused. Absent: any. */
  contentTypes?: readonly string[];
  /** For tests: replaces the DNS resolver and the HTTPS client. */
  deps?: {
    resolve?: DnsLookup;
    request?: typeof https.request;
  };
}

/** The body of a public HTTPS address as text. Throws SafeFetchError. */
export async function safeFetchText(address: string, options: SafeFetchOptions): Promise<string> {
  const url = validateOutboundUrl(address);
  const { maxBytes, timeoutMs = 10_000, contentTypes, deps } = options;
  const request = deps?.request ?? https.request;

  return new Promise<string>((resolvePromise, reject) => {
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      action();
    };

    const req = request(
      {
        protocol: "https:",
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { "user-agent": "fygs-captions-fetch/1", accept: "text/vtt, text/plain;q=0.9", "accept-encoding": "identity" },
        lookup: makeSafeLookup(deps?.resolve) as never,
      },
      (response: IncomingMessage) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          response.destroy();
          return finish(() => reject(new SafeFetchError("REDIRECT")));
        }
        if (status !== 200) {
          response.destroy();
          return finish(() => reject(new SafeFetchError("UPSTREAM_STATUS", String(status))));
        }
        if (contentTypes) {
          const type = String(response.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
          if (!contentTypes.includes(type)) {
            response.destroy();
            return finish(() => reject(new SafeFetchError("BAD_CONTENT_TYPE", type)));
          }
        }
        const declared = Number(response.headers["content-length"]);
        if (Number.isFinite(declared) && declared > maxBytes) {
          response.destroy();
          return finish(() => reject(new SafeFetchError("TOO_LARGE")));
        }

        const chunks: Buffer[] = [];
        let received = 0;
        response.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (received > maxBytes) {
            response.destroy();
            finish(() => reject(new SafeFetchError("TOO_LARGE")));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => finish(() => resolvePromise(Buffer.concat(chunks).toString("utf8"))));
        response.on("error", () => finish(() => reject(new SafeFetchError("NETWORK"))));
      },
    );

    const deadline = setTimeout(() => {
      req.destroy();
      finish(() => reject(new SafeFetchError("TIMEOUT")));
    }, timeoutMs);

    req.on("error", (error: NodeJS.ErrnoException) => {
      finish(() => reject(error instanceof SafeFetchError ? error : new SafeFetchError("NETWORK", error.message)));
    });
    req.end();
  });
}
