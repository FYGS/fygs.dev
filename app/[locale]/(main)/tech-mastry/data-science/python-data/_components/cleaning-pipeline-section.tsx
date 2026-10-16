import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { CLEANING_PIPELINE_CODE, PIPELINE_STEPS } from "../_data/cleaning-pipeline";

export function CleaningPipelineSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Pipeline de nettoyage de données</h2>
      <Card className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {step}
              </div>
              {i < 6 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        <pre className="mt-4 bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
          {CLEANING_PIPELINE_CODE}
        </pre>
      </Card>
    </section>
  );
}
