import { Contact } from "@/app/_components/Contact";
import { ContactSection } from "@/app/_components/ContactSection";
import { Hero } from "@/app/_components/Hero";
import {
  HomeAbout,
  HomeMethod,
  HomeProjects,
  HomeWork,
} from "@/app/_components/HomeSections";
import { Spacing } from "@/app/_components/Spacing";
import { generateRouteMetadata } from "./_lib/metadata-helpers";
import { sectionSEO } from "@/app/_lib/seo-config";

import { type NextPageIntlayer, type LocalPromiseParams } from "next-intlayer";
import { IntlayerServerProvider } from "next-intlayer/server";

export async function generateMetadata({ params }: LocalPromiseParams) {
  return generateRouteMetadata(params, sectionSEO.home);
}

// Spec: docs/specs/homepage-redesign.md
const Home: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;

  return (
    <IntlayerServerProvider locale={locale}>
      <Hero />
      <HomeMethod />
      <HomeProjects />
      <HomeWork />
      <HomeAbout />
      <Spacing size="sm" />
      <Contact />
      <div id="contact" className="scroll-mt-24">
        <ContactSection />
      </div>
    </IntlayerServerProvider>
  );
};

export default Home;
