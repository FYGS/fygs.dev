import { BestPracticesExercises } from "./_components/exercises";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices/exercises");

export default function ExercisesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500/20 to-green-500/20 mb-2">
          <span className="text-3xl">💡</span>
        </div>
        <h1 className="text-4xl font-bold">Exercices Situationnels</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mettez en pratique les bonnes pratiques de développement avec des exercices
          de refactoring, code review et design architectural.
        </p>
      </div>
      <BestPracticesExercises />
    </div>
  );
}
