export function DataStructurePanel() {
  return (
    <div className="w-1/3 h-full flex flex-col">
      <div className="text-sm font-medium mb-2 text-center">
        Structure de Données
      </div>
      <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
        <div className="space-y-4">
          <div className="p-3 bg-purple-900/20 border border-purple-800 rounded-md">
            <h4 className="text-sm font-medium mb-2 text-purple-300">
              Organisation des Données
            </h4>
            <div className="text-xs mb-3">
              Les bases de données orientées colonne
              stockent les données par colonne plutôt que
              par ligne, optimisant les requêtes
              analytiques.
            </div>
            <svg
              width="100%"
              height="160"
              viewBox="0 0 300 160"
            >
              {/* Column Store Visualization */}
              <rect
                x="10"
                y="10"
                width="280"
                height="140"
                rx="4"
                fill="#f3e8ff"
                stroke="#a855f7"
                strokeWidth="1"
              />

              {/* Column Headers */}
              <rect
                x="20"
                y="20"
                width="40"
                height="20"
                rx="2"
                fill="#d8b4fe"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="40"
                y="33"
                textAnchor="middle"
                fontSize="10"
                fill="#6b21a8"
              >
                ID
              </text>

              <rect
                x="70"
                y="20"
                width="40"
                height="20"
                rx="2"
                fill="#d8b4fe"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="90"
                y="33"
                textAnchor="middle"
                fontSize="10"
                fill="#6b21a8"
              >
                Name
              </text>

              <rect
                x="120"
                y="20"
                width="40"
                height="20"
                rx="2"
                fill="#d8b4fe"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="140"
                y="33"
                textAnchor="middle"
                fontSize="10"
                fill="#6b21a8"
              >
                Email
              </text>

              <rect
                x="170"
                y="20"
                width="40"
                height="20"
                rx="2"
                fill="#d8b4fe"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="190"
                y="33"
                textAnchor="middle"
                fontSize="10"
                fill="#6b21a8"
              >
                Age
              </text>

              <rect
                x="220"
                y="20"
                width="40"
                height="20"
                rx="2"
                fill="#d8b4fe"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="240"
                y="33"
                textAnchor="middle"
                fontSize="10"
                fill="#6b21a8"
              >
                Role
              </text>

              {/* Column Data */}
              <rect
                x="20"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="white"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="40"
                y="70"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                1001
              </text>
              <text
                x="40"
                y="90"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                1002
              </text>
              <text
                x="40"
                y="110"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                1003
              </text>

              <rect
                x="70"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="white"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="90"
                y="70"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                John
              </text>
              <text
                x="90"
                y="90"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                Alice
              </text>
              <text
                x="90"
                y="110"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                Bob
              </text>

              <rect
                x="120"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="white"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="140"
                y="70"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                john@...
              </text>
              <text
                x="140"
                y="90"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                alice@...
              </text>
              <text
                x="140"
                y="110"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                bob@...
              </text>

              <rect
                x="170"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="white"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="190"
                y="70"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                28
              </text>
              <text
                x="190"
                y="90"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                34
              </text>
              <text
                x="190"
                y="110"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                42
              </text>

              <rect
                x="220"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="white"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="240"
                y="70"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                admin
              </text>
              <text
                x="240"
                y="90"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                user
              </text>
              <text
                x="240"
                y="110"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
              >
                user
              </text>

              {/* Highlight Column-wise Storage */}
              <rect
                x="170"
                y="50"
                width="40"
                height="80"
                rx="2"
                fill="#f3e8ff"
                fillOpacity="0.7"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          <div className="p-3 bg-teal-900/20 border border-teal-800 rounded-md">
            <h4 className="text-sm font-medium mb-2 text-teal-300">
              Avantages Clés
            </h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
              <li>
                Compression efficace (données similaires
                stockées ensemble)
              </li>
              <li>
                Lectures partielles optimisées (seulement
                les colonnes nécessaires)
              </li>
              <li>Agrégations et analyses rapides</li>
              <li>Évolutivité horizontale</li>
              <li>
                Idéal pour les entrepôts de données (data
                warehouses)
              </li>
            </ul>
          </div>

          <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-md">
            <h4 className="text-sm font-medium mb-2 text-blue-300">
              Modèle de Données
            </h4>
            <div className="text-xs space-y-2">
              <div>
                <span className="font-medium">
                  Famille de colonnes:
                </span>{" "}
                Regroupement logique de colonnes
              </div>
              <div>
                <span className="font-medium">
                  Super colonnes:
                </span>{" "}
                Colonnes contenant d&apos;autres colonnes
              </div>
              <div>
                <span className="font-medium">
                  Clé de ligne:
                </span>{" "}
                Identifiant unique pour chaque ligne
              </div>
              <div>
                <span className="font-medium">
                  Horodatage:
                </span>{" "}
                Chaque valeur est versionnée avec un
                timestamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
