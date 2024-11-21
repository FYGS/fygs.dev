import { generateMetadata } from "../_lib/seo-utils";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Projects Portfolio - Full-Stack Development & Software Engineering",
  description: "Discover my portfolio of full-stack development projects, featuring web applications built with Next.js, React, TypeScript, and Node.js. See real-world examples of modern software engineering.",
  keywords: [
    "Software Engineering Projects",
    "Web Development Portfolio",
    "Full-Stack Applications",
    "Next.js Projects",
    "React Development",
    "TypeScript Examples",
    "Node.js Applications",
    "Modern Web Development",
  ],
  path: "/projects",
  type: "website",
  image: "/api/og/projects",
});

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
