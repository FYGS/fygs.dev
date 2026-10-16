// Définition des types pour l'index de recherche
export interface SearchIndexItem {
  title: string;
  description: string;
  href: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  importance: "essential" | "high" | "medium" | "low";
}
