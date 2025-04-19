import { Metadata } from "next";
import { DesignTopics } from "./_components/design-topics";
import { SystemDesignHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "System Design | TechMastry",
  description:
    "Préparation aux questions de conception de systèmes distribués et d'architecture logicielle",
};

export default function SystemDesignPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SystemDesignHero />
      <DesignTopics />
    </main>
  );
}
