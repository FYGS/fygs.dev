import { CheckCircle } from "lucide-react";

export function QueryResultsPanel({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <div className="w-1/3 h-full flex flex-col">
      <div className="text-sm font-medium mb-2 text-center">
        Requêtes : CQL (wide-column) et SQL analytique (colonnaire)
      </div>
      <div className="flex-1 border rounded-md overflow-auto flex flex-col">
        <div className="bg-slate-800 p-2 border-b">
          <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
            {queryType === "simple" &&
              `-- CQL (Cassandra) : lecture par clé de partition
SELECT * FROM users
WHERE user_id = 'user:1001';`}
            {queryType === "complex" &&
              `-- CQL (Cassandra) : projection de colonnes
SELECT name, email, role
FROM users
WHERE user_id IN ('user:1001', 'user:1002');
-- Pas de ORDER BY sur la clé de partition :
-- l'ordre n'est pas garanti, tri côté client.`}
            {queryType === "aggregation" &&
              `-- SQL analytique (ClickHouse, stockage colonnaire).
-- Ce n'est PAS du CQL : un wide-column store comme
-- Cassandra n'est pas conçu pour ces agrégations.
SELECT count(), avg(age)
FROM users
WHERE role = 'user';

-- Analyse temporelle
SELECT toDate(ts) AS day, count()
FROM events
WHERE type = 'login'
GROUP BY day;`}
            {queryType === "update" &&
              `-- CQL (Cassandra) : UPDATE et INSERT sont des upserts
UPDATE users
SET role = 'premium'
WHERE user_id = 'user:1002';

INSERT INTO events (event_id, type, ts, user_id)
VALUES ('event:5004', 'logout', toTimestamp(now()), 'user:1001');`}
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
                    user_id
                  </th>
                  <th className="p-1 text-left border">
                    name
                  </th>
                  <th className="p-1 text-left border">
                    email
                  </th>
                  <th className="p-1 text-left border">
                    age
                  </th>
                  <th className="p-1 text-left border">
                    last_login
                  </th>
                  <th className="p-1 text-left border">
                    role
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
                    name
                  </th>
                  <th className="p-1 text-left border">
                    email
                  </th>
                  <th className="p-1 text-left border">
                    role
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
                      avg(age)
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
                <span>Écritures appliquées</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="mb-1">
                  UPDATE : cellule role écrite (upsert ; CQL ne renvoie pas de nombre de lignes affectées)
                </div>
                <div>
                  INSERT : ligne écrite dans events (upsert)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
