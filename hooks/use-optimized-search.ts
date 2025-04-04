"use client";

import { BlogPost } from "@/lib/types";
import Fuse from "fuse.js";
import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_OPTIONS = {
  keys: ["title", "excerpt", "categories"],
  threshold: 0.3,
  distance: 100,
};

export function useOptimizedSearch(initialPosts: BlogPost[]) {
  const [searchResults, setSearchResults] = useState<BlogPost[]>(initialPosts);
  const fuseRef = useRef<Fuse<BlogPost>>();
  const workerRef = useRef<Worker>();

  useEffect(() => {
    fuseRef.current = new Fuse(initialPosts, SEARCH_OPTIONS);

    if (typeof Worker !== "undefined") {
      workerRef.current = new Worker(
        new URL("@/workers/search.worker.ts", import.meta.url)
      );

      workerRef.current.onmessage = (e) => {
        if (e.data.type === "SEARCH_RESULTS") {
          setSearchResults(e.data.results);
        }
      };

      workerRef.current.postMessage({
        type: "INDEX_POSTS",
        payload: { posts: initialPosts },
      });
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [initialPosts]);

  const search = useCallback(
    (term: string) => {
      if (!term) {
        setSearchResults(initialPosts);
        return;
      }

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "SEARCH",
          payload: { term, posts: initialPosts },
        });
      } else {
        const results =
          fuseRef.current?.search(term).map((res) => res.item) || [];
        setSearchResults(results);
      }
    },
    [initialPosts]
  );

  return { searchResults, search };
}
