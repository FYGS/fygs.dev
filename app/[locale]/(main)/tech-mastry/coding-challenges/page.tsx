import { ChallengesList } from "./_components/challenges-list";
import { ChallengesHero } from "./_components/hero";

export default function CodingChallengesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengesHero />
      <ChallengesList />
    </div>
  );
}
