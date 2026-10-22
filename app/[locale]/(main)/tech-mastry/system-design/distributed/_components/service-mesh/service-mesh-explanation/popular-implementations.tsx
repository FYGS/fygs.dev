import type { ServiceMeshType } from "../types";

export function PopularImplementations({ serviceMeshType }: {
  serviceMeshType: ServiceMeshType;
}) {
  return (
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
            Faible empreinte mémoire et CPU (nettement plus léger
            qu&apos;Istio en mode sidecar)
          </li>
          <li>
            Retries automatiques encadrés par un budget de retries
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
          par AWS (AWS a annoncé la fin de son support au 30
          septembre 2026 : à éviter pour de nouveaux projets).
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
  );
}
