import fs from "fs/promises";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { join } from "path";
import { ReactNode } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  lastModified: string;
  excerpt: string;
  author: string;
  categories: string[];
  content: ReactNode;
  readingTime: string;
  coverImage: string;
  draft?: boolean;
}

const BLOG_DIR = join(process.cwd(), "content/blog");

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

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        return getBlogPost(slug);
      })
  );

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // En production, on filtre les drafts
  if (process.env.NODE_ENV === "production") {
    return sortedPosts.filter((post) => !post.draft);
  }

  return sortedPosts;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
