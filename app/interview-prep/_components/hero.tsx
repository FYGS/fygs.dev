import { Button } from "@/components/ui/button";
import { BarChart3, GraduationCap } from "lucide-react";
import Link from "next/link";

export function InterviewPrepHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="w-8 h-8" />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Préparation aux Entretiens Techniques
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une approche structurée pour maîtriser les concepts clés et exceller
          dans vos entretiens techniques.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <Button asChild variant="default" size="lg" className="gap-2">
          <Link href="/interview-prep/playground">
            <GraduationCap className="w-5 h-5" />
            Code Playground
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/interview-prep/dashboard">
            <BarChart3 className="w-5 h-5" />
            Learning Dashboard
          </Link>
        </Button>
      </div>
    </section>
  );
}
