/**
 * Centralized SEO Configuration
 * Single source of truth for all section metadata, OG images, and JSON-LD schemas
 *
 * Usage: Import section configs in layout.tsx files and pass to generateRouteMetadata()
 */
export { COMMON_KEYWORDS } from "./seo/common";
export type { SectionSEOConfig } from "./seo/common";
export { sectionSEO } from "./seo/sections";
export {
  getBlogJsonLd,
  getBreadcrumbJsonLd,
  getContactJsonLd,
  getCourseListJsonLd,
  getOrganizationJsonLd,
  getPersonJsonLd,
  getWebSiteJsonLd,
} from "./seo/json-ld";
