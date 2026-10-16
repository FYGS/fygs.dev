import { Metadata } from "next";
import { ResourcesHero } from "./_components/hero";
import { ResourcesList } from "./_components/resources-list";

export const metadata: Metadata = {
  title: "Ressources & Documentation | TechMastry",
  description:
    "Sélection curatée de livres, cours, chaînes YouTube, podcasts et outils pour la préparation aux entretiens techniques",
};

export default function ResourcesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ResourcesHero />
      <ResourcesList />
    </div>
  );
}
