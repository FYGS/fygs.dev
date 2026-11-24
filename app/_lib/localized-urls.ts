import { getMultilingualUrls } from "intlayer";
import { isTranslatedPath } from "@/lib/locale-utils";

/**
 * The URL of a page in each language it exists in. A page of the application area is French only: /en/dashboard redirects
 * to /fr/dashboard, so announcing it as an English alternate (hreflang, sitemap) would point search engines at a redirect.
 */
export function localizedUrls(path: string): Record<string, string> {
  const urls = getMultilingualUrls(path || "/") as Record<string, string>;
  if (isTranslatedPath(path || "/")) return urls;
  return Object.fromEntries(Object.entries(urls).filter(([, url]) => !/^\/(en|es)(\/|$)/.test(url)));
}
