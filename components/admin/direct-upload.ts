import { RESOURCE_CONTENT_TYPES, RESOURCE_MAX_BYTES } from "@/lib/resource-types";

/** PUTs a file to a presigned URL, reporting progress (0-100). */
export function putWithProgress(file: File, url: string, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    });
    xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Envoi refusé (${xhr.status}).`))));
    xhr.addEventListener("error", () => reject(new Error("Connexion perdue pendant l'envoi.")));
    xhr.addEventListener("abort", () => reject(new Error("Envoi annulé.")));
    xhr.send(file);
  });
}

/** Uploads a lesson attachment and returns its public address. Throws an Error with a message fit to show. */
export async function uploadResourceFile(file: File, onProgress: (percent: number) => void): Promise<string> {
  if (!(file.type in RESOURCE_CONTENT_TYPES)) {
    throw new Error("Ce type de fichier n'est pas accepté (PDF, Office, ZIP, texte, CSV, JSON, PNG, JPEG).");
  }
  if (file.size > RESOURCE_MAX_BYTES) throw new Error("Le fichier dépasse 50 Mo.");

  const response = await fetch("/api/upload/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  const body = (await response.json().catch(() => ({}))) as { uploadUrl?: string; publicUrl?: string; error?: string };
  if (!response.ok || !body.uploadUrl || !body.publicUrl) throw new Error(body.error ?? "Impossible de préparer l'envoi.");
  await putWithProgress(file, body.uploadUrl, onProgress);
  return body.publicUrl;
}
