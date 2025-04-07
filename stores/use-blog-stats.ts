import { getPostStats } from "@/app/blog/actions/stats";
import { create } from "zustand";

interface BlogStatsState {
  likes: number;
  shares: number;
  setLikes: (likes: number) => void;
  setShares: (shares: number) => void;
  incrementLikes: () => void;
  decrementLikes: () => void;
  incrementShares: () => void;
  syncStats: (slug: string) => Promise<void>;
}

export const useBlogStats = create<BlogStatsState>((set) => ({
  likes: 0,
  shares: 0,
  setLikes: (likes) => set({ likes }),
  setShares: (shares) => set({ shares }),
  incrementLikes: () => set((state) => ({ likes: state.likes + 1 })),
  decrementLikes: () => set((state) => ({ likes: state.likes - 1 })),
  incrementShares: () => set((state) => ({ shares: state.shares + 1 })),
  syncStats: async (slug) => {
    const stats = await getPostStats(slug);
    set({ likes: stats.likes, shares: stats.shares });
  },
}));
