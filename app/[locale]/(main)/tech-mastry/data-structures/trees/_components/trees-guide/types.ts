import type { LucideIcon } from "lucide-react";

export interface TreeType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  complexity: {
    access: string;
    search: string;
    insertion: string;
    deletion: string;
  };
  advantages: string[];
  disadvantages: string[];
  applications: string[];
  code: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}
