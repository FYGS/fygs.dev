"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Link as LinkIcon, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { VIDEO_CONTENT_TYPES, VIDEO_FORMATS_LABEL } from "@/lib/resource-types";
import { cn } from "@/lib/utils";
import { isHttpUrl, UploadError, uploadVideoFile } from "./direct-upload";

type UploadStatus = "idle" | "uploading" | "done" | "error";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  /** Label of the address field (screen readers). */
  label?: string;
}

/**
 * A video by file (sent to the storage) or by address (a file elsewhere, YouTube or Vimeo). When the storage is
 * not configured, the error says so and the address field opens.
 */
export function VideoUpload({ value, onChange, className, label = "Adresse de la vidéo" }: VideoUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlId = useId();
  const urlInvalid = mode === "url" && value.trim() !== "" && !isHttpUrl(value);

  const handleFile = useCallback(
    async (file: File) => {
      setStatus("uploading");
      setProgress(0);
      setError(null);
      try {
        const url = await uploadVideoFile(file, setProgress);
        setStatus("done");
        setProgress(100);
        onChange(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "L'envoi a échoué.";
        setError(message);
        setStatus("error");
        if (err instanceof UploadError && err.storageUnavailable) setMode("url");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const clear = () => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    onChange("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2" role="group" aria-label="Source de la vidéo">
        <Button type="button" variant={mode === "upload" ? "default" : "outline"} size="sm" aria-pressed={mode === "upload"} onClick={() => setMode("upload")}>
          <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Envoyer un fichier
        </Button>
        <Button type="button" variant={mode === "url" ? "default" : "outline"} size="sm" aria-pressed={mode === "url"} onClick={() => setMode("url")}>
          <LinkIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Coller une adresse
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <p className="flex-1 text-sm text-destructive">{error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setError(null)}>
            Fermer
          </Button>
        </div>
      )}

      {mode === "url" ? (
        <div className="space-y-1.5">
          <Label htmlFor={urlId} className="sr-only">
            {label}
          </Label>
          <Input
            id={urlId}
            type="url"
            inputMode="url"
            placeholder="https://… (fichier vidéo, YouTube ou Vimeo)"
            value={value}
            aria-invalid={urlInvalid}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className={cn("text-xs", urlInvalid ? "text-destructive" : "text-muted-foreground")}>
            {urlInvalid ? "L'adresse doit commencer par http:// ou https://." : "Un fichier vidéo en ligne, ou une page YouTube ou Vimeo."}
          </p>
        </div>
      ) : status === "uploading" ? (
        <div className="space-y-2 rounded-lg border p-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Envoi de la vidéo…</span>
            <span className="font-medium">{Math.round(progress)} %</span>
          </div>
          <Progress value={progress} className="h-2" aria-label="Progression de l'envoi" />
        </div>
      ) : value ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {status === "done" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
          ) : (
            <Video className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{status === "done" ? "Vidéo envoyée" : "Vidéo de la leçon"}</p>
            <p className="truncate text-xs text-muted-foreground">{value}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={clear} aria-label="Retirer la vidéo">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          )}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={(e) => {
            onDrag(e);
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
        >
          <Video className="mb-3 h-10 w-10 text-muted-foreground/60" aria-hidden />
          <p className="mb-1 text-sm font-medium">Glissez votre vidéo ici</p>
          <p className="mb-3 text-xs text-muted-foreground">{VIDEO_FORMATS_LABEL}, 500 Mo au plus</p>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Choisir un fichier
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={Object.keys(VIDEO_CONTENT_TYPES).join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Fichier vidéo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
