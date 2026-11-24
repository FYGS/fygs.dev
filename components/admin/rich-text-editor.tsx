"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  ImagePlus,
  Code2,
  Loader2,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CODE_LANGUAGES, normalizeLinkUrl } from "@/lib/curriculum/content";
import { cn } from "@/lib/utils";
import { isHttpsUrl, UploadError, uploadImageFile } from "./direct-upload";

const lowlight = createLowlight();
for (const [name, language] of Object.entries({ bash, css, go, java, javascript, json, php, python, rust, sql, typescript, xml, yaml })) {
  lowlight.register(name, language);
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

type DialogState = { kind: "link"; url: string; editing: boolean } | { kind: "image"; url: string; alt: string } | null;

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Écrivez le contenu de votre leçon...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      // images are stored files or addresses: never inline data, which the learner page does not show
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["mailto"],
        HTMLAttributes: { class: "text-primary underline", rel: "noopener noreferrer" },
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const [dialog, setDialog] = useState<DialogState>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const current = (editor.getAttributes("link").href as string | undefined) ?? "";
    setDialog({ kind: "link", url: current, editing: current !== "" });
  }, [editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (file.size > 5 * 1024 * 1024) return void toast.error("L'image dépasse 5 Mo.");
      setUploading(true);
      try {
        const src = await uploadImageFile(file, { folder: "lessons", prefix: "lesson" });
        editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
      } catch (error) {
        if (error instanceof UploadError && error.storageUnavailable) {
          toast.error("Stockage non configuré : insérez l'image depuis son adresse.");
          setDialog({ kind: "image", url: "", alt: "" });
        } else {
          toast.error(error instanceof Error ? error.message : "L'envoi de l'image a échoué.");
        }
      } finally {
        setUploading(false);
        if (fileInput.current) fileInput.current.value = "";
      }
    },
    [editor],
  );

  if (!editor) return null;

  const codeLanguage = editor.isActive("codeBlock") ? ((editor.getAttributes("codeBlock").language as string | null) ?? "plaintext") : null;

  return (
    <div className={cn("rounded-md border border-input bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5" role="toolbar" aria-label="Mise en forme">
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code inline">
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titre 1">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre 2">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titre 3">
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Bloc de code">
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton onClick={openLinkDialog} active={editor.isActive("link")} title={editor.isActive("link") ? "Modifier le lien" : "Lien"}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} title="Retirer le lien">
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}
          <ToolbarButton onClick={() => fileInput.current?.click()} disabled={uploading} title="Insérer une image depuis un fichier">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </ToolbarButton>
          <ToolbarButton onClick={() => setDialog({ kind: "image", url: "", alt: "" })} title="Insérer une image depuis une adresse">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir">
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </ToolbarGroup>

        {codeLanguage !== null && <CodeLanguagePicker editor={editor} value={codeLanguage} />}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choisir une image à insérer"
        onChange={(e) => e.target.files?.[0] && void uploadImage(e.target.files[0])}
      />

      <EditorContent editor={editor} />

      {dialog?.kind === "link" && (
      <LinkDialog
        state={dialog}
        onClose={() => setDialog(null)}
        onApply={(href) => {
          editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          setDialog(null);
        }}
        onRemove={() => {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          setDialog(null);
        }}
      />
      )}
      {dialog?.kind === "image" && (
      <ImageDialog
        state={dialog}
        onClose={() => setDialog(null)}
        onApply={(src, alt) => {
          editor.chain().focus().setImage({ src, alt }).run();
          setDialog(null);
        }}
      />
      )}
    </div>
  );
}

function CodeLanguagePicker({ editor, value }: { editor: Editor; value: string }) {
  const id = useId();
  return (
    <div className="ml-auto flex items-center gap-1.5 pl-2">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        Langage du code
      </label>
      <select
        id={id}
        value={CODE_LANGUAGES.some((l) => l.value === value) ? value : "plaintext"}
        onChange={(e) => editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs"
      >
        {CODE_LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LinkDialog({
  state,
  onClose,
  onApply,
  onRemove,
}: {
  /** Shown while mounted: the editor mounts it with the current link, fresh each time. */
  state: { url: string; editing: boolean };
  onClose: () => void;
  onApply: (href: string) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [url, setUrl] = useState(state.url);
  const [touched, setTouched] = useState(false);
  const normalized = normalizeLinkUrl(url);
  const invalid = touched && url.trim() !== "" && normalized === null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.editing ? "Modifier le lien" : "Ajouter un lien"}</DialogTitle>
          <DialogDescription>Le texte sélectionné devient un lien. Adresse web, e-mail (mailto:) ou page du site (/formations).</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (normalized) onApply(normalized);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={id}>Adresse du lien</Label>
            <Input id={id} value={url} autoFocus placeholder="https://…" aria-invalid={invalid} onChange={(e) => setUrl(e.target.value)} onBlur={() => setTouched(true)} />
            {invalid && <p className="text-sm text-destructive">Cette adresse n&apos;est pas valide.</p>}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {state.editing ? (
              <Button type="button" variant="ghost" onClick={onRemove}>
                <Unlink className="mr-1.5 h-4 w-4" aria-hidden />
                Retirer le lien
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={!normalized}>
                {state.editing ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImageDialog({
  state,
  onClose,
  onApply,
}: {
  state: { url: string; alt: string };
  onClose: () => void;
  onApply: (src: string, alt: string) => void;
}) {
  const urlId = useId();
  const altId = useId();
  const [url, setUrl] = useState(state.url);
  const [alt, setAlt] = useState(state.alt);
  const valid = isHttpsUrl(url);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insérer une image depuis une adresse</DialogTitle>
          <DialogDescription>L&apos;image reste hébergée à cette adresse : vérifiez qu&apos;elle est publique et durable.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onApply(url.trim(), alt.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={urlId}>Adresse de l&apos;image</Label>
            <Input id={urlId} value={url} autoFocus placeholder="https://…/schema.png" onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={altId}>Description (pour les lecteurs d&apos;écran)</Label>
            <Input id={altId} value={alt} maxLength={200} placeholder="Ce que montre l'image" onChange={(e) => setAlt(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!valid}>
              Insérer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Toolbar Sub-Components ---

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarSeparator() {
  return <div className="mx-1 h-6 w-px bg-border" aria-hidden />;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", active && "bg-muted text-foreground")}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </Button>
  );
}
