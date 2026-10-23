"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Storage folder and file prefix passed to the upload API. */
  folder?: string;
  prefix?: string;
  label: string;
  className?: string;
}

/** One image: preview, upload (click or drop), replace, remove. */
export function ImageField({ value, onChange, folder = "images", prefix = "course", label, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setError(null);
    if (!TYPES.includes(file.type)) return setError("Format non pris en charge. Utilisez JPEG, PNG, GIF ou WebP.");
    if (file.size > MAX_BYTES) return setError("L'image dépasse 5 Mo.");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      body.append("prefix", prefix);
      const response = await fetch("/api/upload/image", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error("L'envoi a échoué. Réessayez.");
      onChange(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "L'envoi a échoué.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={cn(
          "relative flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/30",
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        )}
      >
        {value ? (
          <Image src={value} alt={label} fill sizes="448px" className="object-cover" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <ImageIcon className="h-8 w-8" aria-hidden />
            <span>Glissez une image ici ou choisissez un fichier</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70" role="status">
            <Loader2 className="h-6 w-6 animate-spin" aria-label="Envoi en cours" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          <Upload className="mr-1.5 h-4 w-4" aria-hidden />
          {value ? "Remplacer" : "Choisir une image"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Retirer
          </Button>
        )}
        <span className="text-xs text-muted-foreground">JPEG, PNG, GIF ou WebP, 5 Mo maximum</span>
      </div>
      <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
