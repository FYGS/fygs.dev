import { InterviewPrepHero } from "./_components/hero";
import { LearningHome } from "./_components/learning-home";
import { PracticeSections } from "./_components/practice-sections";

export default function InterviewPrepPage() {
  return (
    <div className="container py-8 space-y-16 md:space-y-24 animate-fadeIn">
      <InterviewPrepHero />
      <LearningHome />
      <PracticeSections />
    </div>
  );
}
