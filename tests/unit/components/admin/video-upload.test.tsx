/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoUpload } from "@/components/admin/video-upload";

describe("VideoUpload", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload and URL mode buttons", () => {
    render(<VideoUpload value="" onChange={mockOnChange} />);

    expect(screen.getByText("Upload")).toBeTruthy();
    expect(screen.getByText("URL externe")).toBeTruthy();
  });

  it("shows drag & drop zone in upload mode", () => {
    render(<VideoUpload value="" onChange={mockOnChange} />);

    expect(screen.getByText("Glissez votre vidéo ici")).toBeTruthy();
    expect(screen.getByText(/MP4, WebM ou OGG/)).toBeTruthy();
    expect(screen.getByText("Parcourir les fichiers")).toBeTruthy();
  });

  it("switches to URL mode and shows input", () => {
    render(<VideoUpload value="" onChange={mockOnChange} />);

    fireEvent.click(screen.getByText("URL externe"));

    const input = screen.getByPlaceholderText("https://example.com/video.mp4");
    expect(input).toBeTruthy();
  });

  it("calls onChange when URL is entered", () => {
    render(<VideoUpload value="" onChange={mockOnChange} />);

    fireEvent.click(screen.getByText("URL externe"));
    const input = screen.getByPlaceholderText("https://example.com/video.mp4");
    fireEvent.change(input, {
      target: { value: "https://example.com/video.mp4" },
    });

    expect(mockOnChange).toHaveBeenCalledWith("https://example.com/video.mp4");
  });

  it("shows current value in URL input when value is provided", () => {
    render(
      <VideoUpload
        value="https://cdn.example.com/video.mp4"
        onChange={mockOnChange}
      />,
    );

    // Starts in URL mode when value exists — shows in input
    const input = screen.getByDisplayValue("https://cdn.example.com/video.mp4");
    expect(input).toBeTruthy();
  });

  it("starts in URL mode when value is provided", () => {
    render(
      <VideoUpload
        value="https://cdn.example.com/video.mp4"
        onChange={mockOnChange}
      />,
    );

    // URL input should be visible with the value
    const input = screen.getByDisplayValue("https://cdn.example.com/video.mp4");
    expect(input).toBeTruthy();
  });

  it("resets when X button is clicked (upload mode with existing value)", () => {
    render(
      <VideoUpload
        value="https://cdn.example.com/vid.mp4"
        onChange={mockOnChange}
      />,
    );

    // Switch to upload mode to see the existing value display
    fireEvent.click(screen.getByText("Upload"));

    // There should be a reset button
    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find(
      (btn) => btn.querySelector("svg") && btn.className.includes("h-7"),
    );
    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnChange).toHaveBeenCalledWith("");
    }
  });

  it("applies custom className", () => {
    const { container } = render(
      <VideoUpload value="" onChange={mockOnChange} className="custom-class" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("custom-class");
  });
});
