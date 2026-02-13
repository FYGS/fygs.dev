import { Metadata } from "next";
import { SecurityDevopsHero } from "./_components/hero";
import { SecurityTopics } from "./_components/security-topics";

export const metadata: Metadata = {
  title: "Sécurité & DevOps | TechMastry",
  description: "Sécurité applicative, CI/CD, Docker, Kubernetes et Cloud Native pour développeurs",
};

export default function SecurityDevopsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SecurityDevopsHero />
      <SecurityTopics />
    </main>
  );
}
