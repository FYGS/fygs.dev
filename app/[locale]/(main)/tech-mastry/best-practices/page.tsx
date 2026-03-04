import { BestPracticesHero } from "./_components/hero";
import { PracticesList } from "./_components/practices-list";

export default function BestPracticesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <BestPracticesHero />
      <PracticesList />
    </main>
  );
}
