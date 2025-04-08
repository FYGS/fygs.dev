import { Metadata } from "next";
import { SystemDesignHero } from "./_components/hero";
import { DesignTopics } from "./_components/design-topics";

export const metadata: Metadata = {
  title: "System Design | Interview Prep",
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
