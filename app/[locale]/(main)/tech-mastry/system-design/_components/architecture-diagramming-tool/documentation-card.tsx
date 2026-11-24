import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  Database,
  FileText,
  HardDrive,
  Lock,
  Network,
  Server,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

export function DocumentationCard() {
  return (
  <Card className="backdrop-blur-xl bg-background/80 border-border/50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <span>Documentation de conception système</span>
      </CardTitle>
      <CardDescription>
        Principes et bonnes pratiques de conception système
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Patterns de scalabilité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Server className="h-4 w-4" />
                Scalabilité horizontale
              </h4>
              <p className="text-sm text-muted-foreground">
                Ajouter des machines pour absorber l&apos;augmentation de charge. Elle monte généralement plus loin et tolère mieux les pannes que la scalabilité verticale, au prix d&apos;une complexité accrue (état partagé, coordination, répartition de charge).
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                Sharding de base de données
              </h4>
              <p className="text-sm text-muted-foreground">
                Découper une base de données en fragments plus petits, répartis sur plusieurs serveurs.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Points de sécurité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                Authentification et autorisation
              </h4>
              <p className="text-sm text-muted-foreground">
                Mettre en place une authentification solide (OAuth 2.0 / OIDC, JWT) et des contrôles d&apos;autorisation côté serveur pour protéger les ressources.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Network className="h-4 w-4" />
                Limitation de débit (rate limiting)
              </h4>
              <p className="text-sm text-muted-foreground">
                Prévenir les abus en limitant le nombre de requêtes qu&apos;un utilisateur peut faire sur une période donnée.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Optimisation des performances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4" />
                Stratégies de cache
              </h4>
              <p className="text-sm text-muted-foreground">
                Utiliser Redis ou Memcached pour les données fréquemment lues et prévoir une invalidation du cache adaptée.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4" />
                Mise en place d&apos;un CDN
              </h4>
              <p className="text-sm text-muted-foreground">
                Distribuer le contenu géographiquement pour réduire la latence et améliorer l&apos;expérience utilisateur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
}
