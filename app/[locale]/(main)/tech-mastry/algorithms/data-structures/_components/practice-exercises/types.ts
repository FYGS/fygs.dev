// Interface pour un exercice
export interface Exercise {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  hints: string[];
  solution: {
    explanation: string;
    code: string;
    steps: {
      step: number;
      description: string;
      code?: string;
    }[];
  };
}
