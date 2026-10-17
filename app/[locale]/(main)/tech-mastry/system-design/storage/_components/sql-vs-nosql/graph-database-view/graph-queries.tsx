import { CheckCircle } from "lucide-react";

export function GraphQueries({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <div className="w-1/3 h-full flex flex-col">
      <div className="text-sm font-medium mb-2 text-center">
        Requêtes Graphe
      </div>
      <div className="flex-1 border rounded-md overflow-auto flex flex-col">
        <div className="bg-slate-800 p-2 border-b">
          <pre className="text-xs overflow-auto whitespace-pre-wrap">
            {queryType === "simple" &&
              `// Recherche d'un nœud par propriété
MATCH (p:Person {name: 'John'})
RETURN p;`}
            {queryType === "complex" &&
              `// Traverser des relations
MATCH (p:Person)-[r:WORKS_AT]->(c:Company)
WHERE c.name = 'Acme Inc'
RETURN p.name, r.role, c.name;`}
            {queryType === "aggregation" &&
              `// Agrégation et regroupement
MATCH (p:Person)-[r:WORKS_AT]->(c:Company)
RETURN c.name, count(p) as employee_count,
       avg(p.age) as avg_age
ORDER BY employee_count DESC;`}
            {queryType === "update" &&
              `// Création de nœuds et relations
CREATE (p:Person {name: 'Sarah', age: 31})

// Création d'une relation
MATCH (p:Person {name: 'Sarah'})
MATCH (c:Company {name: 'TechCorp'})
CREATE (p)-[r:WORKS_AT {since: 2022, role: 'Designer'}]->(c)
RETURN p, r, c;`}
          </pre>
        </div>
        <div className="flex-1 p-2 bg-slate-900 overflow-auto">
          <div className="text-xs font-medium mb-2">
            Résultats:
          </div>
          {queryType === "simple" && (
            <div className="p-2 bg-slate-800 rounded border">
              <div className="text-xs mb-1 font-medium">
                1 nœud trouvé:
              </div>
              <div className="flex items-center gap-2 p-2 bg-indigo-900/20 rounded border border-indigo-800">
                <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">
                  <span className="text-xs font-medium">
                    p1
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium">
                    Person
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {JSON.stringify({
                      name: "John",
                      age: 28,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {queryType === "complex" && (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800">
                  <th className="p-1 text-left border">
                    p.name
                  </th>
                  <th className="p-1 text-left border">
                    r.role
                  </th>
                  <th className="p-1 text-left border">
                    c.name
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border">John</td>
                  <td className="p-1 border">Developer</td>
                  <td className="p-1 border">Acme Inc</td>
                </tr>
                <tr>
                  <td className="p-1 border">Alice</td>
                  <td className="p-1 border">Manager</td>
                  <td className="p-1 border">Acme Inc</td>
                </tr>
              </tbody>
            </table>
          )}
          {queryType === "aggregation" && (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800">
                  <th className="p-1 text-left border">
                    c.name
                  </th>
                  <th className="p-1 text-left border">
                    employee_count
                  </th>
                  <th className="p-1 text-left border">
                    avg_age
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border">Acme Inc</td>
                  <td className="p-1 border">2</td>
                  <td className="p-1 border">31</td>
                </tr>
                <tr>
                  <td className="p-1 border">TechCorp</td>
                  <td className="p-1 border">1</td>
                  <td className="p-1 border">42</td>
                </tr>
              </tbody>
            </table>
          )}
          {queryType === "update" && (
            <div className="space-y-3">
              <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Opérations réussies</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="mb-1">1 nœud créé</div>
                  <div>1 relation créée</div>
                </div>
              </div>

              <div className="text-xs font-medium">
                Graphe mis à jour:
              </div>
              <div className="p-2 bg-slate-800 rounded border">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">
                      <span className="text-xs">p4</span>
                    </div>
                    <div className="text-xs">
                      Person{" "}
                      {JSON.stringify({
                        name: "Sarah",
                        age: 31,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pl-8">
                    <div className="text-xs text-cyan-400">
                      WORKS_AT
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {JSON.stringify({
                        since: 2022,
                        role: "Designer",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-12">
                    <div className="w-6 h-6 rounded bg-cyan-800 flex items-center justify-center border border-cyan-700">
                      <span className="text-xs">c2</span>
                    </div>
                    <div className="text-xs">
                      Company{" "}
                      {JSON.stringify({
                        name: "TechCorp",
                        founded: 2015,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
