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
import { generateI18nMetadata } from "@/app/_lib/i18n-metadata";

import { type NextPageIntlayer, type LocalPromiseParams } from "next-intlayer";
import { IntlayerServerProvider } from "next-intlayer/server";

export async function generateMetadata({ params }: LocalPromiseParams) {
  const { locale } = await params;

  return generateI18nMetadata({
    locale,
    path: "/",
    title: {
      fr: "FYGS Learning Platform | Formations Premium pour Développeurs",
      en: "FYGS Learning Platform | Premium Courses for Developers",
      es: "FYGS Learning Platform | Cursos Premium para Desarrolladores",
    },
    description: {
      fr: "Transformez votre carrière avec nos formations premium en JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Rejoignez 15,000+ développeurs qui ont boosté leur carrière.",
      en: "Transform your career with our premium courses in JavaScript, TypeScript, React, Next.js, Node.js, AI and Cloud. Join 15,000+ developers who boosted their careers.",
      es: "Transforme su carrera con nuestros cursos premium en JavaScript, TypeScript, React, Next.js, Node.js, IA y Cloud. Únete a más de 15,000 desarrolladores que impulsaron sus carreras.",
    },
    keywords: [
      {
        fr: "formation développeur",
        en: "developer training",
        es: "formación desarrollador",
      },
      {
        fr: "cours JavaScript",
        en: "JavaScript courses",
        es: "cursos JavaScript",
      },
      {
        fr: "Développement Web",
        en: "Web Development",
        es: "Desarrollo Web",
      },
      {
        fr: "formation React",
        en: "React training",
        es: "formación React",
      },
      {
        fr: "IA",
        en: "AI",
        es: "IA",
      },
      {
        fr: "formation IA",
        en: "AI training",
        es: "formación IA",
      },
      {
        fr: "carrière développeur",
        en: "developer career",
        es: "carrera desarrollador",
      },
      {
        fr: "Next.js",
        en: "Next.js",
        es: "Next.js",
      },
      {
        fr: "TypeScript",
        en: "TypeScript",
        es: "TypeScript",
      },
      {
        fr: "Node.js",
        en: "Node.js",
        es: "Node.js",
      },
    ],
  });
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
