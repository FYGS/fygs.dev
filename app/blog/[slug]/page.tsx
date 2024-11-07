import { Section } from "@/app/_components/Section";
import { ArticleStats } from "@/app/blog/components/article-stats";
import { ReadingProgress } from "@/app/blog/components/reading-progress";
import { SimilarArticles } from "@/app/blog/components/similar-articles";
import { SocialInteractions } from "@/app/blog/components/social-interactions";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, getBlogPost } from "@/lib/mdx";
import { getViewCount, incrementViewCount } from "@/lib/reading-stats";
import { Calendar, Clock } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  return {
    title: `${post.title} - Fernand SOUALO's Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  let post;
  let viewCount;
  let allPosts;

  try {
    [post, allPosts] = await Promise.all([
      getBlogPost(params.slug),
      getAllBlogPosts(),
    ]);
    viewCount = await getViewCount(params.slug);
    await incrementViewCount(params.slug);
  } catch {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 max-w-4xl mx-auto">
          <article className="prose prose-invert space-y-8">
            <header className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold">{post.title}</h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {post.readingTime}
                </div>
              </div>
            </header>

            <div className="mdx-content prose-code:text-primary">
              {post.content}
            </div>
          </article>

          <aside className="hidden md:block space-y-6 sticky top-24">
            <ArticleStats
              readingTime={post.readingTime}
              views={viewCount}
              likes={0}
              shares={0}
            />
            <SocialInteractions
              slug={post.slug}
              initialLikes={0}
              initialBookmarks={0}
            />
          </aside>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <SimilarArticles 
            currentPost={post} 
            allPosts={allPosts}
            maxArticles={3} 
          />
        </div>
      </Section>
    </>
  );
}
