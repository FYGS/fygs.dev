import { SecurityDevopsHero } from "./_components/hero";
import { SecurityTopics } from "./_components/security-topics";

export default function SecurityDevopsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <SecurityDevopsHero />
      <SecurityTopics />
    </div>
  );
}
