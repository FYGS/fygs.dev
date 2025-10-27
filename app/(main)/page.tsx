import { Metadata } from "next";
import { Contact } from "../_components/Contact";
import { ContactSection } from "../_components/ContactSection";
import { Hero } from "../_components/Hero";
import { Skills } from "../_components/Skills";
import { Spacing } from "../_components/Spacing";
import { Status } from "../_components/Status";
import { FeaturedCourses } from "../_components/FeaturedCourses";
import { Testimonials } from "../_components/Testimonials";
import { CallToAction } from "../_components/CallToAction";
import { defaultMetadata } from "../_lib/metadata";
import { BlogPreview } from "../_components/BlogPreview";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "FYGS Learning Platform | Formations Premium pour Développeurs",
  description: "Transformez votre carrière avec nos formations premium en JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Rejoignez 15,000+ développeurs qui ont boosté leur carrière.",
  keywords: [
    "formation développeur",
    "cours JavaScript",
    "formation React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "formation IA",
    "développement web",
    "carrière développeur",
    "formation premium"
  ],
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "FYGS Learning Platform | Formations Premium pour Développeurs",
    description: "Transformez votre carrière avec nos formations premium. 15,000+ développeurs nous font confiance.",
  },
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero />
      <Spacing size="sm" />
      
      {/* Status - Compact */}
      <Status />
      <Spacing size="md" />
      
      {/* Featured Courses - New Modern Section */}
      <FeaturedCourses />
      
      {/* Skills - Enhanced */}
      <Skills />
      <Spacing size="md" />
      
      {/* Testimonials - New Social Proof Section */}
      <Testimonials />
      
      {/* Blog Preview - New Engaging Section */}
      <BlogPreview />
      <Spacing size="md" />
      
      {/* Call to Action - New Conversion Section */}
      <CallToAction />
      <Spacing size="md" />
      
      {/* Contact - Simplified */}
      <Contact />
      <Spacing size="sm" />
      
      {/* Contact Section - Final CTA */}
      <ContactSection />
    </>
  );
}
