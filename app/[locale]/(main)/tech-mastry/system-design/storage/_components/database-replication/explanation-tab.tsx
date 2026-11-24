import { ArrowDown, ArrowRight, RotateCw } from "lucide-react";
import { ConsistencyModels } from "./consistency-models";
import { ImplementationNotes } from "./implementation-notes";

export function ExplanationTab() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Qu&apos;est-ce que la Réplication?
          </h3>
          <p className="text-muted-foreground">
            La réplication de base de données est le processus de copie
            des données d&apos;une base de données vers une ou plusieurs
            autres bases de données. Elle permet d&apos;améliorer la
            disponibilité, la fiabilité et les performances du système.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Avantages</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Haute disponibilité et tolérance aux pannes</li>
              <li>Répartition de la charge de lecture</li>
              <li>Copies à jour des données (ne remplace pas une sauvegarde)</li>
              <li>
                Réduction de la latence pour les utilisateurs
                géographiquement dispersés
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Types de Réplication</h3>
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <ArrowDown className="h-4 w-4 text-primary" />
              Réplication Master-Slave
            </h4>
            <p className="text-sm text-muted-foreground">
              Un nœud principal (master) reçoit toutes les écritures et
              les propage aux nœuds secondaires (slaves). Les lectures
              peuvent être distribuées sur tous les nœuds.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <ArrowRight className="h-4 w-4 text-primary" />
              Réplication Master-Master
            </h4>
            <p className="text-sm text-muted-foreground">
              Deux nœuds principaux peuvent recevoir des écritures et se
              synchronisent mutuellement. Offre une meilleure
              disponibilité mais complexifie la gestion des conflits.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <RotateCw className="h-4 w-4 text-primary" />
              Réplication Multi-Master
            </h4>
            <p className="text-sm text-muted-foreground">
              Plusieurs nœuds principaux peuvent recevoir des écritures et
              se synchronisent entre eux. Maximise la disponibilité mais
              rend la résolution des conflits plus complexe.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Modèles de Cohérence
        </h3>

        <ConsistencyModels />

        <ImplementationNotes />
      </div>
    </>
  );
}
