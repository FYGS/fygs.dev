/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoPlayer } from "@/app/[locale]/(main)/formations/[slug]/lessons/[lessonSlug]/_components/video-player";

// Mock the progress hook
vi.mock("@/hooks/use-lesson-progress", () => ({
  useLessonProgress: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    markCompleted: vi.fn(),
  }),
}));

const mockLesson = {
  id: "lesson-1",
  title: "Test Lesson",
  videoUrl: "https://example.com/video.mp4",
  duration: 600,
};

describe("VideoPlayer keyboard shortcuts", () => {
  beforeEach(() => {
    // Mock HTMLMediaElement methods
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "duration", {
      configurable: true,
      get: () => 600,
    });
    Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
      configurable: true,
      writable: true,
      value: 100,
    });
    Object.defineProperty(HTMLMediaElement.prototype, "volume", {
      configurable: true,
      writable: true,
      value: 0.8,
    });
    Object.defineProperty(HTMLMediaElement.prototype, "muted", {
      configurable: true,
      writable: true,
      value: false,
    });
    Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
      configurable: true,
      writable: true,
      value: 1,
    });
    // Mock PiP
    Object.defineProperty(document, "pictureInPictureEnabled", {
      configurable: true,
      value: false,
    });
  });

  it("shows keyboard shortcuts overlay when ? is pressed", () => {
    render(
      <VideoPlayer
        lesson={mockLesson}
        userId="user-1"
        initialProgress={null}
      />,
    );

    fireEvent.keyDown(document, { key: "?" });

    expect(screen.getByText("Raccourcis clavier")).toBeTruthy();
    expect(screen.getByText("Lecture / Pause")).toBeTruthy();
    expect(screen.getByText("Plein écran")).toBeTruthy();
  });

  it("hides shortcuts overlay when Escape is pressed", () => {
    render(
      <VideoPlayer
        lesson={mockLesson}
        userId="user-1"
        initialProgress={null}
      />,
    );

    // Open shortcuts
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByText("Raccourcis clavier")).toBeTruthy();

    // Close shortcuts
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Raccourcis clavier")).toBeNull();
  });

  it("toggles play/pause on Space key", () => {
    render(
      <VideoPlayer
        lesson={mockLesson}
        userId="user-1"
        initialProgress={null}
      />,
    );

    fireEvent.keyDown(document, { key: " " });
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("toggles play/pause on K key", () => {
    render(
      <VideoPlayer
        lesson={mockLesson}
        userId="user-1"
        initialProgress={null}
      />,
    );

    fireEvent.keyDown(document, { key: "k" });
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("does not intercept keys when typing in input", () => {
    const { container } = render(
      <div>
        <input data-testid="text-input" />
        <VideoPlayer
          lesson={mockLesson}
          userId="user-1"
          initialProgress={null}
        />
      </div>,
    );

    const input = screen.getByTestId("text-input");
    fireEvent.keyDown(input, { key: " " });

    // Should NOT trigger play since target is an input
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("renders no video placeholder when videoUrl is null", () => {
    render(
      <VideoPlayer
        lesson={{ ...mockLesson, videoUrl: null }}
        userId="user-1"
        initialProgress={null}
      />,
    );

    expect(screen.getByText("Vidéo bientôt disponible")).toBeTruthy();
  });
});
