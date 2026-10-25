import { describe, expect, it } from "vitest";
import { parseVideoSource } from "@/lib/learning/video-source";
import { isFetchableCaptionsUrl, lessonCaptionsPath } from "@/lib/learning/captions";
import { formatFileSize } from "@/lib/format-size";
import { certificatePdfPath, certificateVerifyPath, isCertificateCode } from "@/lib/learning/certificates";

describe("parseVideoSource", () => {
  it("keeps files (uploads, direct links) for the platform's own player", () => {
    expect(parseVideoSource("https://cdn.example.org/videos/intro.mp4")).toEqual({ kind: "file", src: "https://cdn.example.org/videos/intro.mp4" });
    expect(parseVideoSource("/uploads/intro.webm")).toEqual({ kind: "file", src: "/uploads/intro.webm" });
  });

  it("turns every YouTube address into the privacy-enhanced embed", () => {
    for (const address of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share",
    ]) {
      const source = parseVideoSource(address);
      expect(source.kind, address).toBe("youtube");
      if (source.kind === "youtube") expect(source.embedUrl).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
    }
  });

  it("keeps the start time of a YouTube link", () => {
    const source = parseVideoSource("https://youtu.be/dQw4w9WgXcQ?t=1m30s");
    expect(source.kind === "youtube" && new URL(source.embedUrl).searchParams.get("start")).toBe("90");
  });

  it("turns Vimeo pages and players into the do-not-track player, with the privacy hash of unlisted videos", () => {
    const page = parseVideoSource("https://vimeo.com/287094149");
    expect(page).toMatchObject({ kind: "vimeo", id: "287094149" });
    expect(page.kind === "vimeo" && page.embedUrl).toBe("https://player.vimeo.com/video/287094149?dnt=1");
    const unlisted = parseVideoSource("https://vimeo.com/287094149/abc123def4");
    expect(unlisted.kind === "vimeo" && new URL(unlisted.embedUrl).searchParams.get("h")).toBe("abc123def4");
    expect(parseVideoSource("https://player.vimeo.com/video/287094149")).toMatchObject({ kind: "vimeo", id: "287094149" });
  });

  it("does not take a look-alike or a broken id for an embed", () => {
    expect(parseVideoSource("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ").kind).toBe("file");
    expect(parseVideoSource("https://www.youtube.com/watch?v=short").kind).toBe("file");
    expect(parseVideoSource("not a url").kind).toBe("file");
  });
});

describe("captions", () => {
  it("only fetches captions from public HTTPS hosts by name", () => {
    expect(isFetchableCaptionsUrl("https://cdn.example.org/captions/l1.vtt")).toBe(true);
    for (const address of [
      "http://cdn.example.org/l1.vtt",
      "https://127.0.0.1/l1.vtt",
      "https://[::1]/l1.vtt",
      "https://localhost/l1.vtt",
      "https://db.internal/l1.vtt",
      "https://user:pass@cdn.example.org/l1.vtt",
      "file:///etc/passwd",
      "pas une adresse",
    ]) {
      expect(isFetchableCaptionsUrl(address), address).toBe(false);
    }
  });

  it("serves them from the site's own origin", () => {
    expect(lessonCaptionsPath("l1")).toBe("/api/learn/captions/l1");
  });
});

describe("small formatters", () => {
  it("formats file sizes in French units", () => {
    expect(formatFileSize(null)).toBe("");
    expect(formatFileSize(500)).toBe("1 Ko");
    expect(formatFileSize(320 * 1024)).toBe("320 Ko");
    expect(formatFileSize(4.2 * 1024 * 1024)).toBe("4,2 Mo");
  });

  it("knows a certificate code and where it is checked and downloaded", () => {
    const code = "0123456789abcdef0123456789abcdef";
    expect(isCertificateCode(code)).toBe(true);
    expect(isCertificateCode("0".repeat(31))).toBe(false);
    expect(isCertificateCode("'; drop table")).toBe(false);
    expect(certificateVerifyPath(code)).toBe(`/certificates/verify/${code}`);
    expect(certificatePdfPath(code)).toBe(`/api/certificates/pdf?code=${code}`);
  });
});
