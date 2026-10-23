/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VideoPlayer } from "@/components/learning/video-player";

const m = vi.hoisted(() => ({
  progress: { start: vi.fn(), stop: vi.fn(), addWatched: vi.fn(), setPosition: vi.fn(), flush: vi.fn(), complete: vi.fn() },
  complete: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@/components/learning/lesson-session", () => ({
  useLessonSession: () => ({
    progress: m.progress,
    registerPlayer: m.register,
    complete: m.complete,
    completed: false,
    recording: true,
  }),
}));

let paused = true;
const play = vi.fn(() => {
  paused = false;
  return Promise.resolve();
});
const pause = vi.fn(() => {
  paused = true;
});

beforeEach(() => {
  vi.clearAllMocks();
  paused = true;
  Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: play });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", { configurable: true, value: pause });
  Object.defineProperty(HTMLMediaElement.prototype, "paused", { configurable: true, get: () => paused });
});

const player = (resumeAt = 0) =>
  render(<VideoPlayer title="Variables" videoUrl="/v.mp4" durationHint={300} resumeAt={resumeAt} />);

/** jsdom does not play media: the element gets a plain writable clock */
const video = (container: HTMLElement) => {
  const el = container.querySelector("video") as HTMLVideoElement;
  if (!Object.getOwnPropertyDescriptor(el, "currentTime")) {
    Object.defineProperty(el, "currentTime", { value: 0, writable: true, configurable: true });
  }
  return el;
};
const group = () => screen.getByRole("group", { name: /Lecteur vidéo/ });

describe("VideoPlayer", () => {
  it("plays and pauses with Space while the player has focus", () => {
    player();
    fireEvent.keyDown(group(), { key: " " });
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(group(), { key: " " });
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("leaves the keys to a focused button: Space on a button does not also toggle playback", () => {
    player();
    const fullscreen = screen.getByRole("button", { name: "Plein écran" });
    const event = fireEvent.keyDown(fullscreen, { key: " " });
    expect(play).not.toHaveBeenCalled();
    expect(event).toBe(true); // not default-prevented: the button keeps its own behaviour
  });

  it("leaves the arrow keys to the sliders", () => {
    const { container } = player();
    const seekBar = screen.getByRole("slider", { name: "Position dans la vidéo" }); // a native range input
    const before = video(container).currentTime;
    fireEvent.keyDown(seekBar, { key: "ArrowRight" });
    expect(video(container).currentTime).toBe(before);
  });

  it("does not react to keys pressed elsewhere in the page", () => {
    player();
    fireEvent.keyDown(document.body, { key: " " });
    expect(play).not.toHaveBeenCalled();
  });

  it("skips with J and L", () => {
    const { container } = player();
    const el = video(container);
    Object.defineProperty(el, "duration", { configurable: true, value: 300 });
    el.currentTime = 100;
    fireEvent.keyDown(group(), { key: "l" });
    expect(el.currentTime).toBe(110);
    fireEvent.keyDown(group(), { key: "j" });
    expect(el.currentTime).toBe(100);
  });

  it("lists the shortcuts with ? and closes them", () => {
    player();
    fireEvent.keyDown(group(), { key: "?" });
    expect(screen.getByRole("dialog", { name: "Raccourcis clavier" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog", { name: "Raccourcis clavier" })).toBeNull();
  });

  it("names every control", () => {
    player();
    for (const name of ["Lecture", "Reculer de 10 secondes", "Avancer de 10 secondes", "Couper le son", "Plein écran", "Vitesse de lecture"]) {
      expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
    }
  });

  it("offers to restart when it resumed where the learner left off", () => {
    const { container } = player(120);
    const el = video(container);
    Object.defineProperty(el, "duration", { configurable: true, value: 300 });
    act(() => {
      el.dispatchEvent(new Event("loadedmetadata"));
    });
    expect(el.currentTime).toBe(120);
    expect(screen.getByText("Reprise à 2:00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Depuis le début" }));
    expect(el.currentTime).toBe(0);
    expect(screen.queryByText("Reprise à 2:00")).toBeNull();
  });

  it("counts time played, not the jumps of the seek bar", () => {
    const { container } = player();
    const el = video(container);
    const tick = (t: number) => {
      el.currentTime = t;
      act(() => {
        el.dispatchEvent(new Event("timeupdate"));
      });
    };
    tick(10);
    tick(11); // one second played
    tick(11.5); // half a second
    el.dispatchEvent(new Event("seeking"));
    tick(200); // a jump: nothing to add
    tick(201);
    expect(m.progress.addWatched.mock.calls.map((c) => c[0])).toEqual([1, 0.5, 1]);
    expect(m.progress.setPosition).toHaveBeenLastCalledWith(201);
  });

  it("reports on play and pause, and completes the lesson at the end", () => {
    const { container } = player();
    const el = video(container);
    act(() => {
      el.dispatchEvent(new Event("play"));
    });
    expect(m.progress.start).toHaveBeenCalled();
    act(() => {
      el.dispatchEvent(new Event("pause"));
    });
    expect(m.progress.stop).toHaveBeenCalled();
    act(() => {
      el.dispatchEvent(new Event("ended"));
    });
    expect(m.complete).toHaveBeenCalled();
  });

  it("explains a video that cannot be played", () => {
    const { container } = player();
    act(() => {
      video(container).dispatchEvent(new Event("error"));
    });
    expect(screen.getByRole("alert").textContent).toContain("La vidéo ne peut pas être lue");
  });
});
