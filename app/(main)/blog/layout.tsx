import { generateMetadata } from "@/app/_lib/seo-utils";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Technical Blog - Software Engineering Insights & Best Practices",
  description:
    "Explore in-depth articles on software engineering, web development, cloud architecture, and best practices. Learn about React, TypeScript, Node.js, and modern development techniques.",
  keywords: [
    "Software Engineering Blog",
    "Web Development Articles",
    "Technical Tutorials",
    "Programming Best Practices",
    "React Development",
    "TypeScript Guides",
    "Cloud Architecture",
    "Full-Stack Development",
  ],
  path: "/blog",
  type: "website",
  image: "/api/og/blog",
});

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
