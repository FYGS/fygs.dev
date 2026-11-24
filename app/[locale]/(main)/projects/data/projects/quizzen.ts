import type { Project } from "../../types";

export const quizzen: Project = {
  id: "quizzen",
  title: "QuizZen",
  description:
    "A specialized interactive platform for French naturalization interview preparation, covering history, values, and institutions of the French Republic.",
  image: "/projects/quizzen.png",
  detailImages: [
    {
      url: "/projects/quizzen-home.png",
      alt: "QuizZen Homepage",
    },

    {
      url: "/projects/quizzen-home-2.png",
      alt: "QuizZen Homepage 2",
    },
    {
      url: "/projects/quizzen-home-3.png",
      alt: "QuizZen Homepage 3",
    },
    {
      url: "/projects/quizzen-home-4.png",
      alt: "QuizZen Homepage 4",
    },
    {
      url: "/projects/quizzen-home-5.png",
      alt: "QuizZen Homepage 5",
    },
    {
      url: "/projects/quizzen-home-6.png",
      alt: "QuizZen Homepage 6",
    },
    {
      url: "/projects/quizzen-home-7.png",
      alt: "QuizZen Homepage 7",
    },
    {
      url: "/projects/quizzen-register-page.png",
      alt: "QuizZen Register Page",
    },
    {
      url: "/projects/quizzen-login-page.png",
      alt: "QuizZen Login Page",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "TailwindCSS",
    "Stripe",
    "i18n",
  ],
  link: "https://quizzen.fr/fr",
  features: [
    "📚 Comprehensive study material",
    "✅ Practice tests",
    "📊 Progress tracking",
    "🎯 Personalized learning paths",
    "🌍 Multi-language support",
    "📱 Mobile-responsive design",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 2500,
  },
  technicalDetails:
    "Built with Next.js 15, using Prisma ORM with PostgreSQL for robust data management. Implements spaced repetition algorithms for optimal learning with efficient database querying. Features a robust assessment system with detailed analytics and progress tracking.",
  challenges:
    "Creating an engaging learning experience while maintaining historical accuracy and official requirements for naturalization interviews. Optimizing database queries for efficient spaced repetition algorithm implementation.",
};
