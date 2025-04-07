import { Section } from "@/app/_components/Section";
import { SITE_URL } from "@/app/_lib/constants";
import {
  generateArticleJsonLd,
  generateJsonLdScript,
} from "@/app/_lib/jsonld-utils";
import { generateArticleMetadata } from "@/app/_lib/seo-utils";
import { ArticleStats } from "@/app/blog/components/article-stats";
import { ReadingProgress } from "@/app/blog/components/reading-progress";
import { SimilarArticles } from "@/app/blog/components/similar-articles";
import { SocialInteractions } from "@/app/blog/components/social-interactions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllBlogPosts, getBlogPost } from "@/lib/mdx";
import {
  getLikeCount,
  getShareCount,
  getViewCount,
  incrementViewCount,
} from "@/lib/reading-stats";
import { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoverImage } from "../components/cover-image";
import { PopularArticles } from "../components/popular-articles";

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

export const revalidate = 3600; // Revalidate every hour

// Skeleton component for article content
function ArticleSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      <Skeleton className="h-[400px] w-full" /> {/* Cover image */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" /> {/* Category badge */}
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-12 w-3/4" /> {/* Title */}
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" /> {/* Date */}
          <Skeleton className="h-5 w-24" /> {/* Reading time */}
        </div>
      </div>
      <div className="space-y-4">
        {" "}
        {/* Content */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

interface StatsContainerProps {
  slug: string;
  readingTime: string;
  initialStats: {
    views: number;
    likes: number;
    shares: number;
  };
  className?: string;
}

// Create a new wrapper component for responsive stats
async function ArticleStatsWrapper({
  slug,
  readingTime,
  initialStats,
  className,
}: {
  slug: string;
  readingTime: string;
  initialStats: {
    views: number;
    likes: number;
    shares: number;
  };
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <ArticleStats
        readingTime={readingTime}
        views={initialStats.views}
        likes={initialStats.likes}
        shares={initialStats.shares}
      />
      <SocialInteractions
        slug={slug}
        initialLikes={initialStats.likes}
        shareCount={initialStats.shares}
      />
    </div>
  );
}

// Async component for related content
async function RelatedContent({ currentPost }: { currentPost: BlogPost }) {
  const allPosts = await getAllBlogPosts();

  return (
    <div className="mt-16 max-w-4xl mx-auto space-y-16">
      <SimilarArticles
        currentPost={currentPost}
        allPosts={allPosts}
        maxArticles={3}
      />
      <PopularArticles currentPost={currentPost} maxArticles={3} />
    </div>
  );
}

// Rename from ArticleStats to StatsContainer
async function StatsContainer({
  slug,
  readingTime,
  initialStats,
  className,
}: StatsContainerProps) {
  return (
    <ArticleStatsWrapper
      slug={slug}
      readingTime={readingTime}
      initialStats={initialStats}
      className={className}
    />
  );
}

export default async function BlogPostPage({ params }: Props) {
  // Fetch post first for critical content
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Increment view count in the background
  incrementViewCount(slug).catch(console.error);

  // Fetch initial stats
  const [views, likes, shares] = await Promise.all([
    getViewCount(slug),
    getLikeCount(slug),
    getShareCount(slug),
  ]);

  const initialStats = { views, likes, shares };

  return (
    <>
      <ReadingProgress />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 max-w-4xl mx-auto">
          <article className="prose prose-invert space-y-8">
            <Suspense fallback={<ArticleSkeleton />}>
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

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                    {post.title}
                  </h1>

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

                <div className="mdx-content prose-code:text-primary prose-headings:tracking-tight prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:md:text-4xl prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:md:text-3xl prose-h3:text-lg prose-h3:sm:text-xl prose-h3:md:text-2xl">
                  {post.content}
                </div>

                <footer className="mt-16 pt-8 border-t border-muted md:hidden">
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Did you find this article helpful?
                    </h3>
                    <Suspense
                      fallback={
                        <Skeleton className="h-[60px] w-full max-w-[300px]" />
                      }
                    >
                      <StatsContainer
                        slug={slug}
                        readingTime={post.readingTime}
                        initialStats={initialStats}
                        className="w-full max-w-md mx-auto"
                      />
                    </Suspense>
                  </div>
                </footer>
              </div>
            </Suspense>
          </article>

          {/* Desktop Stats */}
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[150px] w-full" />
              </div>
            }
          >
            <div className="hidden md:block">
              <StatsContainer
                slug={slug}
                readingTime={post.readingTime}
                initialStats={initialStats}
                className="sticky top-24"
              />
            </div>
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="mt-16 space-y-8">
              <Skeleton className="h-[400px] w-full" />
            </div>
          }
        >
          <RelatedContent currentPost={post} />
        </Suspense>
      </Section>
    </>
  );
}
