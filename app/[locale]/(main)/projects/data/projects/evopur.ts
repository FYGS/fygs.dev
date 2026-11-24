import type { Project } from "../../types";

export const evopur: Project = {
  id: "evopur",
  title: "Evopur",
  description:
    "Professional ecological household cleaning services platform offering comprehensive home cleaning solutions with eco-friendly products and sustainable practices for a healthier living environment.",
  image: "/projects/evopur.png",
  detailImages: [
    {
      url: "/projects/evopur-home.png",
      alt: "Evopur Homepage",
    },
    {
      url: "/projects/evopur-home2.png",
      alt: "Evopur Services Page",
    },
    {
      url: "/projects/evopur-about.png",
      alt: "Evopur About Page",
    },
    {
      url: "/projects/evopur-contact.png",
      alt: "Evopur Contact Page",
    },
    {
      url: "/projects/evopur-blog.png",
      alt: "Evopur Blog Page",
    },
    {
      url: "/projects/evopur-testimonials.png",
      alt: "Evopur Testimonials Page",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "TailwindCSS",
    "Framer Motion",
    "React Hook Form",
    "Zod",
    "Nodemailer",
    "Translation",
    "VPS",
    "Coolify",
  ],
  link: "https://evopur.ca",
  features: [
    "🌿 Eco-friendly cleaning services showcase",
    "📅 Online booking system",
    "💚 Sustainable practices information",
    "📱 Mobile-responsive design",
    "✨ Smooth animations and transitions",
    "📧 Contact form with email notifications",
    "🏠 Service area coverage map",
    "💰 Transparent pricing structure",
    "⭐ Customer testimonials section",
    "🔒 Secure booking process",
  ],
  technicalDetails:
    "Built with Next.js 15 using the App Router, featuring server-side rendering for optimal SEO performance. Implements Framer Motion for smooth animations, React Hook Form with Zod validation for form handling, and Nodemailer for reliable email delivery. The design emphasizes sustainability with a green color palette and eco-friendly imagery.",
  challenges:
    "Creating a trustworthy and professional image for a cleaning service while emphasizing environmental responsibility. Implementing an intuitive booking system that captures all necessary service details while maintaining a simple user experience.",
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 3500,
  },
  testimonial: {
    text: "Evopur transformed our approach to home cleaning with their exceptional eco-friendly services. The website perfectly reflects their commitment to sustainability.",
    author: "Marie Dubois",
    role: "Satisfied Customer",
  },
};
