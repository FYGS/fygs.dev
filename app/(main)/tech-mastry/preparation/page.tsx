import { PreparationGuide } from "./_components/preparation-guide";

export const metadata = {
  title: "Guide de Préparation | Préparation aux Entretiens",
  description:
    "Guide complet pour se préparer efficacement aux entretiens techniques.",
};

export default function PreparationPage() {
  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Guide de Préparation</h1>
          <p className="text-xl text-muted-foreground">
            Apprenez à vous préparer efficacement pour réussir vos entretiens
            techniques.
          </p>
        </div>

        <PreparationGuide />
      </div>
    </div>
  );
}
