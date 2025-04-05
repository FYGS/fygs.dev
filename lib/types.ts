import { join } from "path";
import { ReactNode } from "react";

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

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  categories: string[];
  coverImage: string;
  draft?: boolean;
  readingTime: string;
}

export const BLOG_DIR = join(process.cwd(), "content/blog");
