import type { LucideIcon } from "lucide-react";

export interface TopicItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export interface TopicSection {
  title: string;
  icon: LucideIcon;
  items: TopicItem[];
}
