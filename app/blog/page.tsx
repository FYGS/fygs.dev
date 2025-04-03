import { Section } from "@/app/_components/Section";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { getBlogPostsMeta } from "@/lib/mdx";
import { generateMetadata } from "../_lib/seo-utils";
import { BlogPostCard } from "./components/blog-post-card";
import { CategoryFilter } from "./components/category-filter";

const POSTS_PER_PAGE = 6;

interface Props {
  searchParams: {
    q?: string;
    page?: string;
    category?: string;
    size?: string;
  };
}

export const metadata = generateMetadata({
  title: "Technical Blog - Software Engineering Insights & Best Practices",
  description:
    "Explore in-depth articles on software engineering, web development, cloud architecture, and best practices. Learn about React, TypeScript, Node.js, and modern development techniques.",
  keywords: [
    "Software Engineering Blog",
    "Web Development Articles",
    "Technical Tutorials",
    "Programming Best Practices",
    "React Development",
    "TypeScript Guides",
    "Cloud Architecture",
    "Full-Stack Development",
  ],
  path: "/blog",
  type: "website",
  image: "/api/og/blog",
});

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage({ searchParams }: Props) {
  const posts = await getBlogPostsMeta();
  const searchTerm = searchParams.q?.toLowerCase() || "";
  const currentPage = Number(searchParams.page) || 1;
  const selectedCategory = searchParams.category;
  const pageSize = Number(searchParams.size) || POSTS_PER_PAGE;

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
          {paginatedPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
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
            No blog posts found {searchTerm && `for "${searchTerm}"`}
          </p>
        )}
      </div>
    </Section>
  );
}
