import type { LucideIcon } from "lucide-react";

export interface Subsection {
  title: string;
  href: string;
  description: string;
}

export interface Section {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  subsections?: Subsection[];
}
