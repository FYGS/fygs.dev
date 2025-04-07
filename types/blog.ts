export interface PostStats {
  views: number;
  likes: number;
  shares: number;
}

export interface PostStatsProps {
  slug: string;
  readingTime: string;
  className?: string;
}

export interface PostStatsViewProps extends PostStatsProps {
  initialStats: PostStats;
}

// Move skeleton to a separate file since it's a client component
export interface PostStatsSkeletonProps {
  className?: string;
}
