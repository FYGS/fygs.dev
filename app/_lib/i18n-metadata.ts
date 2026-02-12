/**
 * Internationalized Metadata Utilities
 * Provides helpers to generate SEO metadata with i18n support
 * Consolidated SEO system for FYGS Learning Platform
 */

import { Metadata } from "next";
import {
  getTranslation,
  type LocalesValues,
  getMultilingualUrls,
} from "intlayer";
import { SITE_URL } from "./constants";

type IConfigLocales<T> = Required<Record<"fr", T>> &
  Partial<Record<LocalesValues, T>>;

export interface I18nMetadataProps {
  locale: LocalesValues;
  title?: IConfigLocales<string>;
  description?: IConfigLocales<string>;
  keywords?: (IConfigLocales<string> | string)[];
  image?: string;
  type?: "website" | "article" | "profile";
  path?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: { name: string; url: string }[];
  tags?: string[];
}

/** Map locale code to OpenGraph locale format */
function toOgLocale(locale: string): string {
  const map: Record<string, string> = {
    fr: "fr_FR",
    en: "en_US",
    es: "es_ES",
  };
  return map[locale] || locale;
}

/**
 * Generate metadata with i18n support
 * This is the primary metadata generator for all pages
 */
export async function generateI18nMetadata({
  locale,
  title,
  description,
  keywords = [],
  image,
  type = "website",
  path = "",
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors = [],
  tags = [],
}: I18nMetadataProps): Promise<Metadata> {
  // Translation helper
  const t = <T>(content: IConfigLocales<T>) => getTranslation(content, locale);

  // Generate multilingual URLs
  const multilingualUrls = getMultilingualUrls(path || "/");
  const currentUrl =
    multilingualUrls[locale as keyof typeof multilingualUrls] || path;
  const fullUrl = `${SITE_URL}${currentUrl}`;

  // Translate title and description
  const localizedTitle = title ? t(title) : undefined;
  const localizedDescription = description ? t(description) : undefined;

  // Translate keywords
  const localizedKeywords = keywords.map((kw) =>
    typeof kw === "string" ? kw : t(kw as IConfigLocales<string>),
  );

  // Image URL
  const imageUrl = image?.startsWith("http")
    ? image
    : image
      ? `${SITE_URL}${image}`
      : `${SITE_URL}/images/og-image.png`;

  // Build alternates languages map with full URLs for proper hreflang
  const alternateLanguages: Record<string, string> = {};
  for (const [langKey, langPath] of Object.entries(multilingualUrls)) {
    alternateLanguages[langKey] = `${SITE_URL}${langPath}`;
  }

  const metadata: Metadata = {
    title: localizedTitle,
    description: localizedDescription,
    keywords: localizedKeywords,
    manifest: `/manifest.webmanifest`,
    icons: {
      icon: [
        { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/images/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [
        {
          url: "/images/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: fullUrl,
      languages: {
        ...alternateLanguages,
        "x-default": `${SITE_URL}${path || "/"}`,
      },
    },
    openGraph: {
      type,
      locale: toOgLocale(locale),
      alternateLocale: ["fr", "en", "es"]
        .filter((l) => l !== locale)
        .map(toOgLocale),
      url: fullUrl,
      siteName: "FYGS Learning Platform",
      title: localizedTitle,
      description: localizedDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: localizedTitle || "FYGS Learning Platform",
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: authors.map((a) => a.name),
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description: localizedDescription,
      images: [imageUrl],
      creator: "@fernand_soualo",
      site: "@fygs_dev",
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": "FYGS",
      "mobile-web-app-capable": "yes",
      "theme-color": "#29333d",
    },
  };

  if (authors.length > 0) {
    metadata.authors = authors;
  }

  return metadata;
}

/**
 * Quick helper for page metadata
 */
export function createPageMetadata(locale: LocalesValues, path: string) {
  return {
    locale,
    path,
    type: "website" as const,
  };
}

/**
 * Quick helper for article metadata
 */
export function createArticleMetadata(
  locale: LocalesValues,
  path: string,
  publishedTime?: string,
  modifiedTime?: string,
) {
  return {
    locale,
    path,
    type: "article" as const,
    publishedTime,
    modifiedTime,
  };
}
