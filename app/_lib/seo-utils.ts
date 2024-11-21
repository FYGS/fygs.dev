import { Metadata } from "next";
import { defaultMetadata } from "./metadata";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "profile";
  path?: string;
  noIndex?: boolean;
  metadataBase?: URL;
}

interface GenerateArticleMetadataProps extends GenerateMetadataProps {
  publishedTime?: string;
  modifiedTime?: string;
  authors?: { name: string; url: string }[];
  tags?: string[];
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  type = "website",
  path = "",
  noIndex = false,
  metadataBase,
}: GenerateMetadataProps): Metadata {
  const base = metadataBase ?? defaultMetadata.metadataBase;
  const url = path;
  const imageUrl = image?.startsWith("http") ? image : image;
  const defaultTitle = (defaultMetadata.title as { default: string })?.default;
  const defaultDescription = defaultMetadata.description as string;

  return {
    ...defaultMetadata,
    ...(base && { base }),
    title: title,
    description: description,
    keywords: [...(defaultMetadata.keywords as string[]), ...keywords],
    robots: noIndex ? { index: false, follow: false } : defaultMetadata.robots,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...(defaultMetadata.openGraph as object),
      title: title ?? defaultTitle,
      description: description ?? defaultDescription,
      url,
      type,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title ?? defaultTitle,
            },
          ]
        : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...(defaultMetadata.twitter as object),
      title: title ?? defaultTitle,
      description: description ?? defaultDescription,
      card: "summary_large_image",
      images: imageUrl ? [imageUrl] : defaultMetadata.twitter?.images,
    },
  };
}

export function generateArticleMetadata({
  title,
  description,
  image,
  path,
  publishedTime,
  modifiedTime,
  authors = [],
  tags = [],
  keywords = [],
  noIndex = false,
  metadataBase,
}: GenerateArticleMetadataProps): Metadata {
  const baseMetadata = generateMetadata({
    title,
    description,
    image,
    type: "article",
    path,
    keywords,
    noIndex,
    metadataBase,
  });

  const defaultTitle = (defaultMetadata.title as { default: string })?.default;
  const defaultDescription = defaultMetadata.description as string;

  return {
    ...baseMetadata,
    authors: authors.map((author) => ({ name: author.name, url: author.url })),
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      authors: authors.map((author) => author.name),
      tags,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: title ?? defaultTitle,
      description: description ?? defaultDescription,
      card: "summary_large_image",
      images: image ? [image] : undefined,
    },
  };
}
