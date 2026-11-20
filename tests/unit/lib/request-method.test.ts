import { describe, expect, it } from "vitest";

import { ALLOW_HEADER, isMethodAllowed } from "@/lib/request-guard";

describe("isMethodAllowed", () => {
  it("accepts the methods the application answers, in any case", () => {
    for (const method of ["GET", "head", "POST", "put", "PATCH", "DELETE", "OPTIONS"]) expect(isMethodAllowed(method), method).toBe(true);
  });

  it("refuses TRACE, TRACK, CONNECT and exotic methods", () => {
    for (const method of ["TRACE", "TRACK", "CONNECT", "PROPFIND", "FOO"]) expect(isMethodAllowed(method), method).toBe(false);
  });

  it("announces the allowed methods in the Allow header", () => {
    expect(ALLOW_HEADER.split(", ")).toEqual(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
  });
});
