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

// Main search function
export function searchTopics(query: string): SearchResult[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = normalizeText(query);
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

  // Sort by relevance (highest first)
  return results.sort((a, b) => b.relevance - a.relevance);
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
