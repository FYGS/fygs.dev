import type { Project } from "../../types";

export const pluraSaas: Project = {
  id: "plura-saas",
  title: "Plura SaaS App",
  description:
    "A comprehensive SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, and project management module.",
  image: "/projects/plura-saas.png",
  detailImages: [
    {
      url: "/projects/plura-saas-details.png",
      alt: "Plura SaaS App Overview",
    },
    {
      url: "/projects/plura-saas.png",
      alt: "Plura SaaS App",
    },
  ],
  technologies: ["Next.js", "TypeScript", "Prisma", "MySQL", "Stripe"],
  link: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
  // githubUrl: "https://github.com/fygs/plura-saas",
  stats: {
    stars: 600,
    forks: 40,
    contributors: 1,
    linesOfCode: 20000,
  },
  features: [
    "🤯 Multivendor B2B2B Saas",
    "🏢 Agency and Sub accounts",
    "🌐 Unlimited funnel hosting",
    "🚀 Full Website & Funnel builder",
    "💻 Role-based Access",
    "🔄 Stripe Subscription plans",
    "🛒 Stripe add-on products",
    "🔐 Connect Stripe accounts for all users! - Stripe Connect",
    "💳 Charge application fee per sale and recurring sales",
    "💰 Custom Dashboards",
    "📊 Media Storage",
    "📈 Stripe Product Sync",
    "📌 Custom checkouts on funnels",
    "📢 Get leads from funnels",
    "🎨 Khanban board",
    "📂 Project management system",
    "🔗 Notifications",
    "📆 Funnel performance metrics",
    "🧾 Agency and subacc metrics",
    "🌙 Graphs and charts",
    "☀️ Light & Dark mode",
    "📄 Functioning landing page",
  ],
  technicalDetails:
    "Built with Next.js 14 App Router, implements Stripe for subscription handling, and uses Prisma with MySQL for data management. Features custom subdomain routing and organization management.",
  challenges:
    "Managing complex organization hierarchies and implementing secure subdomain isolation while maintaining scalability and performance.",
};
