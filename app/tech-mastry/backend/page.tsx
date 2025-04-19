import { Metadata } from "next";
import { BackendTopics } from "./_components/backend-topics";
import { BackendHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "Backend Development | TechMastry",
  description:
    "Préparation aux questions de développement backend, API, bases de données et architecture",
};

export default function BackendPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <BackendHero />
      <BackendTopics />
    </main>
  );
}
