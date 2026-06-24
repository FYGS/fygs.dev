import {
  Shield,
  RefreshCcw,
  Award,
  Clock,
  Users,
  Headphones,
} from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Paiement sécurisé",
      description: "Stripe & SSL",
    },
    {
      icon: RefreshCcw,
      title: "Garantie 30 jours",
      description: "Satisfait ou remboursé",
    },
    {
      icon: Award,
      title: "Certificat inclus",
      description: "Attestation de réussite",
    },
    {
      icon: Clock,
      title: "Accès à vie",
      description: "Mises à jour incluses",
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Entraide & networking",
    },
    {
      icon: Headphones,
      title: "Support réactif",
      description: "Réponse sous 24h",
    },
  ];

  return (
    <section className="py-12 border-t">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="flex flex-col items-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <badge.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{badge.title}</p>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
