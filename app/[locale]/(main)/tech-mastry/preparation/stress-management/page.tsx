import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/preparation/stress-management");

const techniques = [
  {
    name: "Respiration 4-7-8",
    description: "Technique de relaxation rapide. Inspirez 4s, retenez 7s, expirez 8s. Répétez 3-4 fois.",
    when: "Avant l'entretien ou pendant un moment de panique",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "Visualisation Positive",
    description: "Fermez les yeux et visualisez-vous réussir l'entretien. Imaginez chaque détail : votre posture, votre voix calme, vos réponses fluides.",
    when: "La veille et le matin de l'entretien",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    name: "Recadrage Cognitif",
    description: "Transformez 'Je vais échouer' en 'C\'est une opportunité d\'apprentissage'. Le stress est de l'énergie — redirigez-la.",
    when: "Quand les pensées négatives apparaissent",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Grounding (5-4-3-2-1)",
    description: "Identifiez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez.",
    when: "Pendant un moment de stress intense",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    name: "Power Posing",
    description: "Adoptez une posture ouverte et redressée pendant 2 minutes. Les effets hormonaux (testostérone, cortisol) annoncés par les premières études n'ont pas été confirmés ; l'intérêt est surtout de relâcher les épaules et de vous sentir plus à l'aise.",
    when: "5 minutes avant l'entretien (en privé)",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Préparation Physique",
    description: "Exercice physique la veille, bon sommeil (7-8h), repas léger, hydratation. Le corps influence l'esprit.",
    when: "Les 24h avant l'entretien",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const mindsetShifts = [
  { from: "Je dois être parfait", to: "Je dois montrer comment je réfléchis" },
  { from: "Ils vont me piéger", to: "Ils veulent me voir réussir" },
  { from: "Je ne sais pas assez", to: "Personne ne sait tout, et c'est OK" },
  { from: "Si je bloque, c'est fini", to: "Bloquer et raisonner à voix haute est normal et attendu" },
  { from: "C'est un examen", to: "C'est une conversation entre professionnels" },
];

export default function StressManagementPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/10 text-pink-500">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Gestion du Stress</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Techniques courantes pour gérer le stress avant et pendant vos entretiens.
            Le stress est naturel — apprenez à le transformer en allié.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techniques.map((t) => (
            <Card key={t.name} className="p-6 space-y-3 border-border/40 hover:shadow-md transition-shadow">
              <h3 className={"font-semibold text-lg " + t.color}>{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <Badge className={t.bgColor + " " + t.color + " text-xs"}>
                {t.when}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Changements de Mindset</h2>
        <div className="space-y-3">
          {mindsetShifts.map((shift) => (
            <Card key={shift.from} className="p-4 border-border/40">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-red-500 line-through flex-1 min-w-[200px]">
                  {shift.from}
                </span>
                <span className="text-primary font-bold">→</span>
                <span className="text-sm text-green-500 font-medium flex-1 min-w-[200px]">
                  {shift.to}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
