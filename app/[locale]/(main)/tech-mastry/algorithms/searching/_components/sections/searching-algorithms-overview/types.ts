// Types pour les algorithmes de recherche
export type TimeComplexity = {
  best: string;
  average: string;
  worst: string;
};

export type Complexity = {
  time: TimeComplexity;
  space: string;
};

export type SearchAlgorithm = {
  id: string;
  name: string;
  description: string;
  complexity: Complexity;
  code: string;
  useCases: string[];
  pros: string[];
  cons: string[];
  visualization?: string;
  dataStructures?: string[];
};
