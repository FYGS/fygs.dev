/**
 * Metadata helpers for (main) routes
 * Provides consistent metadata generation with i18n support
 *
 * All section-specific configs live in @/app/_lib/seo-config.ts
 * This module is the bridge between section configs and the i18n metadata generator.
 */

import { generateI18nMetadata } from "@/app/_lib/i18n-metadata";
import type { SectionSEOConfig } from "@/app/_lib/seo-config";
import { Locales, type LocalesValues } from "intlayer";

export type { SectionSEOConfig };

/**
 * Generate metadata for a route with locale from params
 * Accepts either a raw config or a pre-built SectionSEOConfig from seo-config.ts
 */
export async function generateRouteMetadata(
  params: Promise<{ locale?: string }>,
  config: SectionSEOConfig,
) {
  const { locale } = await params;
  return generateI18nMetadata({
    ...config,
    locale: locale as LocalesValues,
  });
}
