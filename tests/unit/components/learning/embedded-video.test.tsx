/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmbeddedVideo } from "@/components/learning/embedded-video";
import { parseVideoSource } from "@/lib/learning/video-source";

describe("EmbeddedVideo", () => {
  it("loads nothing from the provider until the learner asks, then the privacy-enhanced player", () => {
    const source = parseVideoSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    if (source.kind === "file") throw new Error("expected an embed");
    const { container } = render(<EmbeddedVideo title="Variables" source={source} />);
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Lire la vidéo/ }));
    const frame = container.querySelector("iframe")!;
    expect(frame.getAttribute("src")).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
    expect(frame.getAttribute("src")).toContain("autoplay=1");
    expect(frame.getAttribute("title")).toBe("Vidéo (YouTube) : Variables");
  });
});
