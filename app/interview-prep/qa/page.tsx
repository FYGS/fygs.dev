import { QAGuide } from "./_components/qa-guide";

export const metadata = {
  title: "Questions & Réponses | Préparation aux Entretiens",
  description:
    "Guide complet des questions et réponses courantes lors des entretiens techniques.",
};

export default function QAPage() {
  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Questions & Réponses</h1>
          <p className="text-xl text-muted-foreground">
            Découvrez les questions les plus courantes lors des entretiens
            techniques et apprenez à y répondre efficacement.
          </p>
        </div>

        <QAGuide />
      </div>
    </div>
  );
}
