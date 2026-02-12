import { Contact } from "@/app/_components/Contact";
import { ContactSection } from "@/app/_components/ContactSection";
import { Skills } from "@/app/_components/Skills";
import { FeaturedCourses } from "@/app/_components/FeaturedCourses";
import { Testimonials } from "@/app/_components/Testimonials";
import { CallToAction } from "@/app/_components/CallToAction";
import { BlogPreview } from "@/app/_components/BlogPreview";
import { Hero } from "@/app/_components/Hero";
import { Spacing } from "@/app/_components/Spacing";
import { Status } from "@/app/_components/Status";
import { generateRouteMetadata } from "./_lib/metadata-helpers";
import { sectionSEO } from "@/app/_lib/seo-config";

import { type NextPageIntlayer, type LocalPromiseParams } from "next-intlayer";
import { IntlayerServerProvider } from "next-intlayer/server";

export async function generateMetadata({ params }: LocalPromiseParams) {
  return generateRouteMetadata(params, sectionSEO.home);
}

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
    </IntlayerServerProvider>
  );
};

export default Home;
