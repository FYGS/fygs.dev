"use client";

import { CheckCircle } from "lucide-react";

export function ColumnFamilyView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <>
      {/* Column Families */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Familles de Colonnes
        </div>
        <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
          {/* Users Column Family */}
          <div className="mb-4">
            <div className="bg-purple-900/30 p-2 rounded-t-md border border-purple-800">
              <div className="font-medium text-sm">
                users (famille de colonnes)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <div className="p-2 bg-slate-900 overflow-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        Row Key
                      </th>
                      <th className="p-1 text-left border">
                        profile:name
                      </th>
                      <th className="p-1 text-left border">
                        profile:email
                      </th>
                      <th className="p-1 text-left border">
                        profile:age
                      </th>
                      <th className="p-1 text-left border">
                        access:last_login
                      </th>
                      <th className="p-1 text-left border">
                        access:role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border font-mono">
                        user:1001
                      </td>
                      <td className="p-1 border">John Doe</td>
                      <td className="p-1 border">
                        john@example.com
                      </td>
                      <td className="p-1 border">28</td>
                      <td className="p-1 border">
                        2023-06-10T14:20:00Z
                      </td>
                      <td className="p-1 border">admin</td>
                    </tr>
                    <tr>
                      <td className="p-1 border font-mono">
                        user:1002
                      </td>
                      <td className="p-1 border">
                        Alice Smith
                      </td>
                      <td className="p-1 border">
                        alice@example.com
                      </td>
                      <td className="p-1 border">34</td>
                      <td className="p-1 border">
                        2023-06-09T10:15:00Z
                      </td>
                      <td className="p-1 border">user</td>
                    </tr>
                    <tr>
                      <td className="p-1 border font-mono">
                        user:1003
                      </td>
                      <td className="p-1 border">
                        Bob Johnson
                      </td>
                      <td className="p-1 border">
                        bob@example.com
                      </td>
                      <td className="p-1 border">42</td>
                      <td className="p-1 border">
                        2023-06-08T16:45:00Z
                      </td>
                      <td className="p-1 border">user</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Events Column Family */}
          <div>
            <div className="bg-teal-900/30 p-2 rounded-t-md border border-teal-800">
              <div className="font-medium text-sm">
                events (famille de colonnes)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <div className="p-2 bg-slate-900 overflow-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        Row Key
                      </th>
                      <th className="p-1 text-left border">
                        meta:type
                      </th>
                      <th className="p-1 text-left border">
                        meta:timestamp
                      </th>
                      <th className="p-1 text-left border">
                        data:user_id
                      </th>
                      <th className="p-1 text-left border">
                        data:details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border font-mono">
                        event:5001
                      </td>
                      <td className="p-1 border">login</td>
                      <td className="p-1 border">
                        2023-06-10T14:20:00Z
                      </td>
                      <td className="p-1 border">
                        user:1001
                      </td>
                      <td className="p-1 border">
                        {JSON.stringify({
                          ip: "192.168.1.1",
                          device: "mobile",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border font-mono">
                        event:5002
                      </td>
                      <td className="p-1 border">purchase</td>
                      <td className="p-1 border">
                        2023-06-10T14:30:00Z
                      </td>
                      <td className="p-1 border">
                        user:1001
                      </td>
                      <td className="p-1 border">
                        {JSON.stringify({
                          product_id: "p123",
                          amount: 99.99,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border font-mono">
                        event:5003
                      </td>
                      <td className="p-1 border">login</td>
                      <td className="p-1 border">
                        2023-06-09T10:15:00Z
                      </td>
                      <td className="p-1 border">
                        user:1002
                      </td>
                      <td className="p-1 border">
                        {JSON.stringify({
                          ip: "192.168.1.2",
                          device: "desktop",
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Structure */}
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

      {/* Query & Results */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Requêtes Orientées Colonne
        </div>
        <div className="flex-1 border rounded-md overflow-auto flex flex-col">
          <div className="bg-slate-800 p-2 border-b">
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {queryType === "simple" &&
                `// Récupération par clé de ligne
SELECT * FROM users
WHERE row_key = 'user:1001';`}
              {queryType === "complex" &&
                `// Sélection de colonnes spécifiques
SELECT profile:name, profile:email, access:role
FROM users
WHERE row_key IN ('user:1001', 'user:1002')
ORDER BY profile:name;`}
              {queryType === "aggregation" &&
                `// Agrégation sur une colonne
SELECT COUNT(*), AVG(profile:age)
FROM users
WHERE access:role = 'user';

// Analyse temporelle
SELECT COUNT(*)
FROM events
WHERE meta:type = 'login'
GROUP BY TRUNC(meta:timestamp, 'day');`}
              {queryType === "update" &&
                `// Mise à jour d'une cellule spécifique
UPDATE users
SET access:role = 'premium'
WHERE row_key = 'user:1002';

// Insertion avec timestamp
INSERT INTO events (row_key, meta:type, meta:timestamp, data:user_id)
VALUES ('event:5004', 'logout', CURRENT_TIMESTAMP, 'user:1001');`}
            </pre>
          </div>
          <div className="flex-1 p-2 bg-slate-900 overflow-auto">
            <div className="text-xs font-medium mb-2">
              Résultats:
            </div>
            {queryType === "simple" && (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border">
                      row_key
                    </th>
                    <th className="p-1 text-left border">
                      profile:name
                    </th>
                    <th className="p-1 text-left border">
                      profile:email
                    </th>
                    <th className="p-1 text-left border">
                      profile:age
                    </th>
                    <th className="p-1 text-left border">
                      access:last_login
                    </th>
                    <th className="p-1 text-left border">
                      access:role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border">user:1001</td>
                    <td className="p-1 border">John Doe</td>
                    <td className="p-1 border">
                      john@example.com
                    </td>
                    <td className="p-1 border">28</td>
                    <td className="p-1 border">
                      2023-06-10T14:20:00Z
                    </td>
                    <td className="p-1 border">admin</td>
                  </tr>
                </tbody>
              </table>
            )}
            {queryType === "complex" && (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border">
                      profile:name
                    </th>
                    <th className="p-1 text-left border">
                      profile:email
                    </th>
                    <th className="p-1 text-left border">
                      access:role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border">
                      Alice Smith
                    </td>
                    <td className="p-1 border">
                      alice@example.com
                    </td>
                    <td className="p-1 border">user</td>
                  </tr>
                  <tr>
                    <td className="p-1 border">John Doe</td>
                    <td className="p-1 border">
                      john@example.com
                    </td>
                    <td className="p-1 border">admin</td>
                  </tr>
                </tbody>
              </table>
            )}
            {queryType === "aggregation" && (
              <div className="space-y-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        count
                      </th>
                      <th className="p-1 text-left border">
                        avg(profile:age)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border">2</td>
                      <td className="p-1 border">38</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs font-medium mt-3 mb-1">
                  Résultat de l&apos;analyse temporelle:
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        day
                      </th>
                      <th className="p-1 text-left border">
                        count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border">
                        2023-06-10
                      </td>
                      <td className="p-1 border">1</td>
                    </tr>
                    <tr>
                      <td className="p-1 border">
                        2023-06-09
                      </td>
                      <td className="p-1 border">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {queryType === "update" && (
              <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Opérations réussies</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="mb-1">
                    Mise à jour: 1 ligne affectée
                  </div>
                  <div>
                    Insertion: 1 nouvelle ligne ajoutée
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
