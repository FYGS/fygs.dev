"use client";

import {
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Server,
  Shield,
} from "lucide-react";
import type { ServiceMeshType } from "./types";

export function ServiceMeshExplanation({ serviceMeshType }: {
  serviceMeshType: ServiceMeshType;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Qu&apos;est-ce qu&apos;un Service Mesh?
      </h3>
      <p className="text-muted-foreground">
        Un Service Mesh est une couche d&apos;infrastructure dédiée qui
        gère la communication entre les services dans une architecture
        de microservices. Il déplace la logique de communication du code
        de l&apos;application vers une couche d&apos;infrastructure,
        permettant aux développeurs de se concentrer sur la logique
        métier.
      </p>

      <h3 className="text-lg font-semibold mt-6">Composants Clés</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          <span className="font-medium">Proxies (Sidecars)</span> -
          Petits serveurs proxy qui s&apos;exécutent à côté de chaque
          service
        </li>
        <li>
          <span className="font-medium">Plan de données</span> -
          Ensemble des proxies qui gèrent le trafic réseau
        </li>
        <li>
          <span className="font-medium">Plan de contrôle</span> -
          Composant central qui configure et coordonne les proxies
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Plan de Contrôle</h3>
      <p className="text-muted-foreground">
        Le plan de contrôle est le cerveau du service mesh. Il gère la
        configuration, les politiques et la coordination de tous les
        proxies (sidecars) dans le plan de données.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "istio"
                      ? "bg-blue-950/30 border-blue-800"
                      : "bg-gray-800/30 border-gray-700"
                  }`}
        >
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Istio (Istiod)
          </h4>
          <p className="text-xs text-muted-foreground">
            Istiod fournit la découverte de services, la configuration
            et la gestion des certificats. Il convertit les règles de
            haut niveau en configurations pour les proxies Envoy.
          </p>
        </div>
        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "linkerd"
                      ? "bg-green-950/30 border-green-800"
                      : "bg-gray-800/30 border-gray-700"
                  }`}
        >
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Linkerd Control Plane
          </h4>
          <p className="text-xs text-muted-foreground">
            Composé de plusieurs microservices spécialisés, il gère
            l&apos;identité, les politiques de trafic et fournit une API
            pour la configuration des proxies.
          </p>
        </div>
        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "consul"
                      ? "bg-amber-950/30 border-amber-800"
                      : "bg-gray-800/30 border-gray-700"
                  }`}
        >
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            Consul Server
          </h4>
          <p className="text-xs text-muted-foreground">
            Fournit un registre de services, une configuration KV et des
            règles d&apos;intention qui définissent quels services
            peuvent communiquer entre eux.
          </p>
        </div>
        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "app-mesh"
                      ? "bg-pink-950/30 border-pink-800"
                      : "bg-gray-800/30 border-gray-700"
                  }`}
        >
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            AWS App Mesh
          </h4>
          <p className="text-xs text-muted-foreground">
            Service géré par AWS qui configure les proxies Envoy,
            s&apos;intègre avec les services AWS et fournit une gestion
            centralisée du trafic.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">
        Fonctionnalités Principales
      </h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          <span className="font-medium">Gestion du trafic</span> -
          Équilibrage de charge, routage, découverte de services,
          contrôle de débit
        </li>
        <li>
          <span className="font-medium">Sécurité</span> -
          Authentification mutuelle TLS, autorisation, chiffrement
        </li>
        <li>
          <span className="font-medium">Observabilité</span> -
          Métriques, traces, journaux pour surveiller le comportement du
          système
        </li>
        <li>
          <span className="font-medium">Résilience</span> -
          Disjoncteurs, nouvelles tentatives, délais d&apos;attente pour
          améliorer la stabilité
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Avantages</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          Séparation des préoccupations entre la logique métier et la
          communication réseau
        </li>
        <li>
          Cohérence des politiques de sécurité et de résilience dans
          tout le système
        </li>
        <li>Visibilité accrue sur les interactions entre services</li>
        <li>
          Facilité de mise à jour et de configuration sans modifier le
          code des services
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">
        Implémentations Populaires
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "istio"
                      ? "bg-blue-900/20 border-blue-800"
                      : "bg-card border-border"
                  }`}
        >
          <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Istio
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Solution complète développée par Google, IBM et Lyft,
            devenue un projet CNCF.
          </p>
          <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
            <li>Gestion avancée du trafic avec canary deployments</li>
            <li>Sécurité robuste avec mTLS automatique</li>
            <li>Observabilité intégrée avec Prometheus et Grafana</li>
            <li>Circuit breaking et fault injection</li>
            <li>
              Support pour WebAssembly (Wasm) pour des extensions
              personnalisées
            </li>
          </ul>
          <div className="text-xs bg-blue-900/20 p-2 rounded border border-blue-800">
            <span className="font-medium">Architecture:</span> Istiod
            (plan de contrôle) + Envoy (proxies sidecar)
            <br />
            <span className="font-medium">Cas d&apos;usage:</span>{" "}
            Grands clusters Kubernetes avec besoins avancés
            <br />
            <span className="font-medium">Complexité:</span> Élevée,
            mais offre le plus de fonctionnalités
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "linkerd"
                      ? "bg-green-900/20 border-green-800"
                      : "bg-card border-border"
                  }`}
        >
          <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Linkerd
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Solution légère et facile à utiliser par Buoyant, projet
            CNCF gradué.
          </p>
          <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
            <li>
              Faible empreinte mémoire et CPU (10x plus léger
              qu&apos;Istio)
            </li>
            <li>
              Retries automatiques basés sur la latence et le taux
              d&apos;erreur
            </li>
            <li>Proxy écrit en Rust pour des performances optimales</li>
            <li>Installation et configuration simplifiées</li>
            <li>
              Mesures de latence précises avec histogrammes haute
              résolution
            </li>
          </ul>
          <div className="text-xs bg-green-900/20 p-2 rounded border border-green-800">
            <span className="font-medium">Architecture:</span> Control
            plane multi-composants + linkerd-proxy (sidecar)
            <br />
            <span className="font-medium">Cas d&apos;usage:</span>{" "}
            Clusters où la simplicité et les performances sont
            prioritaires
            <br />
            <span className="font-medium">Complexité:</span> Faible,
            facile à adopter et à maintenir
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "consul"
                      ? "bg-amber-900/20 border-amber-800"
                      : "bg-card border-border"
                  }`}
        >
          <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            Consul Connect
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Solution par HashiCorp intégrée à Consul, fonctionne au-delà
            de Kubernetes.
          </p>
          <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
            <li>
              Découverte de services native et gestion de configuration
            </li>
            <li>
              Contrôle d&apos;accès basé sur les intentions
              (service-to-service)
            </li>
            <li>
              Fonctionne dans des environnements multi-cloud et hybrides
            </li>
            <li>
              Intégration avec l&apos;écosystème HashiCorp (Vault,
              Nomad, etc.)
            </li>
            <li>Support pour les applications non-conteneurisées</li>
          </ul>
          <div className="text-xs bg-amber-900/20 p-2 rounded border border-amber-800">
            <span className="font-medium">Architecture:</span> Consul
            servers (control plane) + Envoy (data plane)
            <br />
            <span className="font-medium">Cas d&apos;usage:</span>{" "}
            Environnements hétérogènes (VMs, K8s, bare metal)
            <br />
            <span className="font-medium">Complexité:</span> Moyenne,
            plus complexe que Linkerd mais plus flexible
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
                    serviceMeshType === "app-mesh"
                      ? "bg-pink-900/20 border-pink-800"
                      : "bg-card border-border"
                  }`}
        >
          <h4 className="font-medium text-pink-400 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            AWS App Mesh
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Solution native pour AWS basée sur Envoy, entièrement gérée
            par AWS.
          </p>
          <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
            <li>
              Intégration native avec les services AWS (ECS, EKS, EC2,
              etc.)
            </li>
            <li>
              Routage pondéré pour les déploiements progressifs
              (blue/green, canary)
            </li>
            <li>Observabilité avec AWS X-Ray et CloudWatch</li>
            <li>Configuration via AWS Cloud Formation ou CDK</li>
            <li>Facturation basée sur les ressources utilisées</li>
          </ul>
          <div className="text-xs bg-pink-900/20 p-2 rounded border border-pink-800">
            <span className="font-medium">Architecture:</span> Service
            AWS géré (control plane) + Envoy (sidecar)
            <br />
            <span className="font-medium">Cas d&apos;usage:</span>{" "}
            Applications exécutées sur AWS uniquement
            <br />
            <span className="font-medium">Complexité:</span> Moyenne,
            simplifiée par l&apos;intégration AWS
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">
        Comparaison des Implémentations
      </h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800">
              <th className="p-2 text-left border">Critère</th>
              <th className="p-2 text-left border text-blue-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Istio
                </div>
              </th>
              <th className="p-2 text-left border text-green-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Linkerd
                </div>
              </th>
              <th className="p-2 text-left border text-amber-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Consul Connect
                </div>
              </th>
              <th className="p-2 text-left border text-pink-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  AWS App Mesh
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border font-medium">Proxy utilisé</td>
              <td className="p-2 border">Envoy</td>
              <td className="p-2 border">linkerd-proxy (Rust)</td>
              <td className="p-2 border">Envoy</td>
              <td className="p-2 border">Envoy</td>
            </tr>
            <tr className="bg-slate-800/30">
              <td className="p-2 border font-medium">
                Empreinte mémoire
              </td>
              <td className="p-2 border">Haute</td>
              <td className="p-2 border">Très basse</td>
              <td className="p-2 border">Moyenne</td>
              <td className="p-2 border">Moyenne</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">
                Facilité d&apos;installation
              </td>
              <td className="p-2 border">Complexe</td>
              <td className="p-2 border">Simple</td>
              <td className="p-2 border">Moyenne</td>
              <td className="p-2 border">Simple (sur AWS)</td>
            </tr>
            <tr className="bg-slate-800/30">
              <td className="p-2 border font-medium">
                Fonctionnalités
              </td>
              <td className="p-2 border">Très complètes</td>
              <td className="p-2 border">Essentielles</td>
              <td className="p-2 border">Complètes</td>
              <td className="p-2 border">Limitées à AWS</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">Environnements</td>
              <td className="p-2 border">Kubernetes</td>
              <td className="p-2 border">Kubernetes</td>
              <td className="p-2 border">K8s, VMs, bare metal</td>
              <td className="p-2 border">ECS, EKS, EC2</td>
            </tr>
            <tr className="bg-slate-800/30">
              <td className="p-2 border font-medium">Extensibilité</td>
              <td className="p-2 border">Excellente (WebAssembly)</td>
              <td className="p-2 border">Limitée</td>
              <td className="p-2 border">Bonne</td>
              <td className="p-2 border">Limitée</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">Communauté</td>
              <td className="p-2 border">Très large</td>
              <td className="p-2 border">Active</td>
              <td className="p-2 border">Moyenne</td>
              <td className="p-2 border">Limitée</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6">
        Leçons Apprises et Bonnes Pratiques
      </h3>
      <div className="space-y-4 mt-4">
        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Déploiement et Adoption
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            L&apos;adoption d&apos;un service mesh doit être progressive
            et planifiée avec soin.
          </p>
          <div className="bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
            <pre className="text-xs">{`# Exemple d'installation d'Istio avec un profil de base
$ istioctl install --set profile=default

# Activation de l'injection automatique des sidecars pour un namespace
$ kubectl label namespace mon-app istio-injection=enabled

# Vérification du déploiement
$ istioctl analyze`}</pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Sécurisation du Trafic
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            La mise en place du mTLS est essentielle mais nécessite une
            configuration appropriée.
          </p>
          <div className="bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
            <pre className="text-xs">{`# Configuration mTLS pour Istio (PeerAuthentication)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT  # Options: DISABLE, PERMISSIVE, STRICT`}</pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-500" />
            Gestion du Trafic Avancée
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Les déploiements canary et le traffic splitting permettent
            des mises à jour sans risque.
          </p>
          <div className="bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
            <pre className="text-xs">{`# VirtualService Istio pour un déploiement canary
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: mon-service
spec:
  hosts:
  - mon-service
  http:
  - route:
    - destination:
        host: mon-service
        subset: v1
      weight: 80
    - destination:
        host: mon-service
        subset: v2
      weight: 20`}</pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            Observabilité et Monitoring
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            L&apos;intégration avec des outils de monitoring est
            cruciale pour tirer pleinement parti du service mesh.
          </p>
          <div className="bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
            <pre className="text-xs">{`# Exemple de requête Prometheus pour les métriques Istio
rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local"}[5m])

# Exemple de requête pour le taux d'erreur
sum(rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local",response_code=~"5.*"}[5m])) / sum(rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local"}[5m]))`}</pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Pièges Courants à Éviter
          </h4>
          <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
            <li>
              <span className="font-medium">
                Surcharge de configuration
              </span>{" "}
              - Commencer simple et ajouter des fonctionnalités
              progressivement
            </li>
            <li>
              <span className="font-medium">
                Overhead de performance
              </span>{" "}
              - Surveiller l&apos;impact des sidecars sur la latence et
              les ressources
            </li>
            <li>
              <span className="font-medium">Dépendance excessive</span>{" "}
              - Avoir un plan de secours en cas de défaillance du
              service mesh
            </li>
            <li>
              <span className="font-medium">Manque de formation</span> -
              S&apos;assurer que l&apos;équipe comprend bien le
              fonctionnement du service mesh
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border bg-slate-900/30">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-indigo-500" />
            Études de Cas Réelles
          </h4>
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <h5 className="text-sm font-medium mb-1 text-indigo-400">
                Airbnb avec Istio
              </h5>
              <p className="text-xs text-muted-foreground mb-2">
                Airbnb a déployé Istio pour gérer plus de 1000
                microservices. Ils ont utilisé une approche progressive:
              </p>
              <ul className="text-xs list-disc pl-4 text-muted-foreground">
                <li>
                  Déploiement initial en mode PERMISSIVE pour le mTLS
                </li>
                <li>Migration progressive vers le mode STRICT</li>
                <li>
                  Utilisation des Virtual Services pour le canary
                  testing
                </li>
                <li>
                  Intégration avec leur pipeline CI/CD pour automatiser
                  les déploiements
                </li>
              </ul>
            </div>

            <div className="rounded-md border p-3">
              <h5 className="text-sm font-medium mb-1 text-green-400">
                Nordstrom avec Linkerd
              </h5>
              <p className="text-xs text-muted-foreground mb-2">
                Nordstrom a choisi Linkerd pour sa légèreté et sa
                simplicité. Résultats obtenus:
              </p>
              <ul className="text-xs list-disc pl-4 text-muted-foreground">
                <li>
                  Réduction de 99.9% des erreurs grâce aux retries
                  automatiques
                </li>
                <li>
                  Amélioration de la latence de 10x dans certains cas
                </li>
                <li>
                  Visibilité accrue sur les dépendances entre services
                </li>
                <li>
                  Temps d&apos;adoption réduit grâce à la simplicité de
                  configuration
                </li>
              </ul>
            </div>

            <div className="rounded-md border p-3">
              <h5 className="text-sm font-medium mb-1 text-amber-400">
                HashiCorp avec Consul Connect
              </h5>
              <p className="text-xs text-muted-foreground mb-2">
                HashiCorp utilise naturellement Consul Connect pour ses
                propres services internes:
              </p>
              <ul className="text-xs list-disc pl-4 text-muted-foreground">
                <li>
                  Environnement hybride combinant Kubernetes et VMs
                </li>
                <li>
                  Intégration avec Vault pour la gestion des secrets
                </li>
                <li>
                  Utilisation des intentions pour un contrôle
                  d&apos;accès granulaire
                </li>
                <li>
                  Découverte de services automatique entre différents
                  environnements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
