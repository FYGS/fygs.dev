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
  excerpt: string;
  author: string;
  categories: string[];
  content: ReactNode;
  readingTime: string;
  coverImage: string;
}

const BLOG_DIR = join(process.cwd(), "content/blog");

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = join(BLOG_DIR, `${slug}.mdx`);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(fileContent);

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
    author: data.author,
    categories: data.categories,
    content: mdxContent,
    readingTime: calculateReadingTime(content),
    coverImage: data.coverImage,
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

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
