import type { Project } from "../../types";

export const abilogs: Project = {
  id: "abilogs",
  title: "AbiLogs",
  description:
    "A comprehensive logistics management application for tracking shipments, managing inventory, and optimizing supply chain operations. Features real-time tracking, analytics dashboards, and automated reporting.",
  image: "/projects/abilogs.png",
  detailImages: [
    {
      url: "/projects/abilogs.png",
      alt: "AbiLogs Homepage",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "TailwindCSS",
    "Chart.js",
    "React Hook Form",
    "Zod",
  ],
  link: "https://abilogs.vercel.app/",
  features: [
    "📦 Shipment tracking & management",
    "📊 Analytics dashboard with real-time metrics",
    "🗺️ Route optimization & visualisation",
    "📋 Inventory management system",
    "📈 Automated reporting & exports",
    "👥 Multi-role access (admin, dispatcher, driver)",
    "🔔 Real-time notifications & alerts",
    "📱 Mobile-responsive interface",
    "🔒 Secure role-based access control",
    "📄 Document management for shipping papers",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 8000,
  },
  technicalDetails:
    "Built with Next.js 15, featuring a comprehensive logistics dashboard with Chart.js for data visualization. Uses Prisma ORM with PostgreSQL for complex relational data. Implements role-based access control for different user types (admin, dispatcher, driver).",
  challenges:
    "Managing complex real-time data synchronization across multiple user roles while maintaining data consistency. Implementing efficient route optimization algorithms and rendering large datasets in interactive dashboard visualizations.",
};
