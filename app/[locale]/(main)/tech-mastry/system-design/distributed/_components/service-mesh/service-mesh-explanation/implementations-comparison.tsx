export function ImplementationsComparison() {
  return (
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
                AWS App Mesh (fin de support)
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
  );
}
