"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, Link as LinkIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isHttpsUrl, UploadError, uploadImageFile } from "./direct-upload";

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

/**
 * One image: preview, upload (click or drop) or address, replace, remove. Without storage the address field is
 * the way in, so a course can always get its cover.
 */
export function ImageField({ value, onChange, folder = "images", prefix = "course", label, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const urlId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [address, setAddress] = useState("");
  const [broken, setBroken] = useState(false);

  async function upload(file: File) {
    setError(null);
    if (!TYPES.includes(file.type)) return setError("Format non pris en charge. Utilisez JPEG, PNG, GIF ou WebP.");
    if (file.size > MAX_BYTES) return setError("L'image dépasse 5 Mo.");
    setBusy(true);
    try {
      onChange(await uploadImageFile(file, { folder, prefix }));
      setBroken(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "L'envoi a échoué.");
      if (e instanceof UploadError && e.storageUnavailable) setUrlMode(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function applyAddress() {
    const url = address.trim();
    if (!isHttpsUrl(url)) return setError("L'adresse doit commencer par https://.");
    setError(null);
    setBroken(false);
    onChange(url);
    setAddress("");
    setUrlMode(false);
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
        {value && !broken ? (
          // a plain image: the cover may be on any host (no domain list to keep in sync)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <ImageIcon className="h-8 w-8" aria-hidden />
            <span>{broken ? "Cette image ne se charge pas : vérifiez son adresse." : "Glissez une image ici, choisissez un fichier ou collez une adresse"}</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70" role="status">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            <span className="sr-only">Envoi en cours</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          <Upload className="mr-1.5 h-4 w-4" aria-hidden />
          {value ? "Remplacer" : "Choisir une image"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setUrlMode((m) => !m)} aria-expanded={urlMode} disabled={busy}>
          <LinkIcon className="mr-1.5 h-4 w-4" aria-hidden />
          Coller une adresse
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Retirer
          </Button>
        )}
        <span className="text-xs text-muted-foreground">JPEG, PNG, GIF ou WebP, 5 Mo maximum</span>
      </div>

      {urlMode && (
        <div className="flex max-w-md items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={urlId}>Adresse de l&apos;image</Label>
            <Input
              id={urlId}
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyAddress();
                }
              }}
            />
          </div>
          <Button type="button" size="sm" onClick={applyAddress} disabled={!address.trim()}>
            Utiliser
          </Button>
        </div>
      )}

      <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
