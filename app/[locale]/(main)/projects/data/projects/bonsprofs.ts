import type { Project } from "../../types";

export const bonsprofs: Project = {
  id: "bonsprofs",
  title: "BonsProfs",
  description:
    "A professional matchmaking platform connecting teachers, tutors, and students. Features advanced search, profile management, and a booking system to facilitate educational connections.",
  image: "/projects/bonsprofs.png",
  detailImages: [
    {
      url: "/projects/bonsprofs.png",
      alt: "BonsProfs Homepage",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "TailwindCSS",
    "Better Auth",
    "Stripe",
    "Zod",
  ],
  link: "https://bonsprofs.com/",
  features: [
    "👨‍🏫 Teacher/tutor profile creation & management",
    "🔍 Advanced search with filters (subject, level, location)",
    "📅 Booking & scheduling system",
    "💳 Integrated payment processing",
    "⭐ Review & rating system",
    "📱 Mobile-first responsive design",
    "🔒 Secure authentication & authorization",
    "📊 Dashboard for teachers and students",
    "🌍 Multi-subject and multi-level support",
    "💬 Messaging between students and teachers",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 12000,
  },
  technicalDetails:
    "Full-stack platform built with Next.js 15 App Router, Prisma ORM with PostgreSQL for relational data management. Implements Better Auth for secure authentication, Stripe for payment processing, and Zod for end-to-end type-safe validation.",
  challenges:
    "Designing a scalable matching algorithm that considers multiple criteria (subject, availability, location, rating) while maintaining fast search performance. Building a real-time booking system that handles concurrent reservations without conflicts.",
};
