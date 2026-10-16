import { DesignTopics } from "./_components/design-topics";
import { SystemDesignHero } from "./_components/hero";

export default function SystemDesignPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <SystemDesignHero />
      <DesignTopics />
    </div>
  );
}
