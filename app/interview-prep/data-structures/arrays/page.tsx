import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableaux & Chaînes | Structures de Données",
  description: "Manipulation des tableaux et des chaînes de caractères pour les entretiens techniques",
};

export default function ArraysPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Tableaux & Chaînes</h1>
      <p className="text-lg mb-4">
        Cette section est en cours de développement. Elle contiendra des explications détaillées sur la manipulation des tableaux et des chaînes de caractères.
      </p>
      <div className="grid gap-6 mt-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Contenu à venir</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Opérations sur les tableaux</li>
            <li>Manipulation de chaînes</li>
            <li>Algorithmes courants</li>
            <li>Techniques d&apos;optimisation</li>
            <li>Exercices pratiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
