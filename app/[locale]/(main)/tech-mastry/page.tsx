import { InterviewPrepHero } from "./_components/hero";
import { PracticeSections } from "./_components/practice-sections";

export default function InterviewPrepPage() {
  return (
    <main className="container py-8 space-y-16 md:space-y-24 animate-fadeIn">
      <InterviewPrepHero />
      <PracticeSections />
    </main>
  );
}
