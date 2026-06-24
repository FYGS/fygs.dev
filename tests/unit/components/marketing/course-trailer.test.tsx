/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CourseTrailer } from "@/components/marketing/course-trailer";

describe("CourseTrailer", () => {
  it("renders play button overlay initially", () => {
    render(
      <CourseTrailer
        trailerUrl="/video.mp4"
        thumbnail="/thumb.jpg"
        title="Next.js Masterclass"
      />,
    );
    expect(
      screen.getByLabelText("Lancer la bande-annonce"),
    ).toBeInTheDocument();
  });

  it("hides overlay and plays video on click", () => {
    render(
      <CourseTrailer trailerUrl="/video.mp4" thumbnail={null} title="Course" />,
    );
    const playBtn = screen.getByLabelText("Lancer la bande-annonce");
    // Mock video play
    const video = document.querySelector("video")!;
    video.play = vi.fn().mockResolvedValue(undefined);

    fireEvent.click(playBtn);

    expect(video.play).toHaveBeenCalled();
    expect(
      screen.queryByLabelText("Lancer la bande-annonce"),
    ).not.toBeInTheDocument();
  });

  it("sets poster from thumbnail", () => {
    render(
      <CourseTrailer
        trailerUrl="/video.mp4"
        thumbnail="/thumb.jpg"
        title="Course"
      />,
    );
    const video = document.querySelector("video")!;
    expect(video.poster).toContain("/thumb.jpg");
  });
});
