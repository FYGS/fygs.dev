import { Card } from "@/components/ui/card";
import { essentialLibs } from "../_data/content";

export function EssentialLibsSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Écosystème essentiel</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {essentialLibs.map((lib) => (
          <Card
            key={lib.name}
            className="p-4 space-y-2 hover:border-primary/30 transition-all"
          >
            <h3 className={`font-semibold ${lib.color}`}>{lib.name}</h3>
            <p className="text-sm text-muted-foreground">{lib.desc}</p>
            <code className="block text-xs bg-muted/30 rounded px-2 py-1 text-primary font-mono">
              {lib.usage}
            </code>
          </Card>
        ))}
      </div>
    </section>
  );
}
