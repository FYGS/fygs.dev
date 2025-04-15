import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Design | Bonnes Pratiques",
  description: "Conception de systèmes distribués pour les entretiens techniques",
};

export default function SystemDesignPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">System Design</h1>
      <p className="text-lg mb-4">
        Cette section est en cours de développement. Elle contiendra des explications détaillées sur la conception de systèmes distribués et les bonnes pratiques associées.
      </p>
      <div className="grid gap-6 mt-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Contenu à venir</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Principes fondamentaux de conception</li>
            <li>Scalabilité et performance</li>
            <li>Bases de données et stockage</li>
            <li>Caching et CDN</li>
            <li>Microservices et architecture distribuée</li>
            <li>Études de cas et exemples pratiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
