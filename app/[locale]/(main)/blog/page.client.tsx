"use client";

import { Section } from "@/app/_components/Section";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostMeta } from "@/lib/types";
import { PostStats } from "@/types/blog";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense, use, useMemo } from "react";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { SortFilter } from "@/components/blog/sort-filter";
import { useIntlayer } from "next-intlayer";

interface BlogClientPageProps {
  postsPromise: Promise<BlogPostMeta[]>;
  statsPromise: Promise<Record<string, PostStats>>;
}

const POSTS_PER_PAGE = 6;

const SORT_OPTIONS = ["recent", "oldest", "reading-time", "popular"] as const;

export default function BlogClientPage({
  postsPromise,
  statsPromise,
}: BlogClientPageProps) {
  const posts = use(postsPromise);
  const statsMap = use(statsPromise);
  const { title, description, noResults, noResultsFor } =
    useIntlayer("blog-page");

  const [searchTerm] = useQueryState("q", { defaultValue: "" });
  const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [selectedCategory] = useQueryState("category", { defaultValue: "" });
  const [sortBy] = useQueryState(
    "sort",
    parseAsStringLiteral(SORT_OPTIONS).withDefault("recent"),
  );
  const [pageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(POSTS_PER_PAGE),
  );

  const searchParams = {
    q: searchTerm,
    page: currentPage,
    category: selectedCategory,
    sort: sortBy,
    size: pageSize,
  };

  const categories = Array.from(
    new Set(posts.flatMap((post) => post.categories)),
  ).sort();

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          post.excerpt.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    if (selectedCategory) {
      result = result.filter((post) =>
        post.categories.includes(selectedCategory),
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        break;
      case "reading-time":
        result.sort((a, b) => {
          const aMin = parseInt(a.readingTime) || 0;
          const bMin = parseInt(b.readingTime) || 0;
          return bMin - aMin;
        });
        break;
      case "popular":
        result.sort((a, b) => {
          const aViews = statsMap[a.slug]?.views ?? 0;
          const bViews = statsMap[b.slug]?.views ?? 0;
          return bViews - aViews;
        });
        break;
      case "recent":
      default:
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        break;
    }

    return result;
  }, [posts, searchTerm, selectedCategory, sortBy, statsMap]);

  const totalPosts = filteredAndSortedPosts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPosts);
  const paginatedPosts = filteredAndSortedPosts.slice(startIndex, endIndex);

  return (
    <Section>
      <div className="space-y-8">
        <div className="space-y-3">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient-heading"
            id="blog-title"
          >
            {title}
          </h1>
          <p className="text-muted-foreground/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Search />
          <div className="flex items-center gap-2">
            <SortFilter />
            <CategoryFilter categories={categories} />
          </div>
        </div>

        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="feed"
          aria-busy={false}
        >
          {paginatedPosts.map((post) => (
            <Suspense
              key={post.slug}
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              }
            >
              <BlogPostCard post={post} initialStats={statsMap[post.slug]} />
            </Suspense>
          ))}
        </div>

        {filteredAndSortedPosts.length > 0 && (
          <Pagination
            totalItems={totalPosts}
            pageSize={pageSize}
            baseUrl="/blog"
            searchParams={searchParams}
          />
        )}

        {filteredAndSortedPosts.length === 0 && (
          <p className="text-center text-muted-foreground" role="alert">
            {noResults}
            {searchTerm ? ` ${noResultsFor} "${searchTerm}"` : ""}
          </p>
        )}
      </div>
    </Section>
  );
}
