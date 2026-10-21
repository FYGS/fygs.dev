import { CheckCircle } from "lucide-react";

export function QueryResultsPanel({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <div className="w-1/3 h-full flex flex-col">
      <div className="text-sm font-medium mb-2 text-center">
        Requêtes Orientées Colonne
      </div>
      <div className="flex-1 border rounded-md overflow-auto flex flex-col">
        <div className="bg-slate-800 p-2 border-b">
          <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
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
  );
}
