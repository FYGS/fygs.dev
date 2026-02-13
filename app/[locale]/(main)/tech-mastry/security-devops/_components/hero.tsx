import { Shield, Sparkles } from "lucide-react";

export function SecurityDevopsHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
        <Shield className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Sécurité & DevOps</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sécurité applicative, CI/CD, conteneurisation et pratiques Cloud Native
          pour des systèmes robustes et résilients.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <span>OWASP • CI/CD • Docker & K8s • Cloud Native</span>
      </div>
    </section>
  );
}
