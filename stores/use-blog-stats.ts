import { getPostStats } from "@/app/[locale]/(main)/blog/actions/stats";
import { create } from "zustand";

interface BlogStatsState {
  currentSlug: string;
  views: number;
  likes: number;
  shares: number;
  initForSlug: (
    slug: string,
    stats: { views: number; likes: number; shares: number },
  ) => void;
  setViews: (views: number) => void;
  setLikes: (likes: number) => void;
  setShares: (shares: number) => void;
  incrementLikes: () => void;
  decrementLikes: () => void;
  incrementShares: () => void;
  syncStats: (slug: string) => Promise<void>;
}

export const useBlogStats = create<BlogStatsState>((set, get) => ({
  currentSlug: "",
  views: 0,
  likes: 0,
  shares: 0,
  initForSlug: (slug, stats) => {
    // Only reset if the slug actually changed
    if (get().currentSlug !== slug) {
      set({
        currentSlug: slug,
        views: stats.views,
        likes: stats.likes,
        shares: stats.shares,
      });
    }
  },
  setViews: (views) => set({ views }),
  setLikes: (likes) => set({ likes }),
  setShares: (shares) => set({ shares }),
  incrementLikes: () => set((state) => ({ likes: state.likes + 1 })),
  decrementLikes: () => set((state) => ({ likes: state.likes - 1 })),
  incrementShares: () => set((state) => ({ shares: state.shares + 1 })),
  syncStats: async (slug) => {
    // Only sync if this is still the current slug (prevent race conditions)
    if (get().currentSlug !== slug) return;
    const stats = await getPostStats(slug);
    if (get().currentSlug === slug) {
      set({ views: stats.views, likes: stats.likes, shares: stats.shares });
    }
  },
}));
