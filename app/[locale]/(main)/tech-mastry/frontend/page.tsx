import { FrontendTopics } from "./_components/frontend-topics";
import { FrontendHero } from "./_components/hero";

export default function FrontendPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <FrontendHero />
      <FrontendTopics />
    </main>
  );
}
