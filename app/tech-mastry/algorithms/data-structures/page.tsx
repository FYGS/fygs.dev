import type { Metadata } from "next";
import { DataStructuresGuide } from "../_components/data-structures-guide";
import { DataStructuresVisualizations } from "./_components/data-structures-visualizations";

export const metadata: Metadata = {
  title:
    "Structures de Données | Guide de Préparation aux Entretiens Techniques",
  description:
    "Guide complet sur les structures de données essentielles pour les entretiens techniques : tableaux, listes chaînées, arbres binaires, tables de hachage et plus encore.",
};

export default function DataStructuresPage() {
  return (
    <div className="container py-8 space-y-12">
      <DataStructuresGuide />
      <DataStructuresVisualizations />
    </div>
  );
}
