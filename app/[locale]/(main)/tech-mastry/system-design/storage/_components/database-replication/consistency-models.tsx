import { Clock, Shield, Zap } from "lucide-react";

export function ConsistencyModels() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 rounded-lg border bg-card space-y-3">
        <h4 className="font-medium flex items-center gap-1">
          <Zap className="h-4 w-4 text-primary" />
          Réplication Asynchrone
        </h4>
        <p className="text-sm text-muted-foreground">
          Le nœud principal confirme l&apos;écriture avant de la
          propager aux réplicas.
        </p>
        <div className="space-y-1">
          <div className="text-xs font-medium">Avantages</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>Meilleures performances d&apos;écriture</li>
            <li>Pas de blocage si un réplica est indisponible</li>
          </ul>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Inconvénients</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>Cohérence éventuelle seulement</li>
            <li>Risque de perte de données en cas de panne</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-card space-y-3">
        <h4 className="font-medium flex items-center gap-1">
          <Clock className="h-4 w-4 text-primary" />
          Réplication Semi-Synchrone
        </h4>
        <p className="text-sm text-muted-foreground">
          Le nœud principal attend la confirmation d&apos;au moins un
          réplica avant de valider l&apos;écriture.
        </p>
        <div className="space-y-1">
          <div className="text-xs font-medium">Avantages</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>Bon équilibre entre performance et durabilité</li>
            <li>
              Garantie qu&apos;au moins un réplica a les données
            </li>
          </ul>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Inconvénients</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>
              Latence d&apos;écriture plus élevée qu&apos;en
              asynchrone
            </li>
            <li>Cohérence partielle entre les réplicas</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-card space-y-3">
        <h4 className="font-medium flex items-center gap-1">
          <Shield className="h-4 w-4 text-primary" />
          Réplication Synchrone
        </h4>
        <p className="text-sm text-muted-foreground">
          Le nœud principal attend la confirmation de tous les
          réplicas avant de valider l&apos;écriture.
        </p>
        <div className="space-y-1">
          <div className="text-xs font-medium">Avantages</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>Cohérence forte entre tous les nœuds</li>
            <li>Pas de perte de données en cas de panne</li>
          </ul>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Inconvénients</div>
          <ul className="text-xs list-disc pl-4 text-muted-foreground">
            <li>Performances d&apos;écriture réduites</li>
            <li>Indisponibilité si un réplica est hors service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
