export interface KeywordScore {
  keyword: string;
  score: number;
}

// Liste de stop words en anglais
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
]);

export function extractKeywords(
  text: string,
  maxKeywords = 10
): KeywordScore[] {
  // Convertir en minuscules et nettoyer le texte
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "");

  // Tokenization simple
  const words = cleanText.split(/\s+/);

  // Compter les occurrences des mots (en excluant les stop words)
  const wordCount = new Map<string, number>();
  words.forEach((word) => {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  // Calculer les scores TF (Term Frequency)
  const totalWords = words.length;
  const keywords: KeywordScore[] = Array.from(wordCount.entries())
    .map(([keyword, count]) => ({
      keyword,
      score: count / totalWords,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxKeywords);

  return keywords;
}

export function calculateContentSimilarity(
  keywords1: KeywordScore[],
  keywords2: KeywordScore[]
): number {
  const keywords2Map = new Map(keywords2.map((k) => [k.keyword, k.score]));

  let similarity = 0;
  let totalWeight = 0;

  // Calculer la similarité cosinus simplifiée
  keywords1.forEach(({ keyword, score: score1 }) => {
    const score2 = keywords2Map.get(keyword) || 0;
    if (score2 > 0) {
      similarity += score1 * score2;
    }
    totalWeight += score1 * score1;
  });

  const normalization =
    Math.sqrt(totalWeight) *
    Math.sqrt(
      Array.from(keywords2Map.values()).reduce(
        (sum, score) => sum + score * score,
        0
      )
    );

  return normalization > 0 ? similarity / normalization : 0;
}
