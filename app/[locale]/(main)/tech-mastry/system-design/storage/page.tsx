import { Metadata } from "next";
import { StorageHero } from "./_components/hero";
import { SqlVsNoSqlVisualization } from "./_components/sql-vs-nosql-visualization";
import { DatabaseShardingVisualization } from "./_components/database-sharding-visualization";
import { DatabaseReplicationVisualization } from "./_components/database-replication-visualization";
import { AcidCapVisualization } from "./_components/acid-cap-visualization";
import { DatabasePerformanceComparison } from "./_components/database-performance-comparison";

export const metadata: Metadata = {
  title: "Stockage & Bases de Données | System Design",
  description:
    "Comprendre les différents types de bases de données, leurs propriétés et leurs performances",
};

export default function StoragePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <StorageHero />

      <section className="space-y-12">
        <SqlVsNoSqlVisualization />
        <DatabaseShardingVisualization />
        <DatabaseReplicationVisualization />
        <AcidCapVisualization />
        <DatabasePerformanceComparison />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Concepts Clés de Stockage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Modèles de Données</h3>
            <p className="text-muted-foreground">
              Les modèles de données définissent comment les données sont
              organisées et manipulées. Les modèles relationnels utilisent des
              tables avec des schémas fixes, tandis que les modèles
              non-relationnels offrent plus de flexibilité avec des documents,
              des paires clé-valeur, des graphes ou des colonnes.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Indexation</h3>
            <p className="text-muted-foreground">
              L&apos;indexation améliore les performances des requêtes en créant
              des structures de données qui permettent de localiser rapidement
              les enregistrements. Les index peuvent être simples, composites,
              textuels ou spatiaux selon les besoins.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Transactions</h3>
            <p className="text-muted-foreground">
              Les transactions garantissent l&apos;intégrité des données en
              regroupant plusieurs opérations en une seule unité atomique. Elles
              sont essentielles pour les applications financières et les
              systèmes qui nécessitent une cohérence forte.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Partitionnement</h3>
            <p className="text-muted-foreground">
              Le partitionnement divise de grandes tables ou bases de données en
              segments plus petits pour améliorer les performances et la
              gestion. Il peut être horizontal (sharding) ou vertical selon les
              besoins de l&apos;application.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Considérations de Conception</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Choix de Base de Données</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Modèle de données requis (relationnel vs non-relationnel)</li>
              <li>Besoins en termes de cohérence et disponibilité</li>
              <li>Volume de données et taux de croissance</li>
              <li>Patterns d&apos;accès (lecture vs écriture)</li>
              <li>Exigences de requêtes (complexité, jointures)</li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Optimisation</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Conception de schéma efficace</li>
              <li>Stratégies d&apos;indexation appropriées</li>
              <li>Mise en cache des requêtes fréquentes</li>
              <li>Optimisation des requêtes</li>
              <li>Dénormalisation stratégique</li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Évolutivité</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Stratégies de sharding</li>
              <li>Réplication pour la disponibilité</li>
              <li>Séparation lecture/écriture</li>
              <li>Partitionnement vertical</li>
              <li>Migration et évolution du schéma</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
