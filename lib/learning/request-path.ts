/**
 * The proxy copies the path of a /learn request (without the locale, with the query) into this header, so that a
 * page of the learning area that must send the visitor elsewhere (sign-in, course page) can bring them back to the
 * exact step they asked for. Only an address of the same course is ever used from it.
 */
export const LEARN_PATH_HEADER = "x-learn-path";

const LEARN_PATH = /^\/learn\/[^/?#]+/;

/** `/fr/learn/react/lessons/intro?x=1` -> `/learn/react/lessons/intro?x=1`; null for any other path. */
export function learnPathOf(pathnameWithLocale: string, search: string): string | null {
  const withoutLocale = pathnameWithLocale.replace(/^\/[a-z]{2}(?=\/)/, "");
  return LEARN_PATH.test(withoutLocale) ? withoutLocale + search : null;
}

/** The requested step if it belongs to the course `slug`, else the course home of the learning area. */
export function returnPathFor(slug: string, requested: string | null | undefined): string {
  const home = `/learn/${slug}`;
  if (!requested) return home;
  return requested === home || requested.startsWith(`${home}/`) || requested.startsWith(`${home}?`) ? requested : home;
}
