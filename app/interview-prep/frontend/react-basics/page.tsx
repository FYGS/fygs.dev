import { Metadata } from "next";
import { ReactBasicsHero } from "./_components/hero";
import { ReactBasicsContent } from "./_components/content";

export const metadata: Metadata = {
  title: "React Fondamentaux | Interview Prep",
  description:
    "Maîtrisez les concepts fondamentaux de React: composants, hooks, props, state et context API",
};

export default function ReactBasicsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ReactBasicsHero />
      <ReactBasicsContent />
    </main>
  );
}
