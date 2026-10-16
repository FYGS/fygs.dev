import type { Project } from "../../types";

export const delicesRachetee: Project = {
  id: "delices-rachetee",
  title: "Les Délices de la Rachetée",
  description:
    "An artisanal French pastry showcase combining traditional craftsmanship with innovative techniques to deliver unique culinary experiences.",
  image: "/projects/delices-rachetee.png",
  detailImages: [
    {
      url: "/projects/delices-rachetee-home.png",
      alt: "Les Délices de la Rachetée Homepage",
    },
    {
      url: "/projects/delices-creation.png",
      alt: "Les Délices de la Rachetée Creation",
    },
    {
      url: "/projects/delices-galerie.png",
      alt: "Les Délices de la Rachetée Galerie",
    },
    {
      url: "/projects/delices-histoire.png",
      alt: "Les Délices de la Rachetée Histoire",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "TailwindCSS",
    "Stripe",
  ],
  link: "https://lesdelicesdelarachetee.vercel.app",
  features: [
    "🛒 Online ordering system",
    "🎂 Custom cake designer",
    "📅 Event scheduling",
    "🏷️ Product catalog",
    "💳 Secure payments",
    "📱 Responsive design",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 2000,
  },
  technicalDetails:
    "Built with Next.js 15, featuring a custom product configuration system and real-time order tracking. Implements Stripe for secure payment processing.",
  challenges:
    "Creating an intuitive interface for custom cake orders while managing complex product configurations and delivery scheduling.",
};
