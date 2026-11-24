import { DistributedCaseStudies } from "./_components/case-studies";
import { EventDrivenVisualization } from "./_components/event-driven-visualization";
import { DistributedHero } from "./_components/hero";
import { MicroservicesVisualization } from "./_components/microservices-visualization";
import { ServiceMeshVisualization } from "./_components/service-mesh-visualization";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/distributed");

export default function DistributedArchitecturePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <DistributedHero />

      <section className="space-y-12">
        <MicroservicesVisualization />
        <EventDrivenVisualization />
        <ServiceMeshVisualization />
        <DistributedCaseStudies />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Principes Fondamentaux</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Découplage</h3>
            <p className="text-muted-foreground">
              Le découplage consiste à réduire les dépendances entre les
              composants d&apos;un système. Dans une architecture distribuée,
              les services doivent être aussi indépendants que possible,
              communiquant via des interfaces bien définies. Cela permet de
              développer, déployer et mettre à l&apos;échelle chaque service
              indépendamment.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Communication Asynchrone</h3>
            <p className="text-muted-foreground">
              La communication asynchrone permet aux services de fonctionner
              sans attendre les réponses des autres services. Cela améliore la
              résilience et la performance globale du système. Les files
              d&apos;attente de messages (comme Kafka ou RabbitMQ) sont souvent
              utilisées pour implémenter ce pattern.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Tolérance aux Pannes</h3>
            <p className="text-muted-foreground">
              Dans un système distribué, les défaillances sont inévitables. La
              tolérance aux pannes consiste à concevoir le système pour
              qu&apos;il continue à fonctionner même lorsque certains composants
              échouent. Cela implique des stratégies comme la redondance, les
              circuit breakers, et les retries avec backoff exponentiel.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cohérence Éventuelle</h3>
            <p className="text-muted-foreground">
              La cohérence éventuelle est un modèle de cohérence qui garantit
              que, en l&apos;absence de nouvelles mises à jour, tous les accès à
              une donnée finiront par retourner la dernière valeur mise à jour.
              Ce modèle est souvent utilisé dans les systèmes distribués pour
              améliorer la disponibilité et les performances.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Patterns d&apos;Architecture</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">API Gateway</h3>
            <p className="text-muted-foreground">
              Un point d&apos;entrée unique pour tous les clients, qui route les
              requêtes vers les services appropriés, gère
              l&apos;authentification, et peut effectuer d&apos;autres fonctions
              transversales comme la limitation de débit ou la transformation
              des requêtes/réponses.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Service Mesh</h3>
            <p className="text-muted-foreground">
              Une couche d&apos;infrastructure dédiée à la gestion de la
              communication service-à-service. Il gère des aspects comme la
              découverte de services, l&apos;équilibrage de charge, le
              chiffrement, l&apos;authentification/autorisation, et
              l&apos;observabilité.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Event Sourcing</h3>
            <p className="text-muted-foreground">
              Un pattern où les changements d&apos;état sont stockés comme une
              séquence d&apos;événements. L&apos;état actuel peut être
              reconstruit en rejouant ces événements. Ce pattern est souvent
              utilisé avec CQRS (Command Query Responsibility Segregation) pour
              séparer les opérations de lecture et d&apos;écriture.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Défis et Considérations</h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Complexité Opérationnelle</h3>
          <p className="text-muted-foreground">
            Les systèmes distribués sont intrinsèquement plus complexes à opérer
            que les systèmes monolithiques. Ils nécessitent des outils et des
            pratiques avancés pour le déploiement, la surveillance, le débogage
            et la gestion des incidents. Des plateformes comme Kubernetes et des
            outils d&apos;observabilité comme Prometheus, Grafana, et Jaeger
            sont essentiels.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Transactions Distribuées</h3>
          <p className="text-muted-foreground">
            Maintenir la cohérence des données à travers plusieurs services est
            un défi majeur. Les transactions ACID traditionnelles ne sont
            généralement pas pratiques dans les systèmes distribués. Des
            patterns comme Saga ou les transactions compensatoires sont utilisés
            pour gérer les transactions qui s&apos;étendent sur plusieurs
            services.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Observabilité</h3>
          <p className="text-muted-foreground">
            L&apos;observabilité est la capacité à comprendre l&apos;état
            interne d&apos;un système en observant ses sorties. Dans les
            systèmes distribués, cela implique la collecte et l&apos;analyse de
            logs, métriques et traces distribuées. Une bonne observabilité est
            cruciale pour diagnostiquer les problèmes dans des environnements
            complexes.
          </p>
        </div>
      </section>
    </div>
  );
}
