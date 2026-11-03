/** A blog slug names a file under content/blog: lowercase letters, digits and dashes, nothing that can leave that folder. */
export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_BLOG_SLUG_LENGTH = 120;

export function isValidBlogSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_BLOG_SLUG_LENGTH && BLOG_SLUG_PATTERN.test(value);
}
