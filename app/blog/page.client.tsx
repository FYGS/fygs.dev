"use client";

import { Section } from "@/app/_components/Section";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { BlogPostMeta } from "@/lib/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { BlogPostCard } from "./components/blog-post-card";
import { CategoryFilter } from "./components/category-filter";

interface BlogClientPageProps {
  posts: BlogPostMeta[];
  initialStats: Array<{
    slug: string;
    views: number;
    likes: number;
    shares: number;
  }>;
}

const POSTS_PER_PAGE = 6;

export default function BlogClientPage({
  posts,
  initialStats,
}: BlogClientPageProps) {
  // Fetch blog posts metadata
  const [searchTerm] = useQueryState("q", { defaultValue: "" });
  const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [selectedCategory] = useQueryState("category", { defaultValue: "" });
  const [pageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(POSTS_PER_PAGE)
  );

  const searchParams = {
    q: searchTerm,
    page: currentPage,
    category: selectedCategory,
    size: pageSize,
  };

  // Get all unique categories
  const categories = Array.from(
    new Set(posts.flatMap((post) => post.categories))
  ).sort();

  // Filter posts
  let filteredPosts = posts;

  if (searchTerm) {
    filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter((post) =>
      post.categories.includes(selectedCategory)
    );
  }

  // Pagination
  const totalPosts = filteredPosts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPosts);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Use initialStats for visible posts
  const paginatedStats = initialStats.filter((stat) =>
    paginatedPosts.some((post) => post.slug === stat.slug)
  );

  return (
    <Section>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold" id="blog-title">
            Technical Blog
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Expert software engineering articles covering modern web
            development, cloud architecture, and best practices. Written by a
            seasoned Full-Stack Developer with real-world experience.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Search />
          <CategoryFilter categories={categories} />
        </div>

        <div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          role="feed"
          aria-busy={false}
        >
          {paginatedPosts.map((post) => {
            const postStats = paginatedStats.find((s) => s.slug === post.slug);
            return (
              <BlogPostCard
                key={post.slug}
                post={post}
                initialStats={postStats}
              />
            );
          })}
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
            No blog posts found {searchTerm && `for "${searchTerm}"`}
          </p>
        )}
      </div>
    </Section>
  );
}
