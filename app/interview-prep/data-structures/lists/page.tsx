import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listes & Files | Structures de Données",
  description: "Structures de données linéaires pour les entretiens techniques",
};

export default function ListsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Listes & Files</h1>
      <p className="text-lg mb-4">
        Cette section est en cours de développement. Elle contiendra des explications détaillées sur les structures de données linéaires comme les listes chaînées, les piles et les files.
      </p>
      <div className="grid gap-6 mt-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Contenu à venir</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Listes chaînées simples et doubles</li>
            <li>Piles (Stacks)</li>
            <li>Files (Queues)</li>
            <li>Files de priorité</li>
            <li>Implémentations et applications</li>
            <li>Exercices pratiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
