"use server";

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

async function getFileLastModifiedDate(filePath: string): Promise<string> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime.toISOString();
  } catch (error) {
    console.error(`Error getting last modified date for ${filePath}:`, error);
    return new Date().toISOString();
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = join(BLOG_DIR, `${slug}.mdx`);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(fileContent);
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
        return {
          ...blogPost,
          readingTime: calculateReadingTime(content),
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
