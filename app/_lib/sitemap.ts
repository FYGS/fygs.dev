import { getAllBlogPosts } from "@/lib/mdx";

type Route = {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

export async function generateSitemap(): Promise<Route[]> {
  const blogPosts = await getAllBlogPosts();

  // Base routes
  const routes: Route[] = [
    {
      url: "https://fygs-dev.vercel.app",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://fygs-dev.vercel.app/about",
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://fygs-dev.vercel.app/blog",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://fygs-dev.vercel.app/projects",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://fygs-dev.vercel.app/contact",
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Add blog posts
  const blogRoutes = blogPosts.map((post) => ({
    url: `https://fygs-dev.vercel.app/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Add tag pages if they exist
  const tagRoutes = [
    {
      url: "https://fygs-dev.vercel.app/blog/tags",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }
  ];

  return [...routes, ...blogRoutes, ...tagRoutes];
}
