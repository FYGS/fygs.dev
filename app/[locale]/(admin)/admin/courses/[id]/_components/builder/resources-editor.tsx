"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ExternalLink, File as FileIcon, Link as LinkIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { uploadResourceFile } from "@/components/admin/direct-upload";
import { formatFileSize, RESOURCE_ACCEPT } from "@/lib/resource-types";
import type { ResourceItem } from "@/lib/curriculum/curriculum";
import {
  addLessonResource,
  removeLessonResource,
  renameLessonResource,
  reorderLessonResources,
} from "../../_actions/curriculum-actions";

interface Props {
  lessonId: string;
  resources: ResourceItem[];
  onChange: (resources: ResourceItem[]) => void;
}

/** Files and links attached to a lesson: upload, add a link, rename, reorder, remove. */
export function ResourcesEditor({ lessonId, resources, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  async function uploadFile(file: File) {
    setProgress(0);
    try {
      const url = await uploadResourceFile(file, setProgress);
      const title = file.name.replace(/\.[^.]+$/, "").slice(0, 150);
      const result = await addLessonResource(lessonId, { title, url, kind: "FILE", sizeBytes: file.size });
      if (!result.success) throw new Error(result.error);
      onChange([...resources, result.resource]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "L'envoi a échoué.");
    } finally {
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function addLink() {
    setAddingLink(true);
    const result = await addLessonResource(lessonId, { title: linkTitle, url: linkUrl.trim(), kind: "LINK" });
    setAddingLink(false);
    if (!result.success) return toast.error(result.error);
    onChange([...resources, result.resource]);
    setLinkTitle("");
    setLinkUrl("");
  }

  async function rename(resource: ResourceItem, title: string) {
    const next = title.trim();
    if (!next || next === resource.title) return;
    const result = await renameLessonResource(resource.id, next);
    if (!result.success) return toast.error(result.error);
    onChange(resources.map((r) => (r.id === resource.id ? { ...r, title: next } : r)));
  }

  async function remove(resource: ResourceItem) {
    const result = await removeLessonResource(resource.id);
    if (!result.success) return toast.error(result.error);
    onChange(resources.filter((r) => r.id !== resource.id).map((r, i) => ({ ...r, order: i + 1 })));
  }

  async function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= resources.length) return;
    const next = [...resources];
    [next[index], next[target]] = [next[target], next[index]];
    const result = await reorderLessonResources(lessonId, next.map((r) => r.id));
    if (!result.success) return toast.error(result.error);
    onChange(next.map((r, i) => ({ ...r, order: i + 1 })));
  }

  return (
    <div className="space-y-4">
      {resources.length === 0 && <p className="text-sm text-muted-foreground">Aucune ressource. Joignez un support à télécharger ou un lien utile.</p>}
      {resources.length > 0 && (
        <ul className="space-y-2" aria-label="Ressources de la leçon">
          {resources.map((resource, index) => (
            <li key={resource.id} className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5">
              {resource.kind === "FILE" ? <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Fichier" /> : <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Lien" />}
              <Input
                defaultValue={resource.title}
                maxLength={150}
                aria-label={`Titre de la ressource ${index + 1}`}
                className="h-8 flex-1"
                onBlur={(e) => void rename(resource, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
              {resource.sizeBytes ? <span className="hidden text-xs text-muted-foreground sm:inline">{formatFileSize(resource.sizeBytes)}</span> : null}
              <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${resource.title}`}>
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => void move(index, -1)} aria-label={`Monter ${resource.title}`}>
                <ArrowUp className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === resources.length - 1} onClick={() => void move(index, 1)} aria-label={`Descendre ${resource.title}`}>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void remove(resource)} aria-label={`Retirer ${resource.title}`}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={progress !== null}>
          {progress !== null ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Upload className="mr-1.5 h-4 w-4" aria-hidden />}
          Joindre un fichier
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">PDF, Office, ZIP, texte, CSV, JSON, PNG, JPEG — 50 Mo maximum</span>
        {progress !== null && <Progress value={progress} className="h-2" aria-label="Progression de l'envoi" />}
        <input ref={fileInput} type="file" accept={RESOURCE_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choisir un fichier à joindre" onChange={(e) => e.target.files?.[0] && void uploadFile(e.target.files[0])} />
      </div>

      <form
        className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          void addLink();
        }}
      >
        <Input value={linkTitle} maxLength={150} placeholder="Titre du lien" aria-label="Titre du lien" onChange={(e) => setLinkTitle(e.target.value)} />
        <Input value={linkUrl} type="url" placeholder="https://…" aria-label="Adresse du lien" onChange={(e) => setLinkUrl(e.target.value)} />
        <Button type="submit" variant="outline" disabled={addingLink || !linkTitle.trim() || !linkUrl.trim()}>
          <LinkIcon className="mr-1.5 h-4 w-4" aria-hidden />
          Ajouter le lien
        </Button>
      </form>
    </div>
  );
}
