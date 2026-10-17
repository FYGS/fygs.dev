import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function LogsSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
    <TabsContent value="logs" className="mt-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Analyse et tri des logs serveur
        </h3>
        <p className="text-muted-foreground">
          L&apos;analyse des logs serveur nécessite souvent de trier de
          grandes quantités de données pour identifier des tendances, des
          erreurs ou des comportements anormaux. Les algorithmes de tri
          sont essentiels pour ces opérations d&apos;analyse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium">Applications</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  <strong>Tri chronologique</strong> : Organisation des
                  logs par horodatage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  <strong>Tri par sévérité</strong> : Priorisation des
                  erreurs critiques
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  <strong>Tri par fréquence</strong> : Identification des
                  erreurs les plus courantes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  <strong>Tri par source</strong> : Regroupement des logs
                  par composant ou service
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium">
              Exemple d&apos;implémentation
            </h4>
            <div className="relative">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyCode(
                      `// Analyse de logs avec tri et agrégation en JavaScript
function analyzeServerLogs(logs) {
  // Étape 1: Parser les logs
  const parsedLogs = logs.map(log => {
    const [timestamp, level, service, message] = log.split(' - ');
    return {
      timestamp: new Date(timestamp),
      level,
      service,
      message
    };
  });

  // Étape 2: Trier les logs par horodatage
  const sortedByTime = [...parsedLogs].sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Étape 3: Trier et compter les erreurs par fréquence
  const errorLogs = parsedLogs.filter(log => log.level === 'ERROR');
  const errorCounts = {};

  errorLogs.forEach(log => {
    // Extraire le code d'erreur du message (exemple: "Error 404: Not Found")
    const errorMatch = log.message.match(/Error (\d+)/);
    if (errorMatch) {
      const errorCode = errorMatch[1];
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    }
  });

  // Convertir en tableau et trier par fréquence décroissante
  const sortedErrors = Object.entries(errorCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // Étape 4: Trier les services par nombre d'erreurs
  const serviceErrors = {};
  errorLogs.forEach(log => {
    serviceErrors[log.service] = (serviceErrors[log.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceErrors)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  return {
    chronological: sortedByTime,
    topErrors: sortedErrors,
    servicesByErrorCount: sortedServices
  };
}`,
                      "logs-sort"
                    )
                  }
                  className="h-7 w-7 p-0"
                >
                  {copiedCode === "logs-sort" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                <code className="text-xs">
                  {`// Analyse de logs avec tri et agrégation en JavaScript
function analyzeServerLogs(logs) {
  // Étape 1: Parser les logs
  const parsedLogs = logs.map(log => {
    const [timestamp, level, service, message] = log.split(' - ');
    return {
      timestamp: new Date(timestamp),
      level,
      service,
      message
    };
  });

  // Étape 2: Trier les logs par horodatage
  const sortedByTime = [...parsedLogs].sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Étape 3: Trier et compter les erreurs par fréquence
  const errorLogs = parsedLogs.filter(log => log.level === 'ERROR');
  const errorCounts = {};

  errorLogs.forEach(log => {
    // Extraire le code d'erreur du message (exemple: "Error 404: Not Found")
    const errorMatch = log.message.match(/Error (\d+)/);
    if (errorMatch) {
      const errorCode = errorMatch[1];
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    }
  });

  // Convertir en tableau et trier par fréquence décroissante
  const sortedErrors = Object.entries(errorCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // Étape 4: Trier les services par nombre d'erreurs
  const serviceErrors = {};
  errorLogs.forEach(log => {
    serviceErrors[log.service] = (serviceErrors[log.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceErrors)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  return {
    chronological: sortedByTime,
    topErrors: sortedErrors,
    servicesByErrorCount: sortedServices
  };
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
          <h4 className="text-sm font-medium text-blue-300 mb-2">
            Outils d&apos;analyse de logs
          </h4>
          <p className="text-sm text-blue-400">
            Des outils comme <strong>Elasticsearch</strong> et{" "}
            <strong>Logstash</strong> utilisent des algorithmes de tri
            optimisés pour traiter des volumes massifs de logs.
            Elasticsearch implémente des structures de données
            spécialisées comme les index inversés et les B-trees pour
            permettre des tris et des recherches rapides sur des
            téraoctets de données de logs.
          </p>
          <p className="text-sm text-blue-400 mt-2">
            Pour les analyses en temps réel, ces outils utilisent souvent
            des algorithmes de tri parallèles et distribués pour répartir
            la charge de travail sur plusieurs nœuds.
          </p>
        </div>
      </div>
    </TabsContent>
  );
}
