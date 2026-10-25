"use client";

import { useId, useRef, useState } from "react";
import { Captions, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isHttpUrl, UploadError, uploadCaptionsFile } from "@/components/admin/direct-upload";
import { CAPTIONS_ACCEPT } from "@/lib/resource-types";
import { TRANSCRIPT_MAX_LENGTH } from "@/lib/curriculum/limits";

interface Props {
  captionsUrl: string;
  transcript: string;
  hasVideo: boolean;
  onCaptionsChange: (url: string) => void;
  onTranscriptChange: (text: string) => void;
}

/**
 * Accessibility of the video: a WebVTT captions file (shown in the player, downloadable) and a transcript
 * (a text version of the video, for those who read rather than watch or cannot hear it).
 */
export function CaptionsField({ captionsUrl, transcript, hasVideo, onCaptionsChange, onTranscriptChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const urlId = useId();
  const transcriptId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState(captionsUrl);
  const invalid = address.trim() !== "" && !isHttpUrl(address);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const url = await uploadCaptionsFile(file, () => undefined);
      setAddress(url);
      onCaptionsChange(url);
    } catch (e) {
      setError(
        e instanceof UploadError && e.storageUnavailable
          ? "Stockage non configuré : collez l'adresse du fichier .vtt ci-dessous."
          : e instanceof Error
            ? e.message
            : "L'envoi a échoué.",
      );
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Captions className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h4 className="text-sm font-medium">Sous-titres et transcription</h4>
      </div>
      {!hasVideo && <p className="text-sm text-muted-foreground">Ajoutez d&apos;abord une vidéo : les sous-titres s&apos;affichent dans son lecteur.</p>}

      <div className="space-y-1.5">
        <Label htmlFor={urlId}>Fichier de sous-titres (WebVTT)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={urlId}
            className="min-w-0 flex-1"
            type="url"
            inputMode="url"
            placeholder="https://…/sous-titres.vtt"
            value={address}
            aria-invalid={invalid}
            onChange={(e) => {
              const value = e.target.value;
              setAddress(value);
              if (!value.trim() || isHttpUrl(value)) onCaptionsChange(value.trim());
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Upload className="mr-1.5 h-4 w-4" aria-hidden />}
            Envoyer un .vtt
          </Button>
          {captionsUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddress("");
                onCaptionsChange("");
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
              Retirer
            </Button>
          )}
        </div>
        <p className={invalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {invalid ? "L'adresse doit commencer par http:// ou https://." : "Le format lu par les navigateurs pour les sous-titres. 2 Mo au plus."}
        </p>
        <input
          ref={fileInput}
          type="file"
          accept={CAPTIONS_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label="Fichier de sous-titres"
          onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={transcriptId}>Transcription</Label>
        <Textarea
          id={transcriptId}
          rows={5}
          maxLength={TRANSCRIPT_MAX_LENGTH}
          value={transcript}
          placeholder="Le texte de la vidéo, pour lire plutôt que regarder."
          onChange={(e) => onTranscriptChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Affichée sous la vidéo dans un onglet « Transcription ».</p>
      </div>
    </div>
  );
}
