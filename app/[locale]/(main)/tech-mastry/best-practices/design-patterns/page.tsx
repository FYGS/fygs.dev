import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Patterns | Bonnes Pratiques",
  description: "Modèles de conception courants pour les entretiens techniques",
};

export default function DesignPatternsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Design Patterns</h1>
      <p className="text-lg mb-4">
        Cette section est en cours de développement. Elle contiendra des explications détaillées sur les modèles de conception courants utilisés en développement logiciel.
      </p>
      <div className="grid gap-6 mt-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Contenu à venir</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Patterns de création (Factory, Singleton, Builder)</li>
            <li>Patterns structurels (Adapter, Decorator, Proxy)</li>
            <li>Patterns comportementaux (Observer, Strategy, Command)</li>
            <li>Applications pratiques</li>
            <li>Exercices et exemples de code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
