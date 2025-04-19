import { Metadata } from "next";
import { ComponentPatternsHero } from "./_components/hero";
import { ComponentPatternsContent } from "./_components/content";

export const metadata: Metadata = {
  title: "Component Patterns | Interview Prep",
  description:
    "Maîtrisez les patterns de conception de composants React: Compound Components, Render Props, HOCs, et Custom Hooks",
};

export default function ComponentPatternsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ComponentPatternsHero />
      <ComponentPatternsContent />
    </main>
  );
}
