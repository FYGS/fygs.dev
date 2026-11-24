import { VulnerabilityExplorer } from "./_components/vulnerability-explorer";
import { ShieldAlert } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/security-devops/owasp-top-10");

export default function OwaspPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">OWASP Top 10</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les vulnérabilités web les plus critiques. Apprenez à les identifier, les exploiter
            (pour tester) et les corriger dans vos applications.
          </p>
        </div>
      </section>
      <VulnerabilityExplorer />
    </div>
  );
}
