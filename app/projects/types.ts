export interface ProjectStats {
  stars?: number;
  forks?: number;
  contributors?: number;
  linesOfCode?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link: string;
  githubUrl?: string;
  features?: string[];
  technicalDetails?: string;
  challenges?: string;
  results?: string[];
  stats: ProjectStats;
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
}
