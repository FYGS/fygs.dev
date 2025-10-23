import React from "react";
import { topics } from "../_components/topics-nav";

// Define the structure of a search result
export interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>; // Icon component type
  badge?: string;
  relevance: number; // Score to rank results
}

// Function to normalize text for search (remove accents, lowercase, etc.)
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s]/g, " ") // Replace special chars with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

// Function to calculate relevance score based on match quality
function calculateRelevance(
  item: { title: string; description: string },
  normalizedQuery: string
): number {
  const normalizedTitle = normalizeText(item.title);
  const normalizedDescription = normalizeText(item.description || "");

  let score = 0;

  // Exact title match gets highest score
  if (normalizedTitle === normalizedQuery) {
    score += 100;
  }
  // Title starts with query
  else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 75;
  }
  // Title contains query as a whole word
  else if (new RegExp(`\\b${normalizedQuery}\\b`).test(normalizedTitle)) {
    score += 50;
  }
  // Title contains query
  else if (normalizedTitle.includes(normalizedQuery)) {
    score += 25;
  }

  // Description contains query
  if (normalizedDescription.includes(normalizedQuery)) {
    score += 15;

    // Description starts with query
    if (normalizedDescription.startsWith(normalizedQuery)) {
      score += 10;
    }
  }

  return score;
}

import { searchIndex, SearchIndexItem } from "./search-index";

// Main search function
export function searchTopics(query: string): SearchResult[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = normalizeText(query);

  // Recherche dans l'index avancé
  const indexResults = searchInIndex(normalizedQuery);

  // Fusionner avec les résultats de la navigation (pour les icônes et badges)
  const navResults = searchInNavigation(normalizedQuery);

  // Combiner les résultats
  const combinedResults = mergeResults(indexResults, navResults);

  // Trier par pertinence (la plus élevée en premier)
  return combinedResults.sort((a, b) => b.relevance - a.relevance);
}

// Recherche dans l'index avancé
function searchInIndex(normalizedQuery: string): SearchResult[] {
  const results: SearchResult[] = [];

  searchIndex.forEach((item) => {
    const relevance = calculateIndexRelevance(item, normalizedQuery);

    if (relevance > 0) {
      // Utiliser une icône par défaut pour les résultats de l'index
      // Nous utiliserons l'icône du premier élément de navigation qui correspond au même href
      const defaultIcon = findIconForPath(item.href);

      results.push({
        title: item.title,
        description: item.description,
        href: item.href,
        category: item.category,
        icon: defaultIcon,
        relevance,
      });
    }
  });

  return results;
}

// Fonction utilitaire pour trouver une icône pour un chemin donné
function findIconForPath(
  path: string
): React.ComponentType<{ className?: string }> {
  // Parcourir tous les éléments de navigation pour trouver une correspondance
  for (const category of topics) {
    for (const item of category.items) {
      if (item.href === path) {
        return item.icon;
      }
    }
  }

  // Icône par défaut si aucune correspondance n'est trouvée
  // Utiliser l'icône du premier élément de la première catégorie
  return topics[0].items[0].icon;
}

// Recherche dans la navigation pour obtenir les icônes et badges
function searchInNavigation(normalizedQuery: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Iterate through all topics and their items
  topics.forEach((category) => {
    category.items.forEach((item) => {
      const relevance = calculateRelevance(item, normalizedQuery);

      // Only include results with some relevance
      if (relevance > 0) {
        results.push({
          title: item.title,
          description: item.description,
          href: item.href,
          category: category.title,
          icon: item.icon,
          badge: item.badge,
          relevance,
        });
      }
    });
  });

  return results;
}

// Fusionner les résultats de l'index et de la navigation
function mergeResults(
  indexResults: SearchResult[],
  navResults: SearchResult[]
): SearchResult[] {
  const mergedResults: SearchResult[] = [...indexResults];

  // Ajouter les icônes et badges des résultats de navigation
  navResults.forEach((navResult) => {
    const existingIndex = mergedResults.findIndex(
      (r) => r.href === navResult.href
    );

    if (existingIndex >= 0) {
      // Mettre à jour avec l'icône et le badge
      mergedResults[existingIndex].icon = navResult.icon;
      mergedResults[existingIndex].badge = navResult.badge;
      // Prendre la relevance la plus élevée
      mergedResults[existingIndex].relevance = Math.max(
        mergedResults[existingIndex].relevance,
        navResult.relevance
      );
    } else {
      // Ajouter le résultat s'il n'existe pas déjà
      mergedResults.push(navResult);
    }
  });

  return mergedResults;
}

// Calculer la pertinence pour les éléments de l'index
function calculateIndexRelevance(item: SearchIndexItem, query: string): number {
  let relevance = 0;

  // Vérifier le titre (poids élevé)
  if (normalizeText(item.title).includes(query)) {
    relevance += 10;
    // Bonus si le titre commence par la requête
    if (normalizeText(item.title).startsWith(query)) {
      relevance += 5;
    }
  }

  // Vérifier la description (poids moyen)
  if (normalizeText(item.description).includes(query)) {
    relevance += 5;
  }

  // Vérifier la catégorie et sous-catégorie (poids moyen)
  if (normalizeText(item.category).includes(query)) {
    relevance += 3;
  }

  if (item.subcategory && normalizeText(item.subcategory).includes(query)) {
    relevance += 3;
  }

  // Vérifier les mots-clés (poids élevé pour les correspondances exactes)
  item.keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword === query) {
      relevance += 8; // Correspondance exacte
    } else if (
      normalizedKeyword.includes(query) ||
      query.includes(normalizedKeyword)
    ) {
      relevance += 4; // Correspondance partielle
    }
  });

  // Bonus pour les éléments essentiels ou de haute importance
  if (item.importance === "essential") {
    relevance += 3;
  } else if (item.importance === "high") {
    relevance += 2;
  }

  return relevance;
}

// Function to highlight search terms in text
export function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query || query.trim() === "") {
    return [text];
  }

  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);

  // If no match, return original text
  if (!normalizedText.includes(normalizedQuery)) {
    return [text];
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all occurrences of the query in the text (case insensitive)
  const regex = new RegExp(normalizedQuery, "gi");
  let match;

  // Create a mapping between normalized positions and original positions
  const positionMap: number[] = [];
  for (let i = 0; i < text.length; i++) {
    positionMap.push(normalizeText(text.substring(0, i + 1)).length - 1);
  }

  // Find matches in normalized text but highlight in original text
  while ((match = regex.exec(normalizedText)) !== null) {
    const startPos = match.index;
    const endPos = startPos + match[0].length;

    // Find corresponding positions in original text
    let originalStartPos = text.length - 1;
    let originalEndPos = text.length - 1;

    for (let i = 0; i < positionMap.length; i++) {
      if (positionMap[i] >= startPos) {
        originalStartPos = i;
        break;
      }
    }

    for (let i = originalStartPos; i < positionMap.length; i++) {
      if (positionMap[i] >= endPos - 1) {
        originalEndPos = i + 1;
        break;
      }
    }

    // Add text before match
    if (originalStartPos > lastIndex) {
      parts.push(text.substring(lastIndex, originalStartPos));
    }

    // Add highlighted match
    parts.push(
      React.createElement(
        "span",
        {
          key: startPos,
          className: "bg-yellow-200 dark:bg-yellow-800 rounded px-0.5",
        },
        text.substring(originalStartPos, originalEndPos)
      )
    );

    lastIndex = originalEndPos;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
