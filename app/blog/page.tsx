import { Section } from "@/app/_components/Section";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { getAllBlogPosts } from "@/lib/mdx";
import { BlogPostCard } from "./components/blog-post-card";
import { CategoryFilter } from "./components/category-filter";

const POSTS_PER_PAGE = 6;

interface Props {
  searchParams: {
    q?: string;
    page?: string;
    category?: string;
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const posts = await getAllBlogPosts();
  const searchTerm = searchParams.q?.toLowerCase() || "";
  const currentPage = Number(searchParams.page) || 1;
  const selectedCategory = searchParams.category;

  // Get all unique categories
  const categories = Array.from(
    new Set(posts.flatMap((post) => post.categories))
  ).sort();

  // Filter posts
  let filteredPosts = posts;

  if (searchTerm) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.categories.some((category) =>
          category.toLowerCase().includes(searchTerm)
        )
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter((post) =>
      post.categories.includes(selectedCategory)
    );
  }

  return (
    <Section className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Technical Blog</h1>
        <p className="text-muted-foreground max-w-2xl">
          Sharing insights and experiences from my journey in software
          engineering, with a focus on practical solutions and best practices.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Search className="flex-1" />
          <CategoryFilter categories={categories} selected={selectedCategory} />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No articles found {searchTerm && `for "${searchTerm}"`}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {filteredPosts
              .slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
              .map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
          </div>

          {filteredPosts.length > POSTS_PER_PAGE && (
            <Pagination
              totalItems={filteredPosts.length}
              pageSize={POSTS_PER_PAGE}
              baseUrl="/blog"
            />
          )}
        </>
      )}
    </Section>
  );
}
