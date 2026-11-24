/** The route without a trailing slash, locale or query. */
export function normalizeRoute(path: string): string {
  const withoutLocale = path.replace(/^\/(fr|en|es)(?=\/|$)/, "");
  const clean = withoutLocale.split(/[?#]/)[0].replace(/\/+$/, "");
  return clean || "/";
}

