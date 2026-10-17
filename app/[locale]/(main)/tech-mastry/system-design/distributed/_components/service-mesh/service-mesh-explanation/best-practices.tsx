import { CheckCircle, Shield, RefreshCw, Eye, AlertCircle, Server } from "lucide-react";

export function BestPractices() {
  return (
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
  );
}
