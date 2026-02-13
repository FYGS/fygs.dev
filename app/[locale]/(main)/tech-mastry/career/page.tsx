import { Metadata } from "next";
import { CareerHero } from "./_components/hero";
import { CareerTopics } from "./_components/career-topics";

export const metadata: Metadata = {
  title: "Négociation & Carrière | TechMastry",
  description: "Négociation salariale, progression de carrière et conseils pour réussir vos entretiens techniques",
};

export default function CareerPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <CareerHero />
      <CareerTopics />
    </main>
  );
}
