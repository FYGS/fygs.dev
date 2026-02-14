"use server";

import { Section } from "@/app/_components/Section";
import { SITE_URL } from "@/app/_lib/constants";
import {
  generateArticleJsonLd,
  generateJsonLdScript,
} from "@/app/_lib/jsonld-utils";
import { CoverImage } from "@/components/blog/cover-image";
import { PopularArticles } from "@/components/blog/popular-articles";
import { PostStatsView } from "@/components/blog/post-stats-view";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { SimilarArticles } from "@/components/blog/similar-articles";
import { TableOfContents } from "@/components/mdx/toc";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPost, getBlogPostsMeta } from "@/lib/mdx";
import { Calendar, Clock } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { useIntlayer } from "next-intlayer/server";
import { getPostStats } from "../actions/stats";
import { ViewCounter } from "./_components/view-counter";

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPostsMeta();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  const baseUrl = SITE_URL;
  const articleUrl = `${baseUrl}/${locale}/blog/${slug}`;
  const imageUrl = post.coverImage.startsWith("http")
    ? post.coverImage
    : `${baseUrl}${post.coverImage}`;

  // Map locale to OpenGraph locale format
  const ogLocaleMap: Record<string, string> = {
    fr: "fr_FR",
    en: "en_US",
    es: "es_ES",
  };
  const ogLocale = ogLocaleMap[locale] || "fr_FR";
  const alternateLocales = Object.entries(ogLocaleMap)
    .filter(([key]) => key !== locale)
    .map(([, value]) => value);

  // Generate JSON-LD
  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    authorName: post.author,
    authorUrl: `${baseUrl}/me`,
    publishedTime: post.date,
    modifiedTime: post.lastModified,
    image: imageUrl,
    url: articleUrl,
    tags: post.categories,
  });

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...post.categories,
      "Software Development",
      "Technical Article",
      "Programming Tutorial",
    ],
    authors: [{ name: post.author, url: `${baseUrl}/me` }],
    alternates: {
      canonical: articleUrl,
      languages: {
        "fr-FR": `${baseUrl}/fr/blog/${slug}`,
        "en-US": `${baseUrl}/en/blog/${slug}`,
        "es-ES": `${baseUrl}/es/blog/${slug}`,
        "x-default": `${baseUrl}/blog/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      url: articleUrl,
      siteName: "FYGS Learning Platform",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.lastModified,
      authors: [post.author],
      tags: post.categories,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: "image/webp",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
      creator: "@fernand_soualo",
      site: "@fygs_dev",
    },
    other: {
      "json-ld": generateJsonLdScript(jsonLd),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Fetch stats - view count will be handled client-side
  const stats = await getPostStats(slug);

  // Use lightweight metadata instead of full MDX compilation for related articles
  const allPostsMeta = await getBlogPostsMeta();
  const uniquePosts = allPostsMeta.filter((p) => p.slug !== post.slug);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { helpful } = useIntlayer("blog-post", locale);

  return (
    <>
      <ViewCounter slug={slug} />
      <ReadingProgress />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block">
            <TableOfContents className="sticky top-24" />
          </div>

          {/* Main Content */}
          <article className="min-w-0 overflow-hidden">
            {/* Cover Image */}
            <div className="w-full -mx-4 px-4 sm:px-0 sm:-mx-0 mb-8">
              <CoverImage
                src={post.coverImage}
                alt={post.title}
                priority
                className="w-full rounded-xl shadow-2xl"
                sizes="(min-width: 1280px) 1200px, (min-width: 780px) 80vw, 95vw"
              />
            </div>

            {/* Article Header */}
            <header className="space-y-5 mb-10">
              {/* Categories */}
              <div className="flex flex-wrap gap-1.5">
                {post.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="text-[10px] font-medium bg-primary/8 text-primary/90 border-primary/15 hover:bg-primary/15 transition-colors px-2 py-0.5 tracking-wide"
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
                {post.title}
              </h1>

              {/* Meta info bar */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-muted-foreground/70 border-b border-border/30 pb-5">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="font-medium text-foreground/80 text-sm">
                    {post.author}
                  </span>
                </div>

                <span className="text-border/40">·</span>

                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {/* Reading time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div className="mdx-content">{post.content}</div>

            {/* Mobile Stats */}
            <footer className="mt-16 pt-8 border-t border-muted md:hidden">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-medium text-muted-foreground">
                  {helpful}
                </h3>
                <PostStatsView
                  slug={slug}
                  readingTime={post.readingTime}
                  className="w-full max-w-md mx-auto"
                  initialStats={stats}
                />
              </div>
            </footer>
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
              currentSlug={post.slug}
              maxArticles={3}
              excludeSlugs={uniquePosts.slice(0, 3).map((p) => p.slug)}
              locale={locale}
            />
          </div>
        </Suspense>
      </Section>
    </>
  );
}
