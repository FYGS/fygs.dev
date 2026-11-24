import { describe, expect, it, vi } from "vitest";
import { inspectDatabaseUrl, reportDatabaseUrl } from "@/lib/database-url";

const prod = { production: true, hasExtraCa: false };
const codes = (url: string | undefined, options = prod) => inspectDatabaseUrl(url, options).map((f) => f.code);

describe("inspectDatabaseUrl", () => {
  it("rejects a missing, blank or malformed URL", () => {
    expect(codes(undefined)).toEqual(["MISSING"]);
    expect(codes("  ")).toEqual(["MISSING"]);
    expect(codes("not a url")).toEqual(["INVALID"]);
    expect(codes("mysql://u:p@db.example.com/app")).toEqual(["INVALID"]);
  });

  it("never echoes the credentials", () => {
    const messages = inspectDatabaseUrl("postgresql://admin:s3cret@db.example.com/app?pgbouncer=true", prod)
      .map((f) => f.message)
      .join(" ");
    expect(messages).not.toContain("s3cret");
    expect(messages).not.toContain("admin");
  });

  it("flags the Prisma-only parameters the pg adapter ignores", () => {
    const findings = inspectDatabaseUrl(
      "postgresql://u:p@db.example.com/app?sslmode=require&pgbouncer=true&connection_limit=5",
      { production: false, hasExtraCa: false },
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ level: "warn", code: "IGNORED_PARAMS" });
    expect(findings[0].message).toContain("pgbouncer, connection_limit");
  });

  it("warns about an unencrypted remote connection in production only", () => {
    expect(codes("postgresql://u:p@db.example.com/app")).toContain("NO_TLS");
    expect(codes("postgresql://u:p@db.example.com/app?sslmode=disable")).toContain("NO_TLS");
    expect(codes("postgresql://u:p@db.example.com/app", { production: false, hasExtraCa: false })).toEqual([]);
  });

  it("does not ask for TLS on a local database", () => {
    expect(codes("postgresql://u:p@localhost:5432/app")).toEqual([]);
    expect(codes("postgresql://u:p@127.0.0.1:5432/app")).toEqual([]);
  });

  it("flags sslmode=no-verify as encrypted but unauthenticated", () => {
    expect(codes("postgresql://u:p@db.example.com/app?sslmode=no-verify")).toEqual(["TLS_NOT_VERIFIED"]);
  });

  it("explains the private CA case, and is silent once NODE_EXTRA_CA_CERTS is set", () => {
    const url = "postgresql://u:p@db.example.com/app?sslmode=require";
    expect(codes(url)).toEqual(["TLS_PRIVATE_CA"]);
    expect(codes(url, { production: true, hasExtraCa: true })).toEqual([]);
    expect(codes("postgresql://u:p@db.example.com/app?sslmode=verify-full", prod)).toEqual(["TLS_PRIVATE_CA"]);
  });
});

describe("reportDatabaseUrl", () => {
  it("logs each finding at its level with a [database] prefix", () => {
    const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn() };
    reportDatabaseUrl({ NODE_ENV: "production", DATABASE_URL: "postgresql://u:p@db.example.com/app" }, log);
    expect(log.warn).toHaveBeenCalledWith(expect.stringMatching(/^\[database\] NO_TLS: /));
    expect(log.error).not.toHaveBeenCalled();

    reportDatabaseUrl({ NODE_ENV: "production" }, log);
    expect(log.error).toHaveBeenCalledWith(expect.stringMatching(/^\[database\] MISSING: /));
  });

  it("reads NODE_EXTRA_CA_CERTS from the environment", () => {
    const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn() };
    const findings = reportDatabaseUrl(
      {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://u:p@db.example.com/app?sslmode=require",
        NODE_EXTRA_CA_CERTS: "/etc/ssl/ca.pem",
      },
      log,
    );
    expect(findings).toEqual([]);
  });
});
