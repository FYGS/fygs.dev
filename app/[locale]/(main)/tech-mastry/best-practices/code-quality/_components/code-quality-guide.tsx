import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const principles = [
  {
    title: "Clean Code",
    description:
      "Principes pour écrire du code lisible, maintenable et compréhensible.",
    guidelines: [
      {
        do: true,
        text: "Utilisez des noms de variables et fonctions descriptifs",
      },
      {
        do: true,
        text: "Gardez les fonctions courtes et avec une seule responsabilité",
      },
      {
        do: true,
        text: "Commentez le pourquoi, pas le quoi",
      },
      {
        do: false,
        text: "Utiliser des noms de variables d'une seule lettre",
      },
      {
        do: false,
        text: "Créer des fonctions de plus de 20 lignes",
      },
    ],
    example: {
      good: `function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemPrice = item.price * item.quantity;
    const discount = applyDiscount(item);
    return total + (itemPrice - discount);
  }, 0);
}`,
      bad: `function calc(i: any[]): number {
  let t = 0;
  for (let x of i) {
    t += x.p * x.q;
    if (x.d) t -= x.p * x.q * 0.1;
  }
  return t;
}`,
    },
  },
  {
    title: "Tests",
    description:
      "Pratiques de test pour assurer la qualité et la fiabilité du code.",
    guidelines: [
      {
        do: true,
        text: "Écrivez des tests unitaires pour chaque fonction importante",
      },
      {
        do: true,
        text: "Testez les cas limites et les erreurs",
      },
      {
        do: true,
        text: "Suivez le pattern AAA (Arrange, Act, Assert)",
      },
      {
        do: false,
        text: "Tester uniquement le chemin heureux",
      },
      {
        do: false,
        text: "Ignorer les tests d'intégration",
      },
    ],
    example: {
      good: `describe('calculateTotalPrice', () => {
  it('should calculate total with discounts', () => {
    // Arrange
    const items = [
      { price: 100, quantity: 2, discount: true },
      { price: 50, quantity: 1, discount: false }
    ];
    
    // Act
    const total = calculateTotalPrice(items);
    
    // Assert
    expect(total).toBe(230); // (200 - 20) + 50
  });
});`,
      bad: `test('calc works', () => {
  const i = [{ p: 100, q: 2 }, { p: 50, q: 1 }];
  expect(calc(i)).toBe(250);
});`,
    },
  },
  {
    title: "Documentation",
    description:
      "Bonnes pratiques pour documenter le code et maintenir la documentation.",
    guidelines: [
      {
        do: true,
        text: "Documentez l'API publique et les interfaces",
      },
      {
        do: true,
        text: "Maintenez un README clair et à jour",
      },
      {
        do: true,
        text: "Incluez des exemples d'utilisation",
      },
      {
        do: false,
        text: "Écrire une documentation obsolète",
      },
      {
        do: false,
        text: "Ignorer la documentation des erreurs possibles",
      },
    ],
    example: {
      good: `/**
 * Calcule le prix total du panier avec les remises applicables.
 * @param items - Liste des articles du panier
 * @returns Le prix total après remises
 * @throws {InvalidItemError} Si un article est invalide
 * 
 * @example
 * const total = calculateTotalPrice([
 *   { price: 100, quantity: 2, discount: true }
 * ]);
 */`,
      bad: `// Calcule le total
function calc(i: any[]): number {
  // Boucle sur les items
  for (let x of i) {
    // Ajoute au total
    t += x.p * x.q;
  }
}`,
    },
  },
];

const bestPractices = [
  {
    title: "Code Review",
    points: [
      "Examinez le code pour la lisibilité et la maintenabilité",
      "Vérifiez la couverture des tests",
      "Assurez-vous que la documentation est à jour",
      "Recherchez les problèmes de sécurité potentiels",
    ],
  },
  {
    title: "Version Control",
    points: [
      "Utilisez des messages de commit descriptifs",
      "Créez des branches pour chaque fonctionnalité",
      "Faites des commits atomiques et fréquents",
      "Utilisez le rebase pour maintenir un historique propre",
    ],
  },
  {
    title: "Performance",
    points: [
      "Optimisez les requêtes de base de données",
      "Minimisez les appels réseau",
      "Utilisez la mise en cache appropriée",
      "Évitez les fuites de mémoire",
    ],
  },
];

export function CodeQualityGuide() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Principes de Code Quality</h2>
        <div className="grid gap-8">
          {principles.map((principle) => (
            <Card key={principle.title} className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{principle.title}</h3>
                  <Badge variant="secondary">Principe</Badge>
                </div>

                <p className="text-muted-foreground">{principle.description}</p>

                <div className="space-y-4">
                  <h4 className="font-medium">Guidelines :</h4>
                  <div className="grid gap-3">
                    {principle.guidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {guideline.do ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <p className="text-muted-foreground">{guideline.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Exemple :</h4>
                  <div className="grid gap-4">
                    <div>
                      <Badge className="bg-green-500/10 text-green-500 mb-2">
                        Bon exemple
                      </Badge>
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto" tabIndex={0}>
                        <code className="text-sm">{principle.example.good}</code>
                      </pre>
                    </div>
                    <div>
                      <Badge className="bg-red-500/10 text-red-500 mb-2">
                        À éviter
                      </Badge>
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto" tabIndex={0}>
                        <code className="text-sm">{principle.example.bad}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Meilleures Pratiques</h2>
        <div className="grid gap-6">
          {bestPractices.map((practice) => (
            <Card key={practice.title} className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{practice.title}</h3>
                <ul className="space-y-2">
                  {practice.points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="p-6 bg-muted">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Conseil Pro</h3>
              <p className="text-muted-foreground">
                La qualité du code n&apos;est pas seulement une question de
                fonctionnalité, mais aussi de maintenabilité à long terme.
                Lors d&apos;un entretien, montrez que vous comprenez l&apos;importance
                d&apos;écrire du code propre, testé et bien documenté.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
