/**
 * Same-origin addresses of a lesson's media. The browser is never given the stored address of paid media: each of
 * these routes checks the right to open the lesson, then redirects to a short-lived signed address.
 */

/** The WebVTT captions of a lesson's video. */
export const lessonCaptionsPath = (lessonId: string) => `/api/learn/captions/${lessonId}`;

/** A lesson's uploaded video. */
export const lessonMediaPath = (lessonId: string) => `/api/learn/media/${lessonId}`;

/** A file attached to a lesson, as a download. */
export const lessonResourcePath = (resourceId: string) => `/api/learn/resource/${resourceId}`;
