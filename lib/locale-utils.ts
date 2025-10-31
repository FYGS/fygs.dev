/**
 * Locale Utilities
 * Helper functions for working with locales throughout the application
 */

export const AVAILABLE_LOCALES = ["fr", "en", "es"] as const;
export const DEFAULT_LOCALE = "fr";
export type Locale = (typeof AVAILABLE_LOCALES)[number];

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return AVAILABLE_LOCALES.includes(locale as Locale);
}

/**
 * Get locale from pathname
 * Example: /fr/dashboard -> fr
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  return null;
}

/**
 * Add locale prefix to path
 * Example: addLocaleToPath('/dashboard', 'fr') -> '/fr/dashboard'
 */
export function addLocaleToPath(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Don't add locale if already present
  if (getLocaleFromPathname(cleanPath) !== null) {
    return cleanPath;
  }

  return `/${locale}${cleanPath}`;
}

/**
 * Remove locale prefix from path
 * Example: removeLocaleFromPath('/fr/dashboard') -> '/dashboard'
 */
export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, "") || "/";
  }
  return pathname;
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    fr: "Français",
    en: "English",
    es: "Español",
  };

  return displayNames[locale];
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    fr: "🇫🇷",
    en: "🇬🇧",
    es: "🇪🇸",
  };

  return flags[locale];
}
