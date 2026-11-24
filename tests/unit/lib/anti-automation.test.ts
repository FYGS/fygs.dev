import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
  default: { setNxEx: () => Promise.reject(new Error("redis unavailable")), eval: () => Promise.reject(new Error("redis unavailable")) },
}));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { info: noop, warn: noop, error: noop, debug: noop };
  return { createLogger: () => logger, logger };
});

import { humanProofMode, verifyHumanProof, humanProofRefusal } from "@/lib/anti-automation";
import { __resetHotBuckets, markHot } from "@/lib/anti-automation/hot-buckets";
import {
  __resetProofReplayStore,
  BASE_DIFFICULTY,
  difficultyFor,
  issueChallenge,
  leadingZeroBits,
  MIN_AGE_MS,
  proofHash,
  verifyProof,
} from "@/lib/anti-automation/pow";
import { SOLVER_SOURCE, WORKER_SOURCE } from "@/lib/anti-automation/solver-source";
import { HONEYPOT_FIELD, honeypotFields, isHoneypotTripped } from "@/lib/anti-automation/honeypot";
import { DISPOSABLE_EMAIL_DOMAINS, emailDomain, hasMailExchanger, isDisposableEmail } from "@/lib/anti-automation/disposable-domains";
import { newAccountPenalty, penalizedLimit } from "@/lib/anti-automation/velocity";
import { HUMAN_PROOF_ACTIONS, HUMAN_PROOF_HEADER } from "@/lib/anti-automation/types";

const SECRET = "Xk9#vQ2mZp7LwR4tYb8NcD1sFh6JgA3e-pow";
const IP = "203.0.113.9";
const NOW = 1_800_000_000_000;

/** What the browser's worker does, with the very source text that ships to browsers. */
const { solve, sha256 } = new Function(`${SOLVER_SOURCE}; return { solve: solve, sha256: sha256 };`)() as {
  solve: (token: string, difficulty: number, start: number, limit: number) => number;
  sha256: (msg: Uint8Array, len: number, out: Uint32Array) => void;
};

function solveFor(token: string, difficulty: number): string {
  const counter = solve(token, difficulty, 0, 5_000_000);
  expect(counter).not.toBe(-1);
  return String(counter);
}

beforeEach(() => {
  vi.stubEnv("BETTER_AUTH_SECRET", SECRET);
  __resetProofReplayStore();
  __resetHotBuckets();
});

afterEach(() => vi.unstubAllEnvs());

describe("the browser solver", () => {
  it("computes SHA-256 exactly like node:crypto, at every padding boundary", () => {
    for (const length of [0, 1, 3, 55, 56, 57, 63, 64, 65, 100, 119, 120, 127, 128, 183]) {
      const text = Array.from({ length }, (_, i) => String.fromCharCode(97 + (i % 26))).join("");
      const message = new Uint8Array(length + 80);
      for (let i = 0; i < length; i++) message[i] = text.charCodeAt(i);
      const out = new Uint32Array(8);
      sha256(message, length, out);
      const expected = createHash("sha256").update(text).digest();
      const got = Buffer.alloc(32);
      out.forEach((word, i) => got.writeUInt32BE(word, i * 4));
      expect(got.toString("hex"), `length ${length}`).toBe(expected.toString("hex"));
    }
  });

  it("finds counters the server accepts, with the number of zero bits asked for", () => {
    const { token } = issueChallenge("sign-in", IP, NOW);
    for (const difficulty of [8, 12, 14]) {
      const counter = solveFor(token, difficulty);
      expect(leadingZeroBits(proofHash(token, counter))).toBeGreaterThanOrEqual(difficulty);
    }
  });

  it("ships a worker that posts its answer, and contains no network or storage access", () => {
    expect(WORKER_SOURCE).toContain("self.postMessage");
    for (const forbidden of ["fetch(", "XMLHttpRequest", "importScripts", "localStorage", "document.", "eval("]) {
      expect(WORKER_SOURCE, forbidden).not.toContain(forbidden);
    }
  });
});

describe("leadingZeroBits", () => {
  it("counts across bytes", () => {
    expect(leadingZeroBits(Uint8Array.from([0xff]))).toBe(0);
    expect(leadingZeroBits(Uint8Array.from([0x0f]))).toBe(4);
    expect(leadingZeroBits(Uint8Array.from([0x00, 0x01]))).toBe(15);
    expect(leadingZeroBits(Uint8Array.from([0x00, 0x00, 0x80]))).toBe(16);
  });
});

describe("proof-of-work challenges", () => {
  const readyAt = (action: keyof typeof MIN_AGE_MS) => NOW + MIN_AGE_MS[action] + 50;

  it("accept an honest proof once", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyProof(proof, "sign-in", IP, readyAt("sign-in"))).toEqual({ ok: true });
  });

  it("refuse a replay of a proof that was accepted", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    await verifyProof(proof, "sign-in", IP, readyAt("sign-in"));
    expect(await verifyProof(proof, "sign-in", IP, readyAt("sign-in") + 1)).toEqual({ ok: false, reason: "replayed" });
  });

  it("refuse a proof for another action", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyProof(proof, "contact", IP, readyAt("contact"))).toEqual({ ok: false, reason: "wrong_action" });
  });

  it("refuse a proof presented from another network, and accept the same /24", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyProof(proof, "sign-in", "198.51.100.7", readyAt("sign-in"))).toEqual({ ok: false, reason: "wrong_network" });
    expect(await verifyProof(proof, "sign-in", "203.0.113.200", readyAt("sign-in"))).toEqual({ ok: true });
  });

  it("refuse an expired proof", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyProof(proof, "sign-in", IP, NOW + challenge.ttlMs + 1)).toEqual({ ok: false, reason: "expired" });
  });

  it("refuse a proof that came back too fast (a script, not a person reading a form)", async () => {
    const challenge = issueChallenge("sign-up", IP, NOW);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyProof(proof, "sign-up", IP, NOW + 200)).toEqual({ ok: false, reason: "too_fast" });
    // the same proof is still good once the minimum age has passed (a refusal for speed does not burn it)
    expect(await verifyProof(proof, "sign-up", IP, readyAt("sign-up"))).toEqual({ ok: true });
  });

  it("refuse a proof whose work is short of the difficulty", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    let counter = 0;
    while (leadingZeroBits(proofHash(challenge.token, String(counter))) >= challenge.difficulty) counter++;
    const proof = `${challenge.token}~${counter}`;
    expect(await verifyProof(proof, "sign-in", IP, readyAt("sign-in"))).toEqual({ ok: false, reason: "insufficient_work" });
  });

  it("refuse a token altered in any field, or signed with another key", async () => {
    const challenge = issueChallenge("sign-in", IP, NOW);
    const parts = challenge.token.split(".");
    const counter = solveFor(challenge.token, challenge.difficulty);
    const tampered = [
      [...parts.slice(0, 5), "1", ...parts.slice(6)].join("."), // difficulty lowered to 1
      [...parts.slice(0, 4), String(NOW + 10_000_000), ...parts.slice(5)].join("."), // expiry extended
      [...parts.slice(0, 3), String(NOW - 5_000_000), ...parts.slice(4)].join("."), // issue date moved back
      [...parts.slice(0, 7), `${parts[7].slice(0, -2)}AA`].join("."), // signature edited
    ];
    for (const token of tampered) {
      const verdict = await verifyProof(`${token}~${counter}`, "sign-in", IP, readyAt("sign-in"));
      expect(verdict.ok, token).toBe(false);
    }
    vi.stubEnv("BETTER_AUTH_SECRET", "Another-Long-Random-Secret-0123456789abcdef");
    expect((await verifyProof(`${challenge.token}~${counter}`, "sign-in", IP, readyAt("sign-in"))).ok).toBe(false);
  });

  it("refuse malformed or oversized input without throwing", async () => {
    for (const proof of ["", "x", "a~b", `p1.${"a".repeat(500)}~1`, "p1.sign-in.x.1.2.3.n.s~notanumber", "<script>"]) {
      expect(await verifyProof(proof, "sign-in", IP, NOW)).toEqual({ ok: false, reason: "malformed" });
    }
  });
});

describe("adaptive difficulty", () => {
  it("asks 2 more bits (4x the work) for each notch of heat on the client's network, up to a ceiling", () => {
    const base = BASE_DIFFICULTY["sign-up"];
    expect(difficultyFor("sign-up", IP, NOW)).toBe(base);
    markHot("203.0.113", NOW);
    expect(difficultyFor("sign-up", IP, NOW)).toBe(base + 2);
    for (let i = 0; i < 5; i++) markHot("203.0.113", NOW);
    expect(difficultyFor("sign-up", IP, NOW)).toBe(base + 4);
    for (let i = 0; i < 20; i++) markHot("203.0.113", NOW);
    expect(difficultyFor("sign-up", IP, NOW)).toBe(Math.min(26, base + 6));
    // another network is not affected, and the heat fades after ten minutes
    expect(difficultyFor("sign-up", "198.51.100.1", NOW)).toBe(base);
    expect(difficultyFor("sign-up", IP, NOW + 11 * 60_000)).toBe(base);
  });

  it("covers every action of the contract", () => {
    for (const action of HUMAN_PROOF_ACTIONS) {
      expect(BASE_DIFFICULTY[action]).toBeGreaterThanOrEqual(12);
      expect(MIN_AGE_MS[action]).toBeGreaterThanOrEqual(1000);
    }
  });
});

describe("verifyHumanProof (the entry point routes call)", () => {
  const request = (proof?: string, ip = IP) =>
    new Request("http://localhost/api/x", { method: "POST", headers: { "x-forwarded-for": ip, ...(proof ? { [HUMAN_PROOF_HEADER]: proof } : {}) } });

  it("is off outside production, enforcing in production, and follows HUMAN_PROOF_MODE", () => {
    expect(humanProofMode({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe("off");
    expect(humanProofMode({ NODE_ENV: "test" } as NodeJS.ProcessEnv)).toBe("off");
    expect(humanProofMode({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe("enforce");
    expect(humanProofMode({ NODE_ENV: "production", HUMAN_PROOF_MODE: "report" } as NodeJS.ProcessEnv)).toBe("report");
    expect(humanProofMode({ NODE_ENV: "production", HUMAN_PROOF_MODE: "OFF" } as NodeJS.ProcessEnv)).toBe("off");
    expect(humanProofMode({ NODE_ENV: "production", HUMAN_PROOF_MODE: "nonsense" } as NodeJS.ProcessEnv)).toBe("enforce");
  });

  it("asks nothing when off", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "off");
    expect(await verifyHumanProof(request(), "sign-up")).toEqual({ ok: true });
  });

  it("enforces: a missing proof is a 403, a replay too, a valid one passes once", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    expect(await verifyHumanProof(request(), "sign-in")).toEqual({ ok: false, status: 403, error: "human_proof_missing" });

    const challenge = issueChallenge("sign-in", IP, Date.now() - 5_000);
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyHumanProof(request(proof), "sign-in")).toEqual({ ok: true });
    expect(await verifyHumanProof(request(proof), "sign-in")).toEqual({ ok: false, status: 403, error: "human_proof_replayed" });
  });

  it("answers a too-fast proof with 429, and a garbage one with 400", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    const challenge = issueChallenge("sign-up", IP, Date.now());
    const proof = `${challenge.token}~${solveFor(challenge.token, challenge.difficulty)}`;
    expect(await verifyHumanProof(request(proof), "sign-up")).toMatchObject({ ok: false, status: 429, error: "human_proof_too_fast" });
    expect(await verifyHumanProof(request("garbage"), "sign-up")).toMatchObject({ ok: false, status: 400 });
  });

  it("report mode lets the request through", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "report");
    expect(await verifyHumanProof(request(), "contact")).toEqual({ ok: true });
  });

  it("builds a JSON refusal that is never cached", async () => {
    const response = humanProofRefusal({ ok: false, status: 429, error: "human_proof_too_fast" });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("2");
    expect(await response.json()).toEqual({ error: "human_proof_too_fast" });
  });
});

describe("honeypot", () => {
  it("is tripped by a filled invisible field, in JSON and in a form, and by nothing else", () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "http://spam.example" })).toBe(true);
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: 1 })).toBe(true);
    const form = new FormData();
    form.set("name", "Ana");
    expect(isHoneypotTripped(form)).toBe(false);
    form.set(HONEYPOT_FIELD, "x");
    expect(isHoneypotTripped(form)).toBe(true);
    for (const clean of [{}, { name: "Ana" }, { [HONEYPOT_FIELD]: "" }, { [HONEYPOT_FIELD]: "   " }, null, undefined]) {
      expect(isHoneypotTripped(clean as Record<string, unknown> | null | undefined)).toBe(false);
    }
  });

  it("renders one hidden, unfocusable input that autofill leaves alone", () => {
    const element = honeypotFields() as { props: { "aria-hidden": boolean; children: { props: Record<string, unknown> }[] } };
    expect(element.props["aria-hidden"]).toBe(true);
    const input = element.props.children[1].props;
    expect(input).toMatchObject({ name: HONEYPOT_FIELD, tabIndex: -1, autoComplete: "off" });
    expect(HONEYPOT_FIELD).not.toMatch(/mail|url|site|phone|company|name/i);
  });
});

describe("disposable addresses", () => {
  it("ships at least 300 distinct, well-formed, lowercase domains, none of which is a mainstream provider", () => {
    expect(DISPOSABLE_EMAIL_DOMAINS.size).toBeGreaterThanOrEqual(300);
    for (const domain of DISPOSABLE_EMAIL_DOMAINS) {
      expect(domain, domain).toMatch(/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z0-9-]{2,}$/);
    }
    for (const real of ["gmail.com", "outlook.com", "hotmail.com", "hotmail.fr", "yahoo.com", "yahoo.fr", "icloud.com", "protonmail.com", "proton.me", "orange.fr", "free.fr", "laposte.net", "sfr.fr", "wanadoo.fr", "live.com", "gmx.com", "fastmail.com", "zoho.com", "aol.com", "me.com"]) {
      expect(DISPOSABLE_EMAIL_DOMAINS.has(real), real).toBe(false);
    }
  });

  it("recognises listed providers, their subdomains and any letter case", () => {
    expect(isDisposableEmail("x@mailinator.com")).toBe(true);
    expect(isDisposableEmail("X@MAILINATOR.COM")).toBe(true);
    expect(isDisposableEmail("x@sub.yopmail.com")).toBe(true);
    expect(isDisposableEmail("x@guerrillamail.com")).toBe(true);
  });

  it("lets real addresses through, including a domain that merely contains a listed name", () => {
    for (const email of ["a@gmail.com", "a@fygs.dev", "a@mailinator.com.example.org", "a@notyopmail.com", "no-at-sign", "a@", "@x.com"]) {
      expect(isDisposableEmail(email), email).toBe(false);
    }
  });

  it("extends and exempts through the environment", () => {
    vi.stubEnv("DISPOSABLE_EMAIL_EXTRA_DOMAINS", "newtrash.example, other.example");
    expect(isDisposableEmail("a@newtrash.example")).toBe(true);
    vi.stubEnv("EMAIL_DOMAIN_ALLOWLIST", "mailinator.com");
    expect(isDisposableEmail("a@mailinator.com")).toBe(false);
  });

  it("reads the domain of an address", () => {
    expect(emailDomain("a@B.Example.")).toBe("b.example");
    expect(emailDomain("nope")).toBeNull();
    expect(emailDomain("a@localhost")).toBeNull();
  });

  it("never blocks on a DNS problem: only a definite 'no mail server' answer is a refusal", async () => {
    // An unresolvable reserved name (RFC 6761 .invalid) may answer ENOTFOUND (false) or time out (true): both are allowed,
    // what must never happen is an exception or a hang
    const result = await Promise.race([hasMailExchanger("does-not-exist.invalid"), new Promise<string>((r) => setTimeout(() => r("hang"), 5000))]);
    expect(typeof result).toBe("boolean");
  }, 10_000);
});

describe("new-account velocity", () => {
  const ago = (ms: number) => new Date(NOW - ms);
  const HOUR = 3_600_000;

  it("tightens limits for the first week, more for the first hour, more again when the address is unverified", () => {
    expect(newAccountPenalty({ createdAt: ago(10 * 60_000), emailVerified: true }, NOW)).toBe(0.25);
    expect(newAccountPenalty({ createdAt: ago(5 * HOUR), emailVerified: true }, NOW)).toBe(0.5);
    expect(newAccountPenalty({ createdAt: ago(3 * 24 * HOUR), emailVerified: true }, NOW)).toBe(0.75);
    expect(newAccountPenalty({ createdAt: ago(30 * 24 * HOUR), emailVerified: true }, NOW)).toBe(1);
    expect(newAccountPenalty({ createdAt: ago(5 * HOUR), emailVerified: false }, NOW)).toBe(0.25);
    expect(newAccountPenalty({ createdAt: ago(30 * 24 * HOUR), emailVerified: false }, NOW)).toBe(0.5);
  });

  it("treats an unreadable age as new", () => {
    expect(newAccountPenalty({ createdAt: "not a date" }, NOW)).toBe(0.25);
  });

  it("scales a limit without ever reaching zero", () => {
    expect(penalizedLimit(20, { createdAt: ago(60_000), emailVerified: true }, NOW)).toBe(5);
    expect(penalizedLimit(20, { createdAt: ago(60 * 24 * HOUR), emailVerified: true }, NOW)).toBe(20);
    expect(penalizedLimit(2, { createdAt: ago(60_000), emailVerified: false }, NOW)).toBe(1);
  });
});
