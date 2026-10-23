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
