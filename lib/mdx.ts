import "server-only";

import fs from "fs/promises";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { join } from "path";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { BLOG_DIR, BlogPost, BlogPostMeta } from "./types";
import { calculateReadingTime } from "./utils";
import { components } from "@/components/mdx";
import { isValidBlogSlug } from "./blog-slug";

async function getFileLastModifiedDate(filePath: string): Promise<string> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime.toISOString();
  } catch (error) {
    console.error(`Error getting last modified date for ${filePath}:`, error);
    return new Date().toISOString();
  }
}

/**
 * Whether a post of this slug exists. The slug comes from a URL: anything that is not a plain slug is refused before
 * it touches the file system (`../` would otherwise read and COMPILE any .mdx file of the server).
 */
export async function blogPostExists(slug: string): Promise<boolean> {
  if (!isValidBlogSlug(slug)) return false;
  try {
    await fs.access(join(BLOG_DIR, `${slug}.mdx`));
    return true;
  } catch {
    return false;
  }
}

/** The post, or null when the slug is invalid, the post does not exist, or it is a draft in production. */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!isValidBlogSlug(slug)) return null;
  const filePath = join(BLOG_DIR, `${slug}.mdx`);
  let fileContent: string;
  try {
    fileContent = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  const { data, content } = matter(fileContent);
  if (data.draft && process.env.NODE_ENV === "production") return null;
  const lastModified = await getFileLastModifiedDate(filePath);

  const { content: mdxContent } = await compileMDX({
    source: content,
    components,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight, rehypeSlug],
      },
    },
  });

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    lastModified: data.lastModified ?? lastModified,
    author: data.author,
    categories: data.categories,
    content: mdxContent,
    readingTime: calculateReadingTime(content),
    coverImage: data.coverImage,
    draft: data.draft ?? false,
  };
}

export async function getBlogPostsMeta(): Promise<BlogPostMeta[]> {
  const files = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const filePath = join(BLOG_DIR, file);
        const fileContent = await fs.readFile(filePath, "utf8");
        const { data } = matter(fileContent);

        return {
          slug,
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          author: data.author,
          categories: data.categories || [],
          coverImage: data.coverImage,
          draft: data.draft,
          readingTime: calculateReadingTime(fileContent),
        };
      }),
  );

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (process.env.NODE_ENV === "production") {
    return sortedPosts.filter((post) => !post.draft);
  }

  return sortedPosts;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const filePath = join(BLOG_DIR, `${slug}.mdx`);
        const fileContent = await fs.readFile(filePath, "utf8");
        const { content } = matter(fileContent);
        const blogPost = await getBlogPost(slug);
        return blogPost ? { ...blogPost, readingTime: calculateReadingTime(content) } : null;
      }),
  );

  const sortedPosts = posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (process.env.NODE_ENV === "production") {
    return sortedPosts.filter((post) => !post.draft);
  }

  return sortedPosts;
}
