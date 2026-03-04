import { CareerHero } from "./_components/hero";
import { CareerTopics } from "./_components/career-topics";

export default function CareerPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <CareerHero />
      <CareerTopics />
    </main>
  );
}
