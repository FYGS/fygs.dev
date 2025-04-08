import type { Metadata } from "next";
import { DataStructuresGuide } from "./components/data-structures-guide";

export const metadata: Metadata = {
  title: "Structures de Données | Guide de Préparation aux Entretiens Techniques",
  description: "Guide complet sur les structures de données essentielles pour les entretiens techniques : tableaux, listes chaînées, arbres binaires, tables de hachage et plus encore.",
};

export default function DataStructuresPage() {
  return (
    <div className="container py-8">
      <DataStructuresGuide />
    </div>
  );
}
