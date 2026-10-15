/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

// Mock tiptap to avoid JSDOM issues with contentEditable
vi.mock("@tiptap/react", () => {
  const MockEditorContent = ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-content" contentEditable>
      {editor ? "Editor loaded" : ""}
    </div>
  );

  const mockEditor = {
    isActive: vi.fn().mockReturnValue(false),
    can: vi.fn().mockReturnValue({ undo: () => true, redo: () => true }),
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        toggleBold: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleItalic: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleStrike: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleCode: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleHeading: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleBulletList: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleOrderedList: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleBlockquote: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleCodeBlock: vi.fn().mockReturnValue({ run: vi.fn() }),
        setLink: vi.fn().mockReturnValue({ run: vi.fn() }),
        setImage: vi.fn().mockReturnValue({ run: vi.fn() }),
        setHorizontalRule: vi.fn().mockReturnValue({ run: vi.fn() }),
        undo: vi.fn().mockReturnValue({ run: vi.fn() }),
        redo: vi.fn().mockReturnValue({ run: vi.fn() }),
      }),
    }),
    getHTML: vi.fn().mockReturnValue("<p>Test</p>"),
    commands: { setContent: vi.fn() },
  };

  return {
    useEditor: vi.fn().mockReturnValue(mockEditor),
    EditorContent: MockEditorContent,
  };
});

vi.mock("@tiptap/starter-kit", () => ({
  default: { configure: vi.fn().mockReturnValue({}) },
}));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: vi.fn().mockReturnValue({}) },
}));
vi.mock("@tiptap/extension-code-block-lowlight", () => ({
  default: { configure: vi.fn().mockReturnValue({}) },
}));
vi.mock("@tiptap/extension-image", () => ({
  default: { configure: vi.fn().mockReturnValue({}) },
}));
vi.mock("@tiptap/extension-link", () => ({
  default: { configure: vi.fn().mockReturnValue({}) },
}));
vi.mock("lowlight", () => ({
  createLowlight: vi.fn().mockReturnValue({ register: vi.fn() }),
}));
vi.mock("highlight.js/lib/languages/javascript", () => ({ default: {} }));
vi.mock("highlight.js/lib/languages/typescript", () => ({ default: {} }));
vi.mock("highlight.js/lib/languages/css", () => ({ default: {} }));
vi.mock("highlight.js/lib/languages/python", () => ({ default: {} }));

describe("RichTextEditor", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the editor with toolbar", () => {
    render(<RichTextEditor content="<p>Hello</p>" onChange={mockOnChange} />);

    expect(screen.getByTestId("editor-content")).toBeTruthy();
  });

  it("renders formatting buttons", () => {
    render(<RichTextEditor content="" onChange={mockOnChange} />);

    expect(screen.getByTitle("Gras")).toBeTruthy();
    expect(screen.getByTitle("Italique")).toBeTruthy();
    expect(screen.getByTitle("Barré")).toBeTruthy();
    expect(screen.getByTitle("Code inline")).toBeTruthy();
  });

  it("renders heading buttons", () => {
    render(<RichTextEditor content="" onChange={mockOnChange} />);

    expect(screen.getByTitle("Titre 1")).toBeTruthy();
    expect(screen.getByTitle("Titre 2")).toBeTruthy();
    expect(screen.getByTitle("Titre 3")).toBeTruthy();
  });

  it("renders list and structure buttons", () => {
    render(<RichTextEditor content="" onChange={mockOnChange} />);

    expect(screen.getByTitle("Liste à puces")).toBeTruthy();
    expect(screen.getByTitle("Liste numérotée")).toBeTruthy();
    expect(screen.getByTitle("Citation")).toBeTruthy();
    expect(screen.getByTitle("Bloc de code")).toBeTruthy();
  });

  it("renders media and utility buttons", () => {
    render(<RichTextEditor content="" onChange={mockOnChange} />);

    expect(screen.getByTitle("Lien")).toBeTruthy();
    expect(screen.getByTitle("Image")).toBeTruthy();
    expect(screen.getByTitle("Séparateur")).toBeTruthy();
    expect(screen.getByTitle("Annuler")).toBeTruthy();
    expect(screen.getByTitle("Rétablir")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RichTextEditor
        content=""
        onChange={mockOnChange}
        className="custom-class"
      />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("custom-class");
  });
});
