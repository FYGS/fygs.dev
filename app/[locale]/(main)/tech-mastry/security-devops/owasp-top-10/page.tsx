import { Metadata } from "next";
import { VulnerabilityExplorer } from "./_components/vulnerability-explorer";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "OWASP Top 10 | TechMastry",
  description: "Les 10 vulnérabilités web les plus critiques avec exemples de code vulnérable et sécurisé",
};

export default function OwaspPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
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
    </main>
  );
}
