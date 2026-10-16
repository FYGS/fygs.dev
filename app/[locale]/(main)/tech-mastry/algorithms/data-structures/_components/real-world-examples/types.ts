// Interface pour un exemple concret
export interface RealWorldExample {
  id: string;
  title: string;
  category: string;
  description: string;
  useCases: {
    title: string;
    description: string;
  }[];
  codeExample: {
    language: string;
    code: string;
    explanation: string;
  };
  references?: {
    title: string;
    url: string;
  }[];
}
