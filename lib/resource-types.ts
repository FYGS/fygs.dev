/** Documents an instructor can attach to a lesson. Executables and web pages are deliberately absent. */
export const RESOURCE_CONTENT_TYPES = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "text/plain": "txt",
  "text/markdown": "md",
  "text/csv": "csv",
  "application/json": "json",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/png": "png",
  "image/jpeg": "jpg",
} as const;

export const RESOURCE_MAX_BYTES = 50 * 1024 * 1024;

/** Value for an <input accept>. */
export const RESOURCE_ACCEPT = Object.keys(RESOURCE_CONTENT_TYPES).join(",");

/** "850 Ko", "2,4 Mo"; empty when the size is unknown. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** Captions of a lesson video: WebVTT only (what the <track> element reads). */
export const CAPTIONS_CONTENT_TYPE = "text/vtt";
export const CAPTIONS_MAX_BYTES = 2 * 1024 * 1024;
export const CAPTIONS_ACCEPT = ".vtt,text/vtt";

/** Lesson videos uploaded to the storage. */
export const VIDEO_CONTENT_TYPES = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
} as const;
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const VIDEO_FORMATS_LABEL = "MP4, WebM, OGG ou MOV (QuickTime)";
