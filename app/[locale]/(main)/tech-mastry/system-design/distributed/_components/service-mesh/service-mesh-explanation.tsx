"use client";

import type { ServiceMeshType } from "./types";
import { PopularImplementations } from "./service-mesh-explanation/popular-implementations";
import { ImplementationsComparison } from "./service-mesh-explanation/implementations-comparison";
import { BestPractices } from "./service-mesh-explanation/best-practices";

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
      <PopularImplementations serviceMeshType={serviceMeshType} />

      <h3 className="text-lg font-semibold mt-6">
        Comparaison des Implémentations
      </h3>
      <ImplementationsComparison />

      <h3 className="text-lg font-semibold mt-6">
        Leçons Apprises et Bonnes Pratiques
      </h3>
      <BestPractices />
    </div>
  );
}
