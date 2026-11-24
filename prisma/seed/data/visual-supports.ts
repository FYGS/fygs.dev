// Visual supports content
export const visualSupportsData = {
  nextjsEvolution: {
    type: "presentation",
    slides: [
      {
        title: "L'Évolution du Rendu Web",
        content: {
          sections: [
            {
              title: "Client-Side Rendering (CSR)",
              description: "Applications entièrement rendues côté client",
              pros: ["Interactivité riche", "UX fluide après chargement"],
              cons: ["SEO difficile", "Performance initiale lente"],
            },
            {
              title: "Server-Side Rendering (SSR)",
              description: "Rendu côté serveur à chaque requête",
              pros: ["SEO optimal", "Performance initiale rapide"],
              cons: ["Charge serveur élevée", "Hydratation complexe"],
            },
            {
              title: "Static Site Generation (SSG)",
              description: "Pré-génération de pages statiques",
              pros: ["Performance maximale", "Évolutivité excellente"],
              cons: ["Données statiques", "Rebuild pour mise à jour"],
            },
          ],
        },
      },
    ],
  },
  reactPatterns: {
    type: "code-demonstration",
    examples: [
      {
        title: "Custom Hooks Pattern",
        description: "Réutilisation de logique avec des hooks personnalisés",
        code: `
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}
        `,
      },
    ],
  },
};
