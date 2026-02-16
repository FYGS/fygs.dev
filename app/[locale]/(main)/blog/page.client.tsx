"use client";

import { Section } from "@/app/_components/Section";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostMeta } from "@/lib/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { Suspense, use } from "react";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { StatsProvider } from "@/providers/blog/stats-provider";
import { useIntlayer } from "next-intlayer";

interface BlogClientPageProps {
  postsPromise: Promise<BlogPostMeta[]>;
}

const POSTS_PER_PAGE = 6;

export default function BlogClientPage({ postsPromise }: BlogClientPageProps) {
  const posts = use(postsPromise);
  const { title, description, noResults, noResultsFor } =
    useIntlayer("blog-page");

  const [searchTerm] = useQueryState("q", { defaultValue: "" });
  const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [selectedCategory] = useQueryState("category", { defaultValue: "" });
  const [pageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(POSTS_PER_PAGE),
  );

  const searchParams = {
    q: searchTerm,
    page: currentPage,
    category: selectedCategory,
    size: pageSize,
  };

  const categories = Array.from(
    new Set(posts.flatMap((post) => post.categories)),
  ).sort();

  let filteredPosts = posts;

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.excerpt.toLowerCase().includes(lowerCaseSearchTerm),
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter((post) =>
      post.categories.includes(selectedCategory),
    );
  }

  const totalPosts = filteredPosts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPosts);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <StatsProvider>
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
            <CategoryFilter categories={categories} />
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
                <BlogPostCard post={post} />
              </Suspense>
            ))}
          </div>

          {filteredPosts.length > 0 && (
            <Pagination
              totalItems={totalPosts}
              pageSize={pageSize}
              baseUrl="/blog"
              searchParams={searchParams}
            />
          )}

          {filteredPosts.length === 0 && (
            <p className="text-center text-muted-foreground" role="alert">
              {noResults}
              {searchTerm ? ` ${noResultsFor} "${searchTerm}"` : ""}
            </p>
          )}
        </div>
      </Section>
    </StatsProvider>
  );
}
