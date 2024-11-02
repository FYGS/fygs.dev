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
  detailImages: {
    url: string;
    alt: string;
  }[];
  technologies: string[];
  link: string;
  githubUrl?: string;
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
  stats?: {
    stars: number;
    forks: number;
    contributors: number;
    linesOfCode: number;
  };
  features: string[];
  technicalDetails: string;
  challenges: string;
  results?: string[];
}
