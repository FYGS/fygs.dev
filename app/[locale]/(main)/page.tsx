import { Metadata } from "next";
import { Contact } from "@/app/_components/Contact";
import { ContactSection } from "@/app/_components/ContactSection";
import { Skills } from "@/app/_components/Skills";
import { FeaturedCourses } from "@/app/_components/FeaturedCourses";
import { Testimonials } from "@/app/_components/Testimonials";
import { CallToAction } from "@/app/_components/CallToAction";
import { BlogPreview } from "@/app/_components/BlogPreview";
import { defaultMetadata } from "@/app/_lib/metadata";
import { Hero } from "@/app/_components/Hero";
import { Spacing } from "@/app/_components/Spacing";
import { Status } from "@/app/_components/Status";

import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider } from "next-intlayer/server";

// export const metadata: Metadata = {
//   ...defaultMetadata,
//   title: "FYGS Learning Platform | Formations Premium pour Développeurs",
//   description: "Transformez votre carrière avec nos formations premium en JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Rejoignez 15,000+ développeurs qui ont boosté leur carrière.",
//   keywords: [
//     "formation développeur",
//     "cours JavaScript",
//     "formation React",
//     "Next.js",
//     "TypeScript",
//     "Node.js",
//     "formation IA",
//     "développement web",
//     "carrière développeur",
//     "formation premium"
//   ],
//   openGraph: {
//     ...defaultMetadata.openGraph,
//     title: "FYGS Learning Platform | Formations Premium pour Développeurs",
//     description: "Transformez votre carrière avec nos formations premium. 15,000+ développeurs nous font confiance.",
//   },
// };

const Home: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;

  return (
    <IntlayerServerProvider locale={locale}>
      {/* Hero Section */}
      <Hero />
      <Spacing size="sm" />
      
      {/* Status - Compact */}
      <Status />
      <Spacing size="md" />
      
      {/* Featured Courses - New Modern Section */}
      {/* <FeaturedCourses /> */}
      
      {/* Skills - Enhanced */}
      {/* <Skills />
      <Spacing size="md" /> */}
      
      {/* Testimonials - New Social Proof Section */}
      {/* <Testimonials /> */}
      
      {/* Blog Preview - New Engaging Section */}
      {/* <BlogPreview />
      <Spacing size="md" /> */}
      
      {/* Call to Action - New Conversion Section */}
      {/* <CallToAction />
      <Spacing size="md" /> */}
      
      {/* Contact - Simplified */}
      {/* <Contact />
      <Spacing size="sm" /> */}
      
      {/* Contact Section - Final CTA */}
      {/* <ContactSection /> */}
    </IntlayerServerProvider>
  );
}

export default Home;
