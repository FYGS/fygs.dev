import { Metadata } from "next";
import { Contact } from "./_components/Contact";
import { Hero } from "./_components/Hero";
import { Skills } from "./_components/Skills";
import { Spacing } from "./_components/Spacing";
import { Status } from "./_components/Status";
import { defaultMetadata } from "./_lib/metadata";

export const metadata: Metadata = defaultMetadata;

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
