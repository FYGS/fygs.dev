import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImplementationsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Comparaison des Implémentations
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
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
                  AWS App Mesh (fin de support 30/09/2026)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border font-medium">Architecture</td>
              <td className="p-2 border">Istiod (monolithique)</td>
              <td className="p-2 border">Microservices</td>
              <td className="p-2 border">Agent + serveur central</td>
              <td className="p-2 border">Service AWS géré</td>
            </tr>
            <tr className="bg-muted/20">
              <td className="p-2 border font-medium">Langage</td>
              <td className="p-2 border">Go</td>
              <td className="p-2 border">
                Rust (data plane), Go (control plane)
              </td>
              <td className="p-2 border">Go</td>
              <td className="p-2 border">N/A (service géré)</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">Proxy</td>
              <td className="p-2 border">Envoy</td>
              <td className="p-2 border">linkerd-proxy (custom)</td>
              <td className="p-2 border">Envoy</td>
              <td className="p-2 border">Envoy</td>
            </tr>
            <tr className="bg-muted/20">
              <td className="p-2 border font-medium">Environnements</td>
              <td className="p-2 border">Kubernetes</td>
              <td className="p-2 border">Kubernetes</td>
              <td className="p-2 border">K8s, VMs, bare metal</td>
              <td className="p-2 border">ECS, EKS, EC2</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">Complexité</td>
              <td className="p-2 border">Élevée</td>
              <td className="p-2 border">Faible</td>
              <td className="p-2 border">Moyenne</td>
              <td className="p-2 border">
                Moyenne (simplifiée par AWS)
              </td>
            </tr>
            <tr className="bg-muted/20">
              <td className="p-2 border font-medium">
                Empreinte mémoire
              </td>
              <td className="p-2 border">Élevée (sidecar) ; réduite en mode ambient</td>
              <td className="p-2 border">Très faible</td>
              <td className="p-2 border">Moyenne</td>
              <td className="p-2 border">Moyenne</td>
            </tr>
            <tr>
              <td className="p-2 border font-medium">Extensibilité</td>
              <td className="p-2 border">WebAssembly</td>
              <td className="p-2 border">Limitée</td>
              <td className="p-2 border">Plugins Envoy</td>
              <td className="p-2 border">Limitée</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
