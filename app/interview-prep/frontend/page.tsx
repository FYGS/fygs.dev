import { Metadata } from "next";
import { FrontendHero } from "./components/hero";
import { FrontendTopics } from "./components/frontend-topics";

export const metadata: Metadata = {
  title: "Frontend Development | Interview Prep",
  description: "Préparation aux questions de développement frontend, React, performance et accessibilité",
};

export default function FrontendPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <FrontendHero />
      <FrontendTopics />
    </main>
  );
}
