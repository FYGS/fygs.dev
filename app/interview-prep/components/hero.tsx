import { GraduationCap } from "lucide-react";

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
          Une approche structurée pour maîtriser les concepts clés et exceller dans vos entretiens techniques.
        </p>
      </div>
    </section>
  );
}
