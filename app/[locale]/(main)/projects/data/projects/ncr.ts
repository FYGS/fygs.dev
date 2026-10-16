import type { Project } from "../../types";

export const ncr: Project = {
  id: "ncr",
  title: "NCR - Certificats de Résidence",
  description:
    "A next-generation platform modernizing residence certificate management, streamlining administrative processes for local authorities and citizens alike.",
  image: "/projects/ncr.png",
  detailImages: [
    {
      url: "/projects/ncr-home.png",
      alt: "NCR Homepage",
    },
    {
      url: "/projects/ncr-home-2.png",
      alt: "NCR Homepage 2",
    },
    {
      url: "/projects/ncr-home-3.png",
      alt: "NCR Homepage 3",
    },
    {
      url: "/projects/ncr-register-page.png",
      alt: "NCR Register Page",
    },
    {
      url: "/projects/ncr-login-page.png",
      alt: "NCR Login Page",
    },
    {
      url: "/projects/ncr-admin-dashboard.png",
      alt: "NCR Admin Dashboard",
    },
    {
      url: "/projects/ncr-admin-dashboard-2.png",
      alt: "NCR Admin Dashboard 2",
    },
    {
      url: "/projects/ncr-admin-dashboard-3.png",
      alt: "NCR Admin Dashboard 3",
    },
    {
      url: "/projects/ncr-admin-dashboard-4.png",
      alt: "NCR Admin Dashboard 4",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "Prisma",
    "Appwrite",
    "TailwindCSS",
    "Docker",
    "Orange Money API",
  ],
  link: "https://ncr.ouestech.com",
  features: [
    "📝 Digital certificate requests",
    "🏢 Multi-tenant architecture",
    "👥 Role-based access control",
    "📊 Administrative dashboard",
    "🔍 Advanced search and filtering",
    "📱 Responsive design",
    "🔒 Secure document handling",
    "💳 Orange Money payment integration",
    "🧾 Automated payment receipts",
    "📱 Mobile money transactions",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 3700,
  },
  testimonial: {
    text: "NCR transformed our approach to certificate requests with their exceptional digitalization services. The website perfectly reflects their commitment to sustainability.",
    author: "Mohamed Kaba",
    role: "Satisfied Customer",
  },
  technicalDetails:
    "Built with Next.js 14, implementing a multi-tenant architecture for different municipalities. Uses Appwrite database as a service for robust data management and Docker for containerization. Integrates Orange Money API for secure mobile payments with real-time transaction validation.",
  challenges:
    "Implementing a secure and compliant system for handling sensitive administrative documents while ensuring ease of use for both citizens and municipal staff. Integrating Orange Money payment system with proper error handling and transaction reconciliation.",
};
