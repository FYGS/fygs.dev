"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function VideoUpload({ value, onChange, className }: VideoUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file
      const maxSize = 500 * 1024 * 1024; // 500MB
      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Format non supporté. Utilisez MP4, WebM ou OGG.");
        setStatus("error");
        return;
      }

      if (file.size > maxSize) {
        setError("Le fichier est trop volumineux (max 500 Mo).");
        setStatus("error");
        return;
      }

      setStatus("uploading");
      setProgress(0);
      setError(null);

      try {
        // Get presigned upload URL from server
        const response = await fetch("/api/upload/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(
            err.error || "Erreur lors de la préparation de l'upload",
          );
        }

        const { uploadUrl, publicUrl } = await response.json();

        // Upload file with progress tracking
        await uploadWithProgress(file, uploadUrl, (pct) => setProgress(pct));

        setStatus("success");
        setProgress(100);
        onChange(publicUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur d'upload");
        setStatus("error");
      }
    },
    [onChange],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
        >
          <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
          URL externe
        </Button>
      </div>

      {mode === "url" ? (
        /* URL mode */
        <Input
          type="url"
          placeholder="https://example.com/video.mp4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        /* Upload mode */
        <>
          {status === "idle" && !value && (
            <div
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Video className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Glissez votre vidéo ici
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                MP4, WebM ou OGG — 500 Mo max
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Parcourir les fichiers
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          )}

          {status === "uploading" && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Upload en cours...
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === "success" && value && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Vidéo uploadée
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {value}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {error || "Erreur d'upload"}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Show current value if exists and idle */}
          {status === "idle" && value && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Video className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground truncate flex-1">
                {value}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Upload with XMLHttpRequest for progress tracking
function uploadWithProgress(
  file: File,
  url: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.send(file);
  });
}
