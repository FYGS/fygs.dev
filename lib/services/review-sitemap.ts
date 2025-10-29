import { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * Generate sitemap entries for review pages
 */
export async function generateReviewSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";

  try {
    // Get all courses with published reviews
    const coursesWithReviews = await db.course.findMany({
      where: {
        published: true,
        reviews: {
          some: {
            status: "APPROVED",
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        reviews: {
          where: {
            status: "APPROVED",
          },
          select: {
            id: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    const sitemapEntries: MetadataRoute.Sitemap = [];

    for (const course of coursesWithReviews) {
      // Add course reviews overview page
      sitemapEntries.push({
        url: `${baseUrl}/courses/${course.slug}/reviews`,
        lastModified: course.reviews[0]?.updatedAt || course.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });

      // Add individual review pages (limit to most recent 50 per course)
      const recentReviews = course.reviews.slice(0, 50);
      for (const review of recentReviews) {
        sitemapEntries.push({
          url: `${baseUrl}/courses/${course.slug}/reviews/${review.id}`,
          lastModified: review.updatedAt,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }

    // Add general reviews pages
    sitemapEntries.push({
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });

    sitemapEntries.push({
      url: `${baseUrl}/reviews/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.6,
    });

    return sitemapEntries;
  } catch (error) {
    console.error("Error generating review sitemap:", error);
    return [];
  }
}

/**
 * Generate robot.txt rules for review pages
 */
export function generateReviewRobotRules(): string {
  return `
# Review pages
Allow: /courses/*/reviews
Allow: /courses/*/reviews/*
Allow: /reviews
Allow: /reviews/trending

# Disallow review moderation and admin pages
Disallow: /admin/reviews
Disallow: /courses/*/reviews/moderate
Disallow: /api/reviews/moderate
Disallow: /api/reviews/*/moderate
`;
}

/**
 * Get review URLs for XML sitemap generation
 */
export async function getReviewUrls(): Promise<
  Array<{
    url: string;
    lastModified: Date;
    priority: number;
    changeFrequency: "yearly" | "monthly" | "weekly" | "daily" | "hourly";
  }>
> {
  const sitemap = await generateReviewSitemap();
  return sitemap.map((entry) => ({
    url: entry.url,
    lastModified: new Date(entry.lastModified || new Date()),
    priority: entry.priority || 0.5,
    changeFrequency:
      entry.changeFrequency === "always" || entry.changeFrequency === "never"
        ? "monthly"
        : (entry.changeFrequency as
            | "yearly"
            | "monthly"
            | "weekly"
            | "daily"
            | "hourly"),
  }));
}

/**
 * Generate meta robots directives for review pages
 */
export function getReviewMetaRobots(path: string): string {
  // Index all public review pages
  if (path.match(/^\/courses\/[^\/]+\/reviews\/?$/)) {
    return "index, follow, max-image-preview:large";
  }

  if (path.match(/^\/courses\/[^\/]+\/reviews\/[^\/]+\/?$/)) {
    return "index, follow, max-snippet:160, max-image-preview:large";
  }

  if (path === "/reviews" || path === "/reviews/trending") {
    return "index, follow, max-image-preview:large";
  }

  // Noindex moderation and admin pages
  if (path.includes("/moderate") || path.includes("/admin")) {
    return "noindex, nofollow";
  }

  return "index, follow";
}

/**
 * Generate canonical URLs for review pages
 */
export function getReviewCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";

  // Remove trailing slashes and query parameters for canonical URLs
  const cleanPath = path.replace(/\/$/, "").split("?")[0];

  return `${baseUrl}${cleanPath}`;
}
