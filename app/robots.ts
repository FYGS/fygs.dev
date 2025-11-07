import type { MetadataRoute } from "next";
import { getMultilingualUrls } from "intlayer";

const SITE_URL = "https://fygs.dev";

/**
 * Get all multilingual URLs for given paths
 */
const getAllMultilingualUrls = (urls: string[]) =>
  urls.flatMap((url) => Object.values(getMultilingualUrls(url)) as string[]);

/**
 * Generate robots.txt with i18n support
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: getAllMultilingualUrls([
          "/admin",
          "/api",
          "/dashboard/billing",
          "/_next",
          "/images",
        ]),
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: getAllMultilingualUrls([
          "/admin",
          "/api",
          "/dashboard/billing",
        ]),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
