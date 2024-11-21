import { Metadata } from "next";
import { Contact } from "./_components/Contact";
import { Hero } from "./_components/Hero";
import { Skills } from "./_components/Skills";
import { Spacing } from "./_components/Spacing";
import { Status } from "./_components/Status";
import { defaultMetadata } from "./_lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "Fernand SOUALO - Expert Software Engineer | Full-Stack Development",
    description: "Experienced Software Engineer specializing in building modern, scalable web applications. Explore my portfolio showcasing expertise in TypeScript, Node.js, Next.js, React, and cloud technologies.",
    url: "/",
    type: "website",
  },
  twitter: {
    ...defaultMetadata.twitter,
    title: "Fernand SOUALO - Expert Software Engineer",
    description: "Discover my software engineering portfolio featuring modern web applications, technical insights, and professional expertise.",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Spacing size="md" />
      <Status />
      <Spacing size="md" />
      <Skills />
      <Spacing size="md" />
      <Contact />
    </>
  );
}
