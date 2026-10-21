import { PipelineGuide } from "./_components/pipeline-guide";
import { GitBranch } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/security-devops/cicd");

export default function CICDPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <GitBranch className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">CI/CD Pipelines</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Concevez des pipelines d&apos;intégration et de déploiement continus robustes
            avec GitHub Actions et les meilleures pratiques DevOps.
          </p>
        </div>
      </section>
      <PipelineGuide />
    </div>
  );
}
