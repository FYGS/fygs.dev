import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Résultats et Performances (comparaison qualitative)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Les valeurs chiffrées dépendent fortement de la charge, de la
          version et de la configuration : mesurez sur votre propre
          plateforme. Les niveaux ci-dessous sont relatifs (sidecar par pod).
          Le mode ambient d&apos;Istio (ztunnel par nœud) réduit nettement
          l&apos;empreinte par pod par rapport au mode sidecar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-800">
            <h4 className="font-medium text-blue-400 mb-2">
              Latence
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sans Service Mesh</span>
                <span className="font-medium text-sm">Référence</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Linkerd</span>
                <span className="font-medium text-sm">Très faible</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Istio</span>
                <span className="font-medium text-sm">Modérée</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Consul Connect</span>
                <span className="font-medium text-sm">Modérée</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AWS App Mesh</span>
                <span className="font-medium text-sm">Modérée</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-green-900/20 border-green-800">
            <h4 className="font-medium text-green-400 mb-2">
              Utilisation CPU
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sans Service Mesh</span>
                <span className="font-medium text-sm">Référence</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Linkerd</span>
                <span className="font-medium text-sm">Faible</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Istio</span>
                <span className="font-medium text-sm">Élevé</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Consul Connect</span>
                <span className="font-medium text-sm">Modéré</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AWS App Mesh</span>
                <span className="font-medium text-sm">Modéré à élevé</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-amber-900/20 border-amber-800">
            <h4 className="font-medium text-amber-400 mb-2">
              Mémoire
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sans Service Mesh</span>
                <span className="font-medium text-sm">Référence</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Linkerd</span>
                <span className="font-medium text-sm">Très faible</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Istio</span>
                <span className="font-medium text-sm">
                  Élevée
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Consul Connect</span>
                <span className="font-medium text-sm">
                  Moyenne
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AWS App Mesh</span>
                <span className="font-medium text-sm">
                  Moyenne
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border bg-slate-900/20">
          <h4 className="font-medium mb-2">Conclusions</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Linkerd</strong> vise la légèreté (proxy Rust dédié)
              avec moins de fonctionnalités
            </li>
            <li>
              <strong>Istio</strong> a l&apos;empreinte la plus lourde en
              mode sidecar mais le plus de fonctionnalités
            </li>
            <li>
              <strong>Consul Connect</strong> est un bon compromis avec
              une meilleure compatibilité multi-environnement
            </li>
            <li>
              <strong>AWS App Mesh</strong> offrait une intégration native
              avec les services AWS, mais le service n&apos;est plus supporté depuis le 30 septembre 2026
            </li>
            <li>
              L&apos;impact sur la latence est généralement acceptable
              pour la plupart des applications
            </li>
            <li>
              Le coût en ressources doit être pris en compte dans le
              dimensionnement du cluster
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
