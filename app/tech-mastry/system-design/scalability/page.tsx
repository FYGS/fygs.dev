import { Metadata } from "next";
import { CachingVisualization } from "./_components/caching-visualization";
import { ScalabilityHero } from "./_components/hero";
import { LoadBalancerVisualization } from "./_components/load-balancer-visualization";

export const metadata: Metadata = {
  title: "Scalabilité & Performance | System Design",
  description:
    "Techniques pour concevoir des systèmes hautement évolutifs et performants",
};

export default function ScalabilityPage() {
  return (
    <main className="container py-8 space-y-16 animate-fadeIn">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 -z-10"></div>

      <ScalabilityHero />

      <section className="space-y-16 relative">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 -z-10 opacity-30"></div>
        <CachingVisualization />
        <LoadBalancerVisualization />
      </section>

      <section className="space-y-8 relative py-8">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 -z-10 opacity-30"></div>

        <h2 className="text-3xl font-bold relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Concepts Clés de Scalabilité
          </span>
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="10" x="3" y="3" rx="1" />
                  <rect width="18" height="8" x="3" y="13" rx="1" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold group-hover:text-indigo-500 transition-colors duration-300">
                  Scalabilité Horizontale vs Verticale
                </h3>
                <p className="text-muted-foreground">
                  La scalabilité horizontale consiste à ajouter plus de machines
                  à votre pool de ressources, tandis que la scalabilité
                  verticale consiste à ajouter plus de puissance (CPU, RAM) à
                  une machine existante. La scalabilité horizontale est souvent
                  plus efficace pour les systèmes distribués modernes.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-purple-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                  <line x1="18" x2="12" y1="9" y2="15" />
                  <line x1="12" x2="18" y1="9" y2="15" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold group-hover:text-purple-500 transition-colors duration-300">
                  Stateless vs Stateful
                </h3>
                <p className="text-muted-foreground">
                  Les services stateless ne stockent pas d&apos;état entre les
                  requêtes, ce qui les rend plus faciles à mettre à
                  l&apos;échelle horizontalement. Les services stateful
                  maintiennent un état, ce qui complique la mise à
                  l&apos;échelle mais est nécessaire pour certaines
                  fonctionnalités.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-blue-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="8" x="2" y="2" rx="1" />
                  <path d="M5 10v4a1 1 0 0 0 1 1h4" />
                  <path d="M5 14a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4" />
                  <path d="M14 5h4a1 1 0 0 1 1 1v4" />
                  <path d="M14 10h1a1 1 0 0 1 1 1v1" />
                  <path d="M14 19h4a1 1 0 0 0 1-1v-4" />
                  <path d="M14 14h1a1 1 0 0 1 1 1v1" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold group-hover:text-blue-500 transition-colors duration-300">
                  Partitionnement de Données
                </h3>
                <p className="text-muted-foreground">
                  Le partitionnement (sharding) divise une grande base de
                  données en parties plus petites et gérables. Cela permet de
                  distribuer la charge sur plusieurs serveurs et
                  d&apos;améliorer les performances globales du système.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-cyan-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-cyan-500/10 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10 text-cyan-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold group-hover:text-cyan-500 transition-colors duration-300">
                  Réplication
                </h3>
                <p className="text-muted-foreground">
                  La réplication consiste à maintenir plusieurs copies des mêmes
                  données sur différents serveurs. Cela améliore la
                  disponibilité et la durabilité, et peut également améliorer
                  les performances en permettant de lire à partir de répliques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 relative py-8">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 -z-10 opacity-30"></div>

        <h2 className="text-3xl font-bold relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Techniques Avancées
          </span>
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-purple-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" x2="22" y1="12" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold group-hover:text-purple-500 transition-colors duration-300">
                  CDN (Content Delivery Network)
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-full mt-1 mb-3 group-hover:w-24 transition-all duration-300"></div>
                <p className="text-muted-foreground">
                  Un réseau de serveurs distribués géographiquement qui délivre
                  du contenu web aux utilisateurs en fonction de leur
                  localisation. Les CDN réduisent la latence et améliorent les
                  performances en mettant en cache le contenu statique près des
                  utilisateurs.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-pink-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v8L8 8" />
                  <path d="M12 2v8l4-2" />
                  <path d="M20 10v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
                  <path d="M18 16v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold group-hover:text-pink-500 transition-colors duration-300">
                  Mise en Cache Distribuée
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-pink-500/50 to-rose-500/50 rounded-full mt-1 mb-3 group-hover:w-24 transition-all duration-300"></div>
                <p className="text-muted-foreground">
                  Systèmes comme Redis ou Memcached qui fournissent un stockage
                  en mémoire rapide et distribué. Ils peuvent être utilisés pour
                  mettre en cache des résultats de requêtes, des sessions
                  utilisateur, ou d&apos;autres données fréquemment accédées.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-rose-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 7 3 5" />
                  <path d="M9 5 5 9" />
                  <path d="m13 13-4 4" />
                  <path d="m17 17-2 2" />
                  <path d="M15 5h4v4" />
                  <path d="M19 9v4" />
                  <path d="M19 17v2" />
                  <path d="M5 19v-4" />
                  <path d="M9 19h4" />
                  <path d="M5 15v-2" />
                  <path d="M5 9V5" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold group-hover:text-rose-500 transition-colors duration-300">
                  Asynchronisme & Files d&apos;Attente
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-rose-500/50 to-orange-500/50 rounded-full mt-1 mb-3 group-hover:w-24 transition-all duration-300"></div>
                <p className="text-muted-foreground">
                  L&apos;utilisation de files d&apos;attente (comme RabbitMQ,
                  Kafka) permet de découpler les composants du système et de
                  gérer les pics de charge. Les tâches intensives peuvent être
                  traitées de manière asynchrone pour améliorer la réactivité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 relative py-8">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/5 via-transparent to-teal-500/5 -z-10 opacity-30"></div>

        <h2 className="text-3xl font-bold relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
            Considérations de Performance
          </span>
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-blue-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </div>
              <span>Métriques Clés</span>
            </h3>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div>
                  <span className="font-medium text-blue-500">Latence</span> -
                  Temps nécessaire pour traiter une requête
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div>
                  <span className="font-medium text-cyan-500">Débit</span> -
                  Nombre de requêtes traitées par unité de temps
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div>
                  <span className="font-medium text-teal-500">
                    Disponibilité
                  </span>{" "}
                  - Pourcentage de temps pendant lequel le système est
                  opérationnel
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                  4
                </div>
                <div>
                  <span className="font-medium text-emerald-500">
                    Utilisation des ressources
                  </span>{" "}
                  - CPU, mémoire, disque, réseau
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                  5
                </div>
                <div>
                  <span className="font-medium text-green-500">Coût</span> -
                  Dépenses opérationnelles et d&apos;infrastructure
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-teal-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/10 text-teal-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <span>Optimisations Courantes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 20h20" />
                    <path d="M5 20V8.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V20" />
                    <path d="M13 20V4.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V20" />
                  </svg>
                </div>
                <span className="text-sm">
                  Optimisation des requêtes de base de données
                </span>
              </div>

              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                    <path d="M4 12h16" />
                    <path d="M9 12v4" />
                    <path d="M15 12v4" />
                    <path d="M13 8V4" />
                  </svg>
                </div>
                <span className="text-sm">
                  Compression et minification des ressources
                </span>
              </div>

              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                </div>
                <span className="text-sm">Lazy loading et pagination</span>
              </div>

              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                    <path d="M18 9v6" />
                    <path d="M15 9v6" />
                  </svg>
                </div>
                <span className="text-sm">
                  Mise en cache à plusieurs niveaux
                </span>
              </div>

              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <span className="text-sm">
                  Optimisation des images et médias
                </span>
              </div>

              <div className="p-3 rounded-lg border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors duration-300 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 2v6" />
                    <path d="M15 8v6" />
                    <path d="M9 18v4" />
                    <path d="M15 14v4" />
                    <path d="M3 8h6" />
                    <path d="M15 8h6" />
                    <path d="M3 18h6" />
                    <path d="M15 18h6" />
                  </svg>
                </div>
                <span className="text-sm">Réduction des requêtes réseau</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
