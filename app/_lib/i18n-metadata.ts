/**
 * Internationalized Metadata Utilities
 * Provides helpers to generate SEO metadata with i18n support
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

/**
 * Generate metadata with i18n support
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
    typeof kw === "string" ? kw : t(kw as IConfigLocales<string>)
  );

  // Image URL
  const imageUrl = image?.startsWith("http")
    ? image
    : image
      ? `${SITE_URL}${image}`
      : `${SITE_URL}/images/og-image.png`;

  const metadata: Metadata = {
    title: localizedTitle,
    description: localizedDescription,
    keywords: localizedKeywords,
    manifest: `/manifest.webmanifest`,
    icons: {
      icon: [
        { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
      languages: { ...multilingualUrls, "x-default": path || "/" },
    },
    openGraph: {
      type,
      locale: locale,
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
  modifiedTime?: string
) {
  return {
    locale,
    path,
    type: "article" as const,
    publishedTime,
    modifiedTime,
  };
}
