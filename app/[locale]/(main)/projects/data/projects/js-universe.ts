import type { Project } from "../../types";

export const jsUniverse: Project = {
  id: "js-universe",
  title: "JS Universe Blog",
  description:
    "A high-performance blog platform built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
  image: "/projects/js-universe.png",
  detailImages: [
    {
      url: "/projects/js-universe-home.png",
      alt: "JS Universe Blog Homepage",
    },
    {
      url: "/projects/js-universe.png",
      alt: "JS Universe some projects",
    },
    {
      url: "/projects/js-universe-projects.png",
      alt: "JS Universe Projects page",
    },
    {
      url: "/projects/js-universe-projects-detail.png",
      alt: "JS Universe Projects Detail page",
    },
  ],
  technologies: ["Gatsby", "TypeScript", "GraphQL", "TailwindCSS"],
  link: "https://js-universe-blog.netlify.app",
  githubUrl: "https://github.com/fygs/js-universe-blog",
  testimonial: {
    text: "Fernand delivered an exceptional blog platform that exceeded our expectations in terms of performance and user experience.",
    author: "John Doe",
    role: "CTO at TechCorp",
  },
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 700,
  },
  features: [
    "💻 Static Site Generation for optimal performance",
    "📸 Progressive image loading",
    "🔍 SEO optimization",
  ],
  technicalDetails:
    "Built with Gatsby for static site generation, using TypeScript for type safety and GraphQL for efficient data querying. Implemented TailwindCSS for responsive design and custom theming.",
  challenges:
    "Optimizing image loading and implementing efficient caching strategies while maintaining a smooth user experience across different devices and network conditions.",
};
