import { getPostStats } from "@/app/[locale]/(main)/blog/actions/stats";
import { create } from "zustand";

interface BlogStatsState {
  views: number;
  likes: number;
  shares: number;
  setViews: (views: number) => void;
  setLikes: (likes: number) => void;
  setShares: (shares: number) => void;
  incrementViews: () => void;
  incrementLikes: () => void;
  decrementLikes: () => void;
  incrementShares: () => void;
  syncStats: (slug: string) => Promise<void>;
}

export const useBlogStats = create<BlogStatsState>((set) => ({
  views: 0,
  likes: 0,
  shares: 0,
  setViews: (views) => set({ views }),
  setLikes: (likes) => set({ likes }),
  setShares: (shares) => set({ shares }),
  incrementViews: () => set((state) => ({ views: state.views + 1 })),
  incrementLikes: () => set((state) => ({ likes: state.likes + 1 })),
  decrementLikes: () => set((state) => ({ likes: state.likes - 1 })),
  incrementShares: () => set((state) => ({ shares: state.shares + 1 })),
  syncStats: async (slug) => {
    const stats = await getPostStats(slug);
    set({ views: stats.views, likes: stats.likes, shares: stats.shares });
  },
}));
