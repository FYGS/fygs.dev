/** Weak ETag over what the dashboard grid shows, so an unchanged poll answers 304. */
export function progressEtag(
  summaries: { courseId: string; percent: number; hasCertificate: boolean }[],
): string {
  const source = JSON.stringify(summaries.map((s) => [s.courseId, s.percent, s.hasCertificate]));
  // FNV-1a, enough for change detection
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return 'W/"' + hash.toString(16) + '"';
}
