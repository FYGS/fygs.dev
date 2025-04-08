import { Metadata } from "next";
import { BackendHero } from "./components/hero";
import { BackendTopics } from "./components/backend-topics";

export const metadata: Metadata = {
  title: "Backend Development | Interview Prep",
  description: "Préparation aux questions de développement backend, API, bases de données et architecture",
};

export default function BackendPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <BackendHero />
      <BackendTopics />
    </main>
  );
}
