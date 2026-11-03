import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type https from "node:https";
import { describe, expect, it } from "vitest";

import { isBlockedIp, isBlockedIPv4, isBlockedIPv6, parseIPv6 } from "@/lib/net/ip-ranges";
import { makeSafeLookup, safeFetchText, SafeFetchError, validateOutboundUrl } from "@/lib/net/safe-fetch";

describe("isBlockedIp: only public addresses are allowed", () => {
  it("refuses every private, loopback, link-local, metadata and reserved IPv4 range", () => {
    const blocked = [
      "0.0.0.0", "0.255.255.255", "10.0.0.1", "10.255.255.255", "100.64.0.1", "100.127.255.255", "127.0.0.1", "127.255.255.254",
      "169.254.169.254", "169.254.0.1", "172.16.0.1", "172.31.255.255", "192.0.0.1", "192.0.2.5", "192.168.1.1", "198.18.0.1",
      "198.19.255.255", "198.51.100.7", "203.0.113.9", "224.0.0.1", "239.255.255.255", "240.0.0.1", "255.255.255.255",
    ];
    for (const address of blocked) expect(isBlockedIPv4(address), address).toBe(true);
  });

  it("allows public IPv4 addresses next to the blocked ranges", () => {
    for (const address of ["1.1.1.1", "8.8.8.8", "93.184.216.34", "172.15.255.255", "172.32.0.1", "100.63.255.255", "100.128.0.1", "169.253.255.255", "169.255.0.1", "11.0.0.1", "223.255.255.255"]) {
      expect(isBlockedIPv4(address), address).toBe(false);
    }
  });

  it("refuses IPv6 loopback, unspecified, unique-local, link-local, multicast, documentation, Teredo and 6to4", () => {
    for (const address of ["::", "::1", "0:0:0:0:0:0:0:1", "fc00::1", "fd12:3456::1", "fe80::1", "fe80::abcd%eth0", "febf::1", "fec0::1", "ff02::1", "2001:db8::1", "2001::1", "2002:c000:204::1", "100::1"]) {
      expect(isBlockedIPv6(address), address).toBe(true);
    }
  });

  it("judges the IPv4 inside IPv4-mapped, IPv4-compatible and NAT64 addresses", () => {
    for (const address of ["::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254", "::ffff:10.0.0.1", "::127.0.0.1", "64:ff9b::7f00:1", "64:ff9b::a9fe:a9fe", "[::ffff:192.168.0.1]"]) {
      expect(isBlockedIp(address), address).toBe(true);
    }
    expect(isBlockedIp("::ffff:8.8.8.8")).toBe(false);
    expect(isBlockedIp("64:ff9b::808:808")).toBe(false);
  });

  it("allows public IPv6", () => {
    for (const address of ["2606:4700:4700::1111", "2a00:1450:4007:80f::200e", "2001:4860:4860::8888"]) {
      expect(isBlockedIp(address), address).toBe(false);
    }
  });

  it("refuses anything that is not an address, including numeric tricks", () => {
    for (const value of ["", "localhost", "example.com", "127.1", "2130706433", "0x7f.0.0.1", "017700000001", "1.2.3", "1.2.3.4.5", "999.1.1.1", "::g", "1::2::3", "not-an-ip"]) {
      expect(isBlockedIp(value), value).toBe(true);
    }
  });

  it("parses IPv6 forms", () => {
    expect(parseIPv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(parseIPv6("2001:db8::ff00:42:8329")).toEqual([0x2001, 0xdb8, 0, 0, 0, 0xff00, 0x42, 0x8329]);
    expect(parseIPv6("::ffff:1.2.3.4")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x102, 0x304]);
    expect(parseIPv6("1:2:3:4:5:6:7:8:9")).toBeNull();
    expect(parseIPv6("1::2::3")).toBeNull();
  });
});

describe("validateOutboundUrl", () => {
  it("accepts a public HTTPS name and normalises a trailing dot", () => {
    expect(validateOutboundUrl("https://cdn.example.org/a/b.vtt?x=1").hostname).toBe("cdn.example.org");
    expect(validateOutboundUrl("https://CDN.Example.org./a.vtt").hostname).toBe("cdn.example.org");
    expect(validateOutboundUrl("https://cdn.example.org:443/a.vtt").port).toBe("");
  });

  it("refuses everything that is not a public HTTPS name on port 443", () => {
    const bad = [
      "http://cdn.example.org/a.vtt",
      "ftp://cdn.example.org/a.vtt",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "https://user:pw@cdn.example.org/a.vtt",
      "https://cdn.example.org:8443/a.vtt",
      "https://cdn.example.org:80/a.vtt",
      "https://127.0.0.1/a.vtt",
      "https://2130706433/a.vtt",
      "https://0x7f.0.0.1/a.vtt",
      "https://0177.0.0.1/a.vtt",
      "https://127.1/a.vtt",
      "https://[::1]/a.vtt",
      "https://[::ffff:127.0.0.1]/a.vtt",
      "https://169.254.169.254/latest/meta-data",
      "https://localhost/a.vtt",
      "https://localhost./a.vtt",
      "https://app.localhost/a.vtt",
      "https://intranet/a.vtt",
      "https://db.internal/a.vtt",
      "https://printer.local/a.vtt",
      "https://router.lan/a.vtt",
      "https://x.corp/a.vtt",
      "https://host.test/a.vtt",
      "",
      "pas une adresse",
    ];
    for (const address of bad) expect(() => validateOutboundUrl(address), address).toThrow(SafeFetchError);
  });
});

type Answer = { address: string; family: number }[];
const resolver = (answer: Answer | Error) =>
  ((_host: string, _options: unknown, callback: (error: NodeJS.ErrnoException | null, addresses: Answer) => void) =>
    answer instanceof Error ? callback(answer as NodeJS.ErrnoException, []) : callback(null, answer)) as never;

const lookupResult = (lookup: ReturnType<typeof makeSafeLookup>, all: boolean) =>
  new Promise<{ error: unknown; address?: unknown; family?: unknown }>((resolve) =>
    lookup("cdn.example.org", all ? { all: true } : {}, (error, address, family) => resolve({ error, address, family })),
  );

describe("makeSafeLookup: the checked address is the connected address", () => {
  it("hands back a public address (single and all-addresses forms)", async () => {
    const lookup = makeSafeLookup(resolver([{ address: "93.184.216.34", family: 4 }]));
    expect(await lookupResult(lookup, false)).toEqual({ error: null, address: "93.184.216.34", family: 4 });
    expect(await lookupResult(lookup, true)).toEqual({ error: null, address: [{ address: "93.184.216.34", family: 4 }], family: undefined });
  });

  it("refuses a name that resolves to a private address", async () => {
    for (const address of ["127.0.0.1", "10.1.2.3", "169.254.169.254", "::1", "::ffff:127.0.0.1", "fd00::1"]) {
      const lookup = makeSafeLookup(resolver([{ address, family: address.includes(":") ? 6 : 4 }]));
      const { error } = await lookupResult(lookup, false);
      expect(error, address).toBeInstanceOf(SafeFetchError);
      expect((error as SafeFetchError).code).toBe("BLOCKED_ADDRESS");
    }
  });

  it("refuses a name that mixes public and private answers (rebinding by round robin)", async () => {
    const lookup = makeSafeLookup(
      resolver([
        { address: "93.184.216.34", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]),
    );
    const { error } = await lookupResult(lookup, true);
    expect((error as SafeFetchError).code).toBe("BLOCKED_ADDRESS");
  });

  it("passes DNS failures and empty answers on as failures", async () => {
    expect((await lookupResult(makeSafeLookup(resolver(new Error("ENOTFOUND"))), false)).error).toBeInstanceOf(Error);
    expect(((await lookupResult(makeSafeLookup(resolver([])), false)).error as SafeFetchError).code).toBe("NETWORK");
  });
});

/** A fake https.request: answers once with the given status, headers and body chunks; records the options it got. */
function fakeRequest(response: { status?: number; headers?: Record<string, string>; chunks?: string[]; hang?: boolean }) {
  const seen: Record<string, unknown>[] = [];
  const request = ((options: Record<string, unknown>, callback: (res: PassThrough & { statusCode?: number; headers?: Record<string, string> }) => void) => {
    seen.push(options);
    const req = new EventEmitter() as EventEmitter & { end: () => void; destroy: () => void };
    req.destroy = () => undefined;
    req.end = () => {
      if (response.hang) return;
      const res = new PassThrough() as PassThrough & { statusCode?: number; headers?: Record<string, string> };
      res.statusCode = response.status ?? 200;
      res.headers = response.headers ?? { "content-type": "text/vtt" };
      callback(res);
      for (const chunk of response.chunks ?? ["WEBVTT\n"]) res.write(chunk);
      res.end();
    };
    return req;
  }) as unknown as typeof https.request;
  return { request, seen };
}

describe("safeFetchText", () => {
  const base = { maxBytes: 1024, contentTypes: ["text/vtt"] as const };

  it("returns the body of a 200 response, connecting to port 443 with the safe lookup", async () => {
    const { request, seen } = fakeRequest({ chunks: ["WEBVTT\n\n00:00.000 --> 00:01.000\n", "Bonjour"] });
    const text = await safeFetchText("https://cdn.example.org/a.vtt?x=1", { ...base, deps: { request } });
    expect(text).toContain("Bonjour");
    expect(seen[0]).toMatchObject({ hostname: "cdn.example.org", port: 443, path: "/a.vtt?x=1", method: "GET" });
    expect(typeof seen[0].lookup).toBe("function");
  });

  it("refuses a redirect instead of following it", async () => {
    const { request } = fakeRequest({ status: 302, headers: { location: "https://127.0.0.1/" } });
    await expect(safeFetchText("https://cdn.example.org/a.vtt", { ...base, deps: { request } })).rejects.toMatchObject({ code: "REDIRECT" });
  });

  it("refuses non-200 answers and wrong content types", async () => {
    await expect(safeFetchText("https://cdn.example.org/a.vtt", { ...base, deps: { request: fakeRequest({ status: 404 }).request } })).rejects.toMatchObject({ code: "UPSTREAM_STATUS" });
    await expect(
      safeFetchText("https://cdn.example.org/a.vtt", { ...base, deps: { request: fakeRequest({ headers: { "content-type": "text/html" } }).request } }),
    ).rejects.toMatchObject({ code: "BAD_CONTENT_TYPE" });
  });

  it("stops reading at the byte cap, whether the size is announced or not", async () => {
    await expect(
      safeFetchText("https://cdn.example.org/a.vtt", { ...base, deps: { request: fakeRequest({ headers: { "content-type": "text/vtt", "content-length": "999999" } }).request } }),
    ).rejects.toMatchObject({ code: "TOO_LARGE" });
    await expect(
      safeFetchText("https://cdn.example.org/a.vtt", { ...base, deps: { request: fakeRequest({ chunks: ["x".repeat(600), "x".repeat(600)] }).request } }),
    ).rejects.toMatchObject({ code: "TOO_LARGE" });
  });

  it("gives up at the deadline", async () => {
    await expect(
      safeFetchText("https://cdn.example.org/a.vtt", { ...base, timeoutMs: 20, deps: { request: fakeRequest({ hang: true }).request } }),
    ).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("refuses a bad address before any request is made", async () => {
    const { request, seen } = fakeRequest({});
    for (const address of ["https://127.0.0.1/a.vtt", "http://cdn.example.org/a.vtt", "https://cdn.example.org:8443/a.vtt"]) {
      await expect(safeFetchText(address, { ...base, deps: { request } }), address).rejects.toMatchObject({ code: "BAD_URL" });
    }
    expect(seen).toHaveLength(0);
  });
});
