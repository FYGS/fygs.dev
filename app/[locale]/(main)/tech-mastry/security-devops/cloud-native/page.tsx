import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Cloud } from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud Native | TechMastry",
  description:
    "Architecture 12-Factor, Serverless et bonnes pratiques Cloud Native",
};

const twelveFactor = [
  {
    num: "I",
    name: "Codebase",
    desc: "Un dépôt unique suivi en contrôle de version, plusieurs déploiements.",
  },
  {
    num: "II",
    name: "Dependencies",
    desc: "Déclarez et isolez explicitement les dépendances.",
  },
  {
    num: "III",
    name: "Config",
    desc: "Stockez la configuration dans l'environnement, pas dans le code.",
  },
  {
    num: "IV",
    name: "Backing Services",
    desc: "Traitez les services externes comme des ressources attachées.",
  },
  {
    num: "V",
    name: "Build, Release, Run",
    desc: "Séparez strictement les étapes de build et d'exécution.",
  },
  {
    num: "VI",
    name: "Processes",
    desc: "Exécutez l'app comme un ou plusieurs processus sans état.",
  },
  {
    num: "VII",
    name: "Port Binding",
    desc: "Exportez les services via le port binding.",
  },
  {
    num: "VIII",
    name: "Concurrency",
    desc: "Scalez horizontalement via le modèle de processus.",
  },
  {
    num: "IX",
    name: "Disposability",
    desc: "Maximisez la robustesse avec un démarrage rapide et un arrêt gracieux.",
  },
  {
    num: "X",
    name: "Dev/Prod Parity",
    desc: "Gardez dev, staging et production aussi similaires que possible.",
  },
  {
    num: "XI",
    name: "Logs",
    desc: "Traitez les logs comme des flux d'événements.",
  },
  {
    num: "XII",
    name: "Admin Processes",
    desc: "Exécutez les tâches d'admin comme des processus ponctuels.",
  },
];

export default function CloudNativePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <Cloud className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Cloud Native</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Principes d&apos;architecture pour des applications nativement
            conçues pour le cloud : scalables, résilientes et observables.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Les 12 Facteurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {twelveFactor.map((f) => (
            <Card
              key={f.num}
              className="p-5 space-y-2 border-border/40 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 text-sm font-bold">
                  {f.num}
                </span>
                <h3 className="font-semibold">{f.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">
          Serverless : Quand l&apos;utiliser ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-green-500/30 bg-green-500/5">
            <h3 className="font-semibold text-green-500">✅ Bon pour</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• APIs avec trafic variable ou imprévisible</li>
              <li>• Traitements événementiels (uploads, webhooks)</li>
              <li>• Jobs CRON et tâches planifiées</li>
              <li>• Prototypage rapide et MVPs</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3 border-red-500/30 bg-red-500/5">
            <h3 className="font-semibold text-red-500">❌ Éviter pour</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Applications avec latence critique (cold starts)</li>
              <li>• Workloads intensifs en calcul (ML, vidéo)</li>
              <li>• Connexions longues (WebSocket)</li>
              <li>• Applications avec état (stateful)</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
