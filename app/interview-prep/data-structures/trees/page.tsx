import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arbres & Graphes | Structures de Données",
  description: "Structures de données hiérarchiques pour les entretiens techniques",
};

export default function TreesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Arbres & Graphes</h1>
      <p className="text-lg mb-4">
        Cette section est en cours de développement. Elle contiendra des explications détaillées sur les structures de données hiérarchiques comme les arbres et les graphes.
      </p>
      <div className="grid gap-6 mt-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Contenu à venir</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Arbres binaires</li>
            <li>Arbres binaires de recherche</li>
            <li>Arbres équilibrés (AVL, Rouge-Noir)</li>
            <li>Tas (Heaps)</li>
            <li>Graphes orientés et non orientés</li>
            <li>Algorithmes de parcours</li>
            <li>Exercices pratiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
