"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServiceMeshComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Service Mesh vs API Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Service Mesh</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                Gère la communication <strong>service-à-service</strong>{" "}
                interne
              </li>
              <li>Fonctionne comme une infrastructure invisible</li>
              <li>Utilise des proxies sidecar pour chaque service</li>
              <li>
                Focus sur la résilience, l&apos;observabilité et la
                sécurité
              </li>
              <li>Généralement déployé dans un cluster Kubernetes</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">API Gateway</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                Gère la communication <strong>client-à-service</strong>{" "}
                externe
              </li>
              <li>
                Point d&apos;entrée unique pour les clients externes
              </li>
              <li>Fonctionne comme un reverse proxy centralisé</li>
              <li>
                Focus sur le routage, l&apos;authentification et la
                limitation de débit
              </li>
              <li>Peut être déployé à la périphérie du réseau</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Service Mesh vs ESB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Service Mesh</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Architecture décentralisée</li>
              <li>Pas de transformation de données</li>
              <li>Proxies légers et spécialisés</li>
              <li>Conçu pour les microservices natifs cloud</li>
              <li>Séparation du plan de données et de contrôle</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">
              Enterprise Service Bus (ESB)
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Architecture centralisée (hub-and-spoke)</li>
              <li>Transformation et orchestration des données</li>
              <li>Composant monolithique lourd</li>
              <li>Conçu pour les applications monolithiques</li>
              <li>Point unique de défaillance potentiel</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
