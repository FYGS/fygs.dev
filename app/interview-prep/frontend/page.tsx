import { Metadata } from "next";
import { FrontendTopics } from "./_components/frontend-topics";
import { FrontendHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "Frontend Development | TechMastry",
  description:
    "Préparation aux questions de développement frontend, React, performance et accessibilité",
};

export default function FrontendPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <FrontendHero />
      <FrontendTopics />
    </main>
  );
}
