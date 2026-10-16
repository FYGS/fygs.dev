import type { Project } from "../../types";

export const anumerique: Project = {
  id: "anumerique",
  title: "A'Numérique",
  description:
    "An innovative service bridging the digital divide through personalized, at-home digital literacy training, fostering an inclusive digital society.",
  image: "/projects/anumerique.png",
  detailImages: [
    {
      url: "/projects/anumerique-home.png",
      alt: "A'Numérique Homepage",
    },
    {
      url: "/projects/anumerique-home-2.png",
      alt: "A'Numérique Homepage 2",
    },
    {
      url: "/projects/anumerique-home-3.png",
      alt: "A'Numérique Homepage 3",
    },
    {
      url: "/projects/anumerique-home-4.png",
      alt: "A'Numérique Homepage 4",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "PostgreSQL",
    "TailwindCSS",
    "Stripe",
    "Google Calendar API",
  ],
  link: "https://www.anumerique.com",
  features: [
    "📅 Appointment scheduling",
    "👨‍🏫 Personalized training sessions",
    "📊 Progress tracking",
    "🏠 At-home service management",
    "💳 Secure payment processing",
    "📱 Mobile-first design",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 2000,
  },
  technicalDetails:
    "Integrates with Google Calendar for scheduling and Stripe for payments. Features a custom CRM system for managing client relationships and training progress.",
  challenges:
    "Developing an intuitive interface for both trainers and clients while managing complex scheduling and resource allocation.",
};
