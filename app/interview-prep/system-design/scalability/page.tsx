import { Metadata } from "next";
import { ScalabilityHero } from "./_components/hero";
import { LoadBalancerVisualization } from "./_components/load-balancer-visualization";
import { CachingVisualization } from "./_components/caching-visualization";

export const metadata: Metadata = {
  title: "Scalabilité & Performance | System Design",
  description:
    "Techniques pour concevoir des systèmes hautement évolutifs et performants",
};

export default function ScalabilityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ScalabilityHero />
      
      <section className="space-y-12">
        <CachingVisualization />
        <LoadBalancerVisualization />
      </section>
      
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Concepts Clés de Scalabilité</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Scalabilité Horizontale vs Verticale</h3>
            <p className="text-muted-foreground">
              La scalabilité horizontale consiste à ajouter plus de machines à votre pool de ressources, 
              tandis que la scalabilité verticale consiste à ajouter plus de puissance (CPU, RAM) à une 
              machine existante. La scalabilité horizontale est souvent plus efficace pour les systèmes 
              distribués modernes.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Stateless vs Stateful</h3>
            <p className="text-muted-foreground">
              Les services stateless ne stockent pas d&apos;état entre les requêtes, ce qui les rend 
              plus faciles à mettre à l&apos;échelle horizontalement. Les services stateful maintiennent 
              un état, ce qui complique la mise à l&apos;échelle mais est nécessaire pour certaines 
              fonctionnalités.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Partitionnement de Données</h3>
            <p className="text-muted-foreground">
              Le partitionnement (sharding) divise une grande base de données en parties plus petites 
              et gérables. Cela permet de distribuer la charge sur plusieurs serveurs et d&apos;améliorer 
              les performances globales du système.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Réplication</h3>
            <p className="text-muted-foreground">
              La réplication consiste à maintenir plusieurs copies des mêmes données sur différents 
              serveurs. Cela améliore la disponibilité et la durabilité, et peut également améliorer 
              les performances en permettant de lire à partir de répliques.
            </p>
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Techniques Avancées</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">CDN (Content Delivery Network)</h3>
            <p className="text-muted-foreground">
              Un réseau de serveurs distribués géographiquement qui délivre du contenu web aux 
              utilisateurs en fonction de leur localisation. Les CDN réduisent la latence et 
              améliorent les performances en mettant en cache le contenu statique près des utilisateurs.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Mise en Cache Distribuée</h3>
            <p className="text-muted-foreground">
              Systèmes comme Redis ou Memcached qui fournissent un stockage en mémoire rapide et 
              distribué. Ils peuvent être utilisés pour mettre en cache des résultats de requêtes, 
              des sessions utilisateur, ou d&apos;autres données fréquemment accédées.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h3 className="text-xl font-semibold">Asynchronisme & Files d&apos;Attente</h3>
            <p className="text-muted-foreground">
              L&apos;utilisation de files d&apos;attente (comme RabbitMQ, Kafka) permet de découpler 
              les composants du système et de gérer les pics de charge. Les tâches intensives peuvent 
              être traitées de manière asynchrone pour améliorer la réactivité.
            </p>
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Considérations de Performance</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Métriques Clés</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Latence</span> - Temps nécessaire pour traiter une requête
            </li>
            <li>
              <span className="font-medium">Débit</span> - Nombre de requêtes traitées par unité de temps
            </li>
            <li>
              <span className="font-medium">Disponibilité</span> - Pourcentage de temps pendant lequel le système est opérationnel
            </li>
            <li>
              <span className="font-medium">Utilisation des ressources</span> - CPU, mémoire, disque, réseau
            </li>
            <li>
              <span className="font-medium">Coût</span> - Dépenses opérationnelles et d&apos;infrastructure
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Optimisations Courantes</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Optimisation des requêtes de base de données</li>
            <li>Compression et minification des ressources</li>
            <li>Lazy loading et pagination</li>
            <li>Mise en cache à plusieurs niveaux</li>
            <li>Optimisation des images et médias</li>
            <li>Réduction des requêtes réseau</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
