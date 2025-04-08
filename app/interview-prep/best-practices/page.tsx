import { Metadata } from "next";
import { BestPracticesHero } from "./_components/hero";
import { PracticesList } from "./_components/practices-list";

export const metadata: Metadata = {
  title: "Best Practices | Interview Prep",
  description:
    "Découvrez les meilleures pratiques pour réussir vos entretiens techniques",
};

export default function BestPracticesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <BestPracticesHero />
      <PracticesList />
    </main>
  );
}
