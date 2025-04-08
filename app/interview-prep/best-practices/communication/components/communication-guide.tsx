import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const sections = [
  {
    title: "Clarification des Problèmes",
    description: "Comment poser les bonnes questions pour bien comprendre le problème.",
    tips: [
      {
        type: "do",
        text: "Posez des questions sur les cas limites et les contraintes",
      },
      {
        type: "do",
        text: "Demandez des exemples concrets si nécessaire",
      },
      {
        type: "dont",
        text: "Ne supposez pas connaître tous les détails sans demander",
      },
    ],
    example: {
      situation: "On vous demande de créer une fonction de tri",
      good: "Quelles sont les contraintes de taille ? Le tableau peut-il contenir des doublons ?",
      bad: "Commencer directement sans comprendre les exigences spécifiques",
    },
  },
  {
    title: "Pensée à Voix Haute",
    description: "L'importance d'expliquer votre raisonnement pendant que vous résolvez le problème.",
    tips: [
      {
        type: "do",
        text: "Expliquez votre approche avant de commencer à coder",
      },
      {
        type: "do",
        text: "Partagez vos réflexions sur les compromis possibles",
      },
      {
        type: "dont",
        text: "Ne restez pas silencieux pendant de longues périodes",
      },
    ],
    example: {
      situation: "Résolution d'un problème d'optimisation",
      good: "Je pense utiliser un hashmap pour optimiser la recherche...",
      bad: "Coder en silence sans expliquer votre stratégie",
    },
  },
  {
    title: "Questions Pertinentes",
    description: "Comment et quand poser des questions à l'intervieweur.",
    tips: [
      {
        type: "do",
        text: "Posez des questions techniques pertinentes sur l'implémentation",
      },
      {
        type: "do",
        text: "Demandez des clarifications sur les exigences non fonctionnelles",
      },
      {
        type: "dont",
        text: "Ne posez pas de questions dont les réponses sont évidentes",
      },
    ],
    example: {
      situation: "Discussion sur l'architecture d'un système",
      good: "Comment gérer la mise à l'échelle de cette solution ?",
      bad: "Pouvons-nous utiliser une base de données ? (trop vague)",
    },
  },
];

export function CommunicationGuide() {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <Card key={section.title} className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {section.title}
            </h2>
            <p className="text-muted-foreground">
              {section.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Conseils :</h3>
            <div className="grid gap-3">
              {section.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  {tip.type === "do" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <p className="text-muted-foreground">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Exemple :</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Situation</Badge>
                <p className="text-muted-foreground">{section.example.situation}</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <Badge className="bg-green-500/10 text-green-500 mb-1">Bon exemple</Badge>
                    <p className="text-muted-foreground">{section.example.good}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <Badge className="bg-red-500/10 text-red-500 mb-1">À éviter</Badge>
                    <p className="text-muted-foreground">{section.example.bad}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-6 bg-muted">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Conseil Pro</h3>
            <p className="text-muted-foreground">
              La communication est souvent aussi importante que la solution technique elle-même. 
              Les recruteurs évaluent non seulement vos compétences techniques, mais aussi 
              votre capacité à collaborer et à expliquer clairement vos idées.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
