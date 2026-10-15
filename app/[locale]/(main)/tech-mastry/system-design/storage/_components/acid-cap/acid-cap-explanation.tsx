"use client";

import {
  CheckCircle,
  Clock,
  Database,
  Layers,
  Lock,
  SplitSquareVertical,
} from "lucide-react";

export function AcidCapExplanation() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Propriétés ACID</h3>
        <p className="text-muted-foreground">
          ACID est un ensemble de propriétés qui garantissent la
          fiabilité des transactions dans une base de données. Ces
          propriétés sont essentielles pour les applications qui
          nécessitent une intégrité des données stricte.
        </p>
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Layers className="h-4 w-4 text-primary" />
            Atomicité (Atomicity)
          </h4>
          <p className="text-sm text-muted-foreground">
            Une transaction est traitée comme une unité indivisible qui
            réussit complètement ou échoue complètement. Il n&apos;y a
            pas d&apos;état intermédiaire.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-primary" />
            Cohérence (Consistency)
          </h4>
          <p className="text-sm text-muted-foreground">
            Une transaction amène la base de données d&apos;un état
            valide à un autre état valide, en respectant toutes les
            règles d&apos;intégrité définies.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Lock className="h-4 w-4 text-primary" />
            Isolation (Isolation)
          </h4>
          <p className="text-sm text-muted-foreground">
            Les transactions sont exécutées de manière isolée les unes
            des autres, comme si elles étaient séquentielles, même si
            elles sont exécutées en parallèle.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Database className="h-4 w-4 text-primary" />
            Durabilité (Durability)
          </h4>
          <p className="text-sm text-muted-foreground">
            Une fois qu&apos;une transaction est validée, ses effets
            sont permanents et survivent même en cas de panne système ou
            de coupure de courant.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Théorème CAP</h3>
        <p className="text-muted-foreground">
          Le théorème CAP stipule qu&apos;un système de base de données
          distribuée ne peut garantir simultanément que deux des trois
          propriétés suivantes : Cohérence, Disponibilité et Tolérance
          au Partitionnement.
        </p>
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-primary" />
            Cohérence (Consistency)
          </h4>
          <p className="text-sm text-muted-foreground">
            Tous les nœuds voient les mêmes données au même moment.
            Après une mise à jour, tous les clients voient la même
            version des données.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            Disponibilité (Availability)
          </h4>
          <p className="text-sm text-muted-foreground">
            Le système répond à chaque requête, réussie ou non. Chaque
            nœud non défaillant retourne une réponse raisonnable dans un
            délai raisonnable.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <SplitSquareVertical className="h-4 w-4 text-primary" />
            Tolérance au Partitionnement (Partition Tolerance)
          </h4>
          <p className="text-sm text-muted-foreground">
            Le système continue de fonctionner malgré la perte
            arbitraire de messages entre les nœuds ou la défaillance
            d&apos;une partie du réseau.
          </p>
        </div>
      </div>
    </div>
  );
}
