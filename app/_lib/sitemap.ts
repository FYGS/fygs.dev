import { getBlogPostsMeta } from "@/lib/mdx";
import { getMultilingualUrls } from "intlayer";
import type { MetadataRoute } from "next";

const SITE_URL = "https://fygs.dev";

/**
 * Generate sitemap with i18n support
 */
export async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPostsMeta();

  // Base routes with multilingual URLs
  const baseRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/me", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/projects", priority: 0.8, changeFrequency: "weekly" as const },
    {
      path: "/formations",
      priority: 0.9,
      changeFrequency: "daily" as const,
    },
    { path: "/pricing", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/community", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/reviews", priority: 0.7, changeFrequency: "weekly" as const },
    {
      path: "/tech-mastry",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
  ];

  const sitemapRoutes: MetadataRoute.Sitemap = baseRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        ...getMultilingualUrls(route.path),
        "x-default": route.path,
      },
    },
  }));

  // Add blog posts with multilingual support
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        ...getMultilingualUrls(`/blog/${post.slug}`),
        "x-default": `/blog/${post.slug}`,
      },
    },
  }));

  return [...sitemapRoutes, ...blogRoutes];
}
