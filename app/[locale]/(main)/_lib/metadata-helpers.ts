/**
 * Metadata helpers for (main) routes
 * Provides consistent metadata generation with i18n support
 */

import {
  generateI18nMetadata,
  I18nMetadataProps,
} from "@/app/_lib/i18n-metadata";
import type { LocalesValues } from "intlayer";

type MetadataConfig = Omit<I18nMetadataProps, "locale">;

/**
 * Generate metadata for a route with locale from params
 */
export async function generateRouteMetadata(
  params: Promise<{ locale: string }>,
  config: MetadataConfig
) {
  const { locale } = await params;
  return generateI18nMetadata({
    ...config,
    locale: locale as LocalesValues,
  });
}

/**
 * Common keywords for all pages
 */
export const commonKeywords = [
  "FYGS",
  "Fernand SOUALO",
  "Software Engineer",
  "Full-Stack Developer",
  "TypeScript",
  "Node.js",
  "Next.js",
  "React",
];
