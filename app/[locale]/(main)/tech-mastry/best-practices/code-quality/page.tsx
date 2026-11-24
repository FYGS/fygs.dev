import { CodeQualityGuide } from "./_components/code-quality-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices/code-quality");

export default function CodeQualityPage() {
  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Guide de Qualité de Code</h1>
          <p className="text-xl text-muted-foreground">
            Découvrez les meilleures pratiques pour écrire du code propre,
            maintenable et performant.
          </p>
        </div>

        <CodeQualityGuide />
      </div>
    </div>
  );
}
