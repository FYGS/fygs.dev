import { searchIndex } from "./index";

// Fonction pour obtenir des mots-clés uniques pour l'autocomplétion
export function getUniqueKeywords(): string[] {
  const allKeywords = searchIndex.flatMap((item) => item.keywords);
  return [...new Set(allKeywords)];
}

// Fonction pour obtenir toutes les catégories et sous-catégories
export function getCategoriesAndSubcategories(): {
  categories: string[];
  subcategories: Record<string, string[]>;
} {
  const categories = [...new Set(searchIndex.map((item) => item.category))];

  const subcategories: Record<string, string[]> = {};
  categories.forEach((category) => {
    const subs = searchIndex
      .filter((item) => item.category === category && item.subcategory)
      .map((item) => item.subcategory as string);
    subcategories[category] = [...new Set(subs)];
  });

  return { categories, subcategories };
}
