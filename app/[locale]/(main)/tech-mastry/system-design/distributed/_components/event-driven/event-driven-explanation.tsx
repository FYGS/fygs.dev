"use client";



export function EventDrivenExplanation() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Qu&apos;est-ce que l&apos;Architecture Event-Driven?
      </h3>
      <p className="text-muted-foreground">
        L&apos;architecture event-driven (pilotée par les événements)
        est un modèle d&apos;architecture logicielle où la production,
        la détection, la consommation et la réaction aux événements
        constituent la base du système. Un événement peut être défini
        comme un changement d&apos;état significatif.
      </p>

      <h3 className="text-lg font-semibold mt-6">Composants Clés</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          <span className="font-medium">
            Producteurs d&apos;événements
          </span>{" "}
          - Services qui génèrent des événements suite à des changements
          d&apos;état
        </li>
        <li>
          <span className="font-medium">Broker de messages</span> -
          Middleware qui stocke et achemine les événements
        </li>
        <li>
          <span className="font-medium">
            Consommateurs d&apos;événements
          </span>{" "}
          - Services qui écoutent et réagissent aux événements
        </li>
        <li>
          <span className="font-medium">Événements</span> - Messages qui
          représentent des faits survenus dans le système
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Avantages</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>Découplage fort entre les services</li>
        <li>Meilleure résilience et tolérance aux pannes</li>
        <li>Scalabilité améliorée</li>
        <li>
          Flexibilité pour ajouter de nouveaux consommateurs sans
          modifier les producteurs
        </li>
        <li>
          Support naturel pour les modèles de communication asynchrone
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Défis</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          Complexité accrue dans le suivi du flux d&apos;exécution
        </li>
        <li>Gestion de la cohérence des données</li>
        <li>Traitement des événements dupliqués ou manquants</li>
        <li>
          Besoin d&apos;une infrastructure robuste pour le broker de
          messages
        </li>
      </ul>
    </div>
  );
}
