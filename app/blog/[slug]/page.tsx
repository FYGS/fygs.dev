"use server";

import { Section } from "@/app/_components/Section";
import { SITE_URL } from "@/app/_lib/constants";
import {
  generateArticleJsonLd,
  generateJsonLdScript,
} from "@/app/_lib/jsonld-utils";
import { generateArticleMetadata } from "@/app/_lib/seo-utils";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { SimilarArticles } from "@/components/blog/similar-articles";
import { TableOfContents } from "@/components/mdx/toc";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllBlogPosts, getBlogPost } from "@/lib/mdx";
import { Calendar, Clock } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoverImage } from "@/components/blog/cover-image";
import { PopularArticles } from "@/components/blog/popular-articles";
import { PostStatsView } from "@/components/blog/post-stats-view";
import { handleView } from "../actions/social-interactions";
import { getPostStats } from "../actions/stats";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  const baseUrl = SITE_URL;
  const articleUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = post.coverImage.startsWith("http")
    ? post.coverImage
    : `${baseUrl}${post.coverImage}`;

  const metadata = generateArticleMetadata({
    title: post.title,
    description: post.excerpt,
    image: imageUrl,
    path: `/blog/${slug}`,
    publishedTime: post.date,
    modifiedTime: post.lastModified,
    authors: [{ name: post.author, url: `${baseUrl}/resume` }],
    tags: post.categories,
    keywords: [
      ...post.categories,
      "Software Development",
      "Technical Article",
      "Programming Tutorial",
      ...post.title.toLowerCase().split(" "),
    ],
  });

  // Generate JSON-LD
  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    authorName: post.author,
    authorUrl: `${baseUrl}/resume`,
    publishedTime: post.date,
    modifiedTime: post.lastModified,
    image: imageUrl,
    url: articleUrl,
    tags: post.categories,
  });

  return {
    ...metadata,
    alternates: {
      canonical: articleUrl,
    },
    other: {
      "json-ld": generateJsonLdScript(jsonLd),
    },
  };
}

// export const revalidate = 3600; // Revalidate every hour

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Fetch stats and increment view count server-side
  const [stats] = await Promise.all([getPostStats(slug), handleView(slug)]);

  // Ensure unique posts across sections
  const allPosts = await getAllBlogPosts();
  const uniquePosts = allPosts.filter((p) => p.slug !== post.slug);

  return (
    <>
      <ReadingProgress />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-8 max-w-7xl mx-auto">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block">
            <TableOfContents className="sticky top-24" />
          </div>

          {/* Main Content */}
          <article className="prose prose-invert max-w-4xl space-y-8">
            <div>
              {/* Article Content */}
              <div className="w-full -mx-4 px-4 sm:px-0 sm:-mx-0">
                <CoverImage
                  src={post.coverImage}
                  alt={post.title}
                  priority
                  className="w-full"
                  sizes="(min-width: 1280px) 1200px, (min-width: 780px) 80vw, 95vw"
                />
              </div>

              <header className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {post.readingTime}
                  </div>
                </div>
              </header>

              <div className="mdx-content">{post.content}</div>

              {/* Mobile Stats */}
              <footer className="mt-16 pt-8 border-t border-muted md:hidden">
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Did you find this article helpful?
                  </h3>
                  <PostStatsView
                    slug={slug}
                    readingTime={post.readingTime}
                    className="w-full max-w-md mx-auto"
                    initialStats={stats}
                  />
                </div>
              </footer>
            </div>
          </article>

          {/* Desktop Stats */}
          <div className="hidden lg:block">
            <PostStatsView
              slug={slug}
              readingTime={post.readingTime}
              className="sticky top-24"
              initialStats={stats}
            />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="mt-16 space-y-8">
              <Skeleton className="h-[400px] w-full" />
            </div>
          }
        >
          <div className="mt-16 max-w-4xl mx-auto space-y-16">
            {/* Pass filtered posts to prevent duplicates */}
            <SimilarArticles
              currentPost={post}
              allPosts={uniquePosts}
              maxArticles={3}
            />
            <PopularArticles
              currentPost={post}
              maxArticles={3}
              excludeSlugs={uniquePosts.slice(0, 3).map((p) => p.slug)} // Exclude already shown posts
            />
          </div>
        </Suspense>
      </Section>
    </>
  );
}
