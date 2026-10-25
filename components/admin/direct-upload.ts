import {
  CAPTIONS_CONTENT_TYPE,
  CAPTIONS_MAX_BYTES,
  RESOURCE_CONTENT_TYPES,
  RESOURCE_MAX_BYTES,
  VIDEO_CONTENT_TYPES,
  VIDEO_FORMATS_LABEL,
  VIDEO_MAX_BYTES,
} from "@/lib/resource-types";

/**
 * Uploads from the course editor. Files go straight from the browser to the storage with an address the server
 * signs; every error carries a sentence fit to show. When the storage is not configured the error says so
 * (`storageUnavailable`) and the field offers to paste an address instead.
 */
export class UploadError extends Error {
  constructor(
    message: string,
    readonly storageUnavailable = false,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/** PUTs a file to a presigned URL, reporting progress (0-100). */
export function putWithProgress(
  file: File,
  url: string,
  contentType: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    });
    xhr.addEventListener("load", () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError(`Le stockage a refusé le fichier (erreur ${xhr.status}). Réessayez ou collez une adresse.`)),
    );
    xhr.addEventListener("error", () => reject(new UploadError("Connexion perdue pendant l'envoi. Réessayez.")));
    xhr.addEventListener("abort", () => reject(new UploadError("Envoi annulé.")));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}

/** Asks the server for an upload address, then sends the file to it. Returns the public address of the file. */
async function presignedUpload(
  endpoint: string,
  body: Record<string, unknown>,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new UploadError("Connexion perdue. Réessayez.");
  }
  const result = (await response.json().catch(() => ({}))) as { uploadUrl?: string; publicUrl?: string; error?: string; code?: string };
  if (!response.ok || !result.uploadUrl || !result.publicUrl) {
    throw new UploadError(result.error ?? "L'envoi n'a pas pu être préparé. Réessayez.", result.code === "STORAGE_UNAVAILABLE" || response.status === 503);
  }
  await putWithProgress(file, result.uploadUrl, contentType, onProgress, signal);
  return result.publicUrl;
}

/** A lesson attachment (document). */
export async function uploadResourceFile(file: File, onProgress: (percent: number) => void): Promise<string> {
  if (!(file.type in RESOURCE_CONTENT_TYPES)) {
    throw new UploadError("Ce type de fichier n'est pas accepté (PDF, Office, ZIP, texte, CSV, JSON, PNG, JPEG).");
  }
  if (file.size > RESOURCE_MAX_BYTES) throw new UploadError("Le fichier dépasse 50 Mo.");
  return presignedUpload(
    "/api/upload/file",
    { purpose: "resource", filename: file.name, contentType: file.type, size: file.size },
    file,
    file.type,
    onProgress,
  );
}

/** Captions of a lesson video. Browsers often give .vtt files no type: the extension decides. */
export async function uploadCaptionsFile(file: File, onProgress: (percent: number) => void): Promise<string> {
  if (!/\.vtt$/i.test(file.name)) throw new UploadError("Les sous-titres doivent être un fichier WebVTT (.vtt).");
  if (file.size > CAPTIONS_MAX_BYTES) throw new UploadError("Le fichier de sous-titres dépasse 2 Mo.");
  return presignedUpload(
    "/api/upload/file",
    { purpose: "captions", filename: file.name, contentType: CAPTIONS_CONTENT_TYPE, size: file.size },
    file,
    CAPTIONS_CONTENT_TYPE,
    onProgress,
  );
}

/** A lesson video. */
export async function uploadVideoFile(file: File, onProgress: (percent: number) => void, signal?: AbortSignal): Promise<string> {
  if (!(file.type in VIDEO_CONTENT_TYPES)) throw new UploadError(`Format non pris en charge. Utilisez ${VIDEO_FORMATS_LABEL}.`);
  if (file.size > VIDEO_MAX_BYTES) throw new UploadError("La vidéo dépasse 500 Mo.");
  return presignedUpload(
    "/api/upload/video",
    { filename: file.name, contentType: file.type, size: file.size },
    file,
    file.type,
    onProgress,
    signal,
  );
}

/** An image (cover, lesson illustration), stored by the image service. */
export async function uploadImageFile(file: File, options: { folder: string; prefix: string }): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", options.folder);
  body.append("prefix", options.prefix);
  let response: Response;
  try {
    response = await fetch("/api/upload/image", { method: "POST", body });
  } catch {
    throw new UploadError("Connexion perdue. Réessayez.");
  }
  const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
  if (!response.ok || !result.url) {
    throw new UploadError(result.error ?? "L'envoi de l'image a échoué. Réessayez.", result.code === "STORAGE_UNAVAILABLE" || response.status === 503);
  }
  return result.url;
}

/** An http(s) address, as typed by the author. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
