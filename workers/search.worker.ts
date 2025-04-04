import { BlogPost } from "@/lib/types";

const searchIndex = new Map<string, BlogPost[]>();

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "INDEX_POSTS":
      indexPosts(payload.posts);
      break;
    case "SEARCH":
      const results = search(payload.term);
      self.postMessage({ type: "SEARCH_RESULTS", results });
      break;
  }
};

function indexPosts(posts: BlogPost[]) {
  posts.forEach((post) => {
    const terms = [
      post.title.toLowerCase(),
      post.excerpt.toLowerCase(),
      ...post.categories.map((cat) => cat.toLowerCase()),
    ];

    terms.forEach((term) => {
      const words = term.split(/\s+/);
      words.forEach((word) => {
        const existing = searchIndex.get(word) || [];
        if (!existing.includes(post)) {
          existing.push(post);
          searchIndex.set(word, existing);
        }
      });
    });
  });
}

function search(term: string): BlogPost[] {
  const searchTerms = term.toLowerCase().split(/\s+/);
  const results = new Map<string, { post: BlogPost; score: number }>();

  searchTerms.forEach((searchTerm) => {
    const matchingPosts = searchIndex.get(searchTerm) || [];
    matchingPosts.forEach((post) => {
      const existing = results.get(post.slug);
      if (existing) {
        existing.score += 1;
      } else {
        results.set(post.slug, { post, score: 1 });
      }
    });
  });

  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .map((result) => result.post);
}
