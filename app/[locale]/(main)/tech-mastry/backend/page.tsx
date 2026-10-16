import { BackendTopics } from "./_components/backend-topics";
import { BackendHero } from "./_components/hero";

export default function BackendPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <BackendHero />
      <BackendTopics />
    </div>
  );
}
