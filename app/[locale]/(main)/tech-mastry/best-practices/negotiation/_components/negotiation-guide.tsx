import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Gift,
  Briefcase,
} from "lucide-react";

const sections = [
  {
    title: "Préparation",
    icon: Briefcase,
    description: "Comment se préparer à la négociation salariale.",
    points: [
      {
        type: "do",
        text: "Recherchez les salaires du marché pour votre poste et niveau d'expérience",
      },
      {
        type: "do",
        text: "Préparez une liste de vos réalisations et compétences clés",
      },
      {
        type: "do",
        text: "Définissez votre fourchette salariale idéale",
      },
      {
        type: "dont",
        text: "Évitez, si possible, de donner un chiffre en premier : demandez d'abord la fourchette prévue pour le poste",
      },
    ],
    example: {
      situation: "On vous demande vos attentes salariales",
      good: "J'aimerais d'abord mieux comprendre le poste et les responsabilités",
      bad: "Je cherche un salaire de X euros",
    },
  },
  {
    title: "Négociation du Salaire",
    icon: DollarSign,
    description: "Stratégies pour négocier votre salaire efficacement.",
    points: [
      {
        type: "do",
        text: "Basez vos arguments sur votre valeur et votre expérience",
      },
      {
        type: "do",
        text: "Restez professionnel et positif",
      },
      {
        type: "do",
        text: "Soyez prêt à faire des compromis",
      },
      {
        type: "dont",
        text: "Ne mentez pas sur d'autres offres",
      },
    ],
    example: {
      situation: "L'offre est inférieure à vos attentes",
      good: "Basé sur mon expérience et la valeur que je peux apporter, je pensais plutôt à...",
      bad: "C'est trop bas, j'ai une meilleure offre ailleurs",
    },
  },
  {
    title: "Package Complet",
    icon: Gift,
    description: "Considérez tous les aspects de la rémunération.",
    points: [
      {
        type: "do",
        text: "Négociez les bonus, stock-options et autres avantages",
      },
      {
        type: "do",
        text: "Discutez des opportunités de formation et d'évolution",
      },
      {
        type: "do",
        text: "Clarifiez les conditions de travail (remote, flexibilité)",
      },
      {
        type: "dont",
        text: "Ne vous focalisez pas uniquement sur le salaire de base",
      },
    ],
    example: {
      situation: "Discussion des avantages",
      good: "Pouvons-nous discuter des opportunités de formation et d'évolution ?",
      bad: "Je veux uniquement parler du salaire",
    },
  },
];

const tips = [
  {
    title: "Timing",
    points: [
      "Attendez d'avoir une offre ferme avant de négocier",
      "Prenez le temps de réfléchir avant d'accepter",
      "Demandez un délai si vous avez d'autres processus en cours",
    ],
  },
  {
    title: "Communication",
    points: [
      "Restez professionnel et courtois",
      "Écoutez activement les propositions",
      "Exprimez clairement vos attentes",
    ],
  },
  {
    title: "Documentation",
    points: [
      "Demandez les détails par écrit",
      "Vérifiez tous les termes du contrat",
      "Clarifiez les conditions de performance et bonus",
    ],
  },
];

export function NegotiationGuide() {
  return (
    <div className="space-y-12">
      {/* Main Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <Card key={section.title} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <section.icon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">{section.title}</h2>
              </div>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Points Clés :</h3>
              <div className="grid gap-3">
                {section.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {point.type === "do" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <p className="text-muted-foreground">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Exemple :</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Situation</Badge>
                  <p className="text-muted-foreground">
                    {section.example.situation}
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <Badge className="bg-green-500/10 text-green-500 mb-1">
                        Bon exemple
                      </Badge>
                      <p className="text-muted-foreground">
                        {section.example.good}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <Badge className="bg-red-500/10 text-red-500 mb-1">
                        À éviter
                      </Badge>
                      <p className="text-muted-foreground">
                        {section.example.bad}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Conseils Supplémentaires</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {tips.map((tip) => (
            <Card key={tip.title} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{tip.title}</h3>
                <ul className="space-y-2">
                  {tip.points.map((point, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <Card className="p-6 bg-muted">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Conseil Pro</h3>
            <p className="text-muted-foreground">
              La négociation n&apos;est pas un conflit, mais une discussion pour
              trouver un accord mutuellement bénéfique. Restez professionnel,
              soyez préparé, et n&apos;oubliez pas que votre valeur ne se limite
              pas qu&apos;au salaire.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
