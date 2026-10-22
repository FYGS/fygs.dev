"use client";

import { CheckCircle } from "lucide-react";

export function KeyValueStoreView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <>
      {/* Key-Value Store */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Store Clé-Valeur
        </div>
        <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
          {/* Cache Store */}
          <div className="mb-4">
            <div className="bg-red-900/30 p-2 rounded-t-md border border-red-800">
              <div className="font-medium text-sm">
                cache (store)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border-b">
                      Clé
                    </th>
                    <th className="p-1 text-left border-b">
                      Valeur
                    </th>
                    <th className="p-1 text-left border-b">
                      TTL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      user:1001
                    </td>
                    <td className="p-1 border-b font-mono">
                      &quot;John Doe&quot;
                    </td>
                    <td className="p-1 border-b">300s</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      session:xyz123
                    </td>
                    <td className="p-1 border-b font-mono">
                      {JSON.stringify({
                        userId: 1001,
                        lastActive: "2023-06-10T14:20:00Z",
                      })}
                    </td>
                    <td className="p-1 border-b">3600s</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      counter:visits
                    </td>
                    <td className="p-1 border-b font-mono">
                      42578
                    </td>
                    <td className="p-1 border-b">-</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-mono">
                      product:5001:stock
                    </td>
                    <td className="p-1 font-mono">157</td>
                    <td className="p-1">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Configuration Store */}
          <div>
            <div className="bg-amber-900/30 p-2 rounded-t-md border border-amber-800">
              <div className="font-medium text-sm">
                config (store)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border-b">
                      Clé
                    </th>
                    <th className="p-1 text-left border-b">
                      Valeur
                    </th>
                    <th className="p-1 text-left border-b">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      app:theme
                    </td>
                    <td className="p-1 border-b font-mono">
                      &quot;dark&quot;
                    </td>
                    <td className="p-1 border-b">string</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      feature:newUI
                    </td>
                    <td className="p-1 border-b font-mono">
                      true
                    </td>
                    <td className="p-1 border-b">boolean</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      limits:api:rate
                    </td>
                    <td className="p-1 border-b font-mono">
                      100
                    </td>
                    <td className="p-1 border-b">integer</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-mono">
                      maintenance:window
                    </td>
                    <td className="p-1 font-mono">
                      &quot;2023-07-15T02:00:00Z&quot;
                    </td>
                    <td className="p-1">timestamp</td>
                  </tr>
                </tbody>
              </table>
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
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-red-300">
                Structures Internes
              </h4>
              <div className="text-xs mb-2">
                <span className="font-medium">
                  Hash Table:
                </span>{" "}
                Accès O(1) aux données
              </div>
              <svg
                width="100%"
                height="120"
                viewBox="0 0 300 120"
              >
                {/* Hash Table Visualization */}
                <rect
                  x="10"
                  y="10"
                  width="280"
                  height="100"
                  rx="4"
                  fill="#fee2e2"
                  stroke="#ef4444"
                  strokeWidth="1"
                />

                {/* Hash Buckets */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <g key={i}>
                    <rect
                      x={20 + i * 40}
                      y="20"
                      width="30"
                      height="80"
                      rx="2"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray={
                        i % 2 === 0 ? "none" : "2 2"
                      }
                    />

                    {/* Add some entries in buckets */}
                    {i === 1 && (
                      <>
                        <rect
                          x="25"
                          y="30"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                        <rect
                          x="25"
                          y="50"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                      </>
                    )}
                    {i === 3 && (
                      <>
                        <rect
                          x="105"
                          y="30"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                      </>
                    )}
                    {i === 5 && (
                      <>
                        <rect
                          x="185"
                          y="30"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                        <rect
                          x="185"
                          y="50"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                        <rect
                          x="185"
                          y="70"
                          width="20"
                          height="15"
                          rx="2"
                          fill="#fca5a5"
                        />
                      </>
                    )}
                  </g>
                ))}

                {/* Hash Function */}
                <text
                  x="150"
                  y="110"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#dc2626"
                >
                  hash(key) % table_size = bucket_index
                </text>
              </svg>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-800 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-amber-300">
                Types de Données Supportés
              </h4>
              <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                <li>Chaînes de caractères (strings)</li>
                <li>Nombres (entiers, flottants)</li>
                <li>Listes</li>
                <li>Ensembles (sets)</li>
                <li>Hashes (dictionnaires)</li>
                <li>Valeurs binaires</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-blue-300">
                Caractéristiques
              </h4>
              <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                <li>Accès ultra-rapide par clé</li>
                <li>Pas de requêtes complexes</li>
                <li>
                  Stockage en mémoire (avec persistance
                  optionnelle)
                </li>
                <li>
                  Idéal pour le caching et les données
                  temporaires
                </li>
                <li>
                  Évolutivité horizontale par partitionnement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Query & Results */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Opérations Clé-Valeur
        </div>
        <div className="flex-1 border rounded-md overflow-auto flex flex-col">
          <div className="bg-slate-800 p-2 border-b">
            <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
              {queryType === "simple" &&
                `// Récupération simple
GET user:1001`}
              {queryType === "complex" &&
                `// Opérations multiples
MGET user:1001 user:1002 user:1003

// Ou avec pattern matching (KEYS bloque le serveur :
// à éviter en production, préférer SCAN)
KEYS user:*`}
              {queryType === "aggregation" &&
                `// Incrémentation atomique
INCR counter:visits

// Opération sur ensemble
SADD active:users user:1001 user:1002
SCARD active:users`}
              {queryType === "update" &&
                `// Mise à jour avec expiration
SET session:xyz123 '{"userId":1001,"lastActive":"2023-06-10T15:30:00Z"}'
EXPIRE session:xyz123 3600

// Mise à jour conditionnelle (en pratique, préférer
// SET product:5001:lock 1 NX EX 30 pour avoir une expiration)
SETNX product:5001:lock 1
// Exécuter opération si verrouillage réussi
DEL product:5001:lock`}
            </pre>
          </div>
          <div className="flex-1 p-2 bg-slate-900 overflow-auto">
            <div className="text-xs font-medium mb-2">
              Résultats:
            </div>
            {queryType === "simple" && (
              <pre className="text-xs p-2 bg-slate-800 rounded border">
                &quot;John Doe&quot;
              </pre>
            )}
            {queryType === "complex" && (
              <pre className="text-xs p-2 bg-slate-800 rounded border">
                {`1) "John Doe"
2) "Alice Smith"
3) (nil)

// Résultat de KEYS user:*
1) "user:1001"
2) "user:1002"
3) "user:1003"
4) "user:1004"`}
              </pre>
            )}
            {queryType === "aggregation" && (
              <pre className="text-xs p-2 bg-slate-800 rounded border">
                {`// Résultat de INCR
42579

// Résultat de SADD
(integer) 2

// Résultat de SCARD
(integer) 2`}
              </pre>
            )}
            {queryType === "update" && (
              <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Opérations réussies</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <pre className="bg-slate-900 p-2 rounded border">
                    {`// Résultat de SET
OK

// Résultat de EXPIRE
(integer) 1

// Résultat de SETNX (si clé n'existe pas)
(integer) 1

// Résultat de DEL
(integer) 1`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
