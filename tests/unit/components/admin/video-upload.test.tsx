/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VideoUpload } from "@/components/admin/video-upload";

describe("VideoUpload", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers a file or an address, in French", () => {
    render(<VideoUpload value="" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Envoyer un fichier" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Coller une adresse" })).toBeTruthy();
    expect(screen.getByText("Glissez votre vidéo ici")).toBeTruthy();
    expect(screen.getByText(/MP4, WebM, OGG ou MOV \(QuickTime\), 500 Mo au plus/)).toBeTruthy();
  });

  it("takes an address and says when it is not one", () => {
    const { rerender } = render(<VideoUpload value="" onChange={onChange} label="Adresse de la vidéo" />);
    fireEvent.click(screen.getByRole("button", { name: "Coller une adresse" }));
    fireEvent.change(screen.getByLabelText("Adresse de la vidéo"), { target: { value: "https://youtu.be/abc" } });
    expect(onChange).toHaveBeenCalledWith("https://youtu.be/abc");
    rerender(<VideoUpload value="pas-une-adresse" onChange={onChange} label="Adresse de la vidéo" />);
    expect(screen.getByText("L'adresse doit commencer par https://.")).toBeTruthy();
  });

  it("starts on the address when a video is set, and can remove it", () => {
    render(<VideoUpload value="https://cdn.example.com/video.mp4" onChange={onChange} />);
    expect(screen.getByDisplayValue("https://cdn.example.com/video.mp4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer un fichier" }));
    fireEvent.click(screen.getByRole("button", { name: "Retirer la vidéo" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("refuses a format the storage does not take, before sending anything", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<VideoUpload value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Fichier vidéo"), { target: { files: [new File(["x"], "clip.avi", { type: "video/x-msvideo" })] } });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/Format non pris en charge/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("without storage, says so and opens the address field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: "Stockage non configuré : l'envoi de fichiers n'est pas disponible. Collez l'adresse du fichier à la place.", code: "STORAGE_UNAVAILABLE" }),
      }),
    );
    render(<VideoUpload value="" onChange={onChange} label="Adresse de la vidéo" />);
    fireEvent.change(screen.getByLabelText("Fichier vidéo"), { target: { files: [new File(["x"], "clip.mp4", { type: "video/mp4" })] } });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/Stockage non configuré/));
    expect(screen.getByLabelText("Adresse de la vidéo")).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies a custom className", () => {
    const { container } = render(<VideoUpload value="" onChange={onChange} className="custom-class" />);
    expect((container.firstChild as HTMLElement).className).toContain("custom-class");
  });
});
