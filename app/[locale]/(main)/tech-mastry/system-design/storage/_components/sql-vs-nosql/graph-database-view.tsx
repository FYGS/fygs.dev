"use client";

import { CheckCircle } from "lucide-react";

export function GraphDatabaseView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <>
      {/* Graph Data */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Données Graphe
        </div>
        <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
          {/* Nodes */}
          <div className="mb-4">
            <div className="bg-indigo-900/30 p-2 rounded-t-md border border-indigo-800">
              <div className="font-medium text-sm">
                nodes (nœuds)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border-b">
                      ID
                    </th>
                    <th className="p-1 text-left border-b">
                      Label
                    </th>
                    <th className="p-1 text-left border-b">
                      Propriétés
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p1
                    </td>
                    <td className="p-1 border-b">Person</td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        name: "John",
                        age: 28,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p2
                    </td>
                    <td className="p-1 border-b">Person</td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        name: "Alice",
                        age: 34,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p3
                    </td>
                    <td className="p-1 border-b">Person</td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        name: "Bob",
                        age: 42,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      c1
                    </td>
                    <td className="p-1 border-b">Company</td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        name: "Acme Inc",
                        founded: 2010,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 font-mono">c2</td>
                    <td className="p-1">Company</td>
                    <td className="p-1">
                      {JSON.stringify({
                        name: "TechCorp",
                        founded: 2015,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Relationships */}
          <div>
            <div className="bg-cyan-900/30 p-2 rounded-t-md border border-cyan-800">
              <div className="font-medium text-sm">
                relationships (relations)
              </div>
            </div>
            <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-1 text-left border-b">
                      Source
                    </th>
                    <th className="p-1 text-left border-b">
                      Type
                    </th>
                    <th className="p-1 text-left border-b">
                      Target
                    </th>
                    <th className="p-1 text-left border-b">
                      Propriétés
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p1
                    </td>
                    <td className="p-1 border-b">WORKS_AT</td>
                    <td className="p-1 border-b font-mono">
                      c1
                    </td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        since: 2018,
                        role: "Developer",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p2
                    </td>
                    <td className="p-1 border-b">WORKS_AT</td>
                    <td className="p-1 border-b font-mono">
                      c1
                    </td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        since: 2019,
                        role: "Manager",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p3
                    </td>
                    <td className="p-1 border-b">WORKS_AT</td>
                    <td className="p-1 border-b font-mono">
                      c2
                    </td>
                    <td className="p-1 border-b">
                      {JSON.stringify({
                        since: 2020,
                        role: "CTO",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b font-mono">
                      p1
                    </td>
                    <td className="p-1 border-b">KNOWS</td>
                    <td className="p-1 border-b font-mono">
                      p2
                    </td>
                    <td className="p-1 border-b">
                      {JSON.stringify({ since: 2018 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 font-mono">p2</td>
                    <td className="p-1">KNOWS</td>
                    <td className="p-1 font-mono">p3</td>
                    <td className="p-1">
                      {JSON.stringify({ since: 2015 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="w-1/3 h-full flex flex-col">
        <div className="text-sm font-medium mb-2 text-center">
          Visualisation du Graphe
        </div>
        <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
          <div className="h-full w-full relative">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 300 300"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Person Nodes */}
              <g>
                {/* Person 1 */}
                <circle
                  cx="75"
                  cy="75"
                  r="25"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <text
                  x="75"
                  y="75"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  John
                </text>
                <text
                  x="75"
                  y="90"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                >
                  Person
                </text>

                {/* Person 2 */}
                <circle
                  cx="200"
                  cy="75"
                  r="25"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <text
                  x="200"
                  y="75"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Alice
                </text>
                <text
                  x="200"
                  y="90"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                >
                  Person
                </text>

                {/* Person 3 */}
                <circle
                  cx="250"
                  cy="175"
                  r="25"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <text
                  x="250"
                  y="175"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Bob
                </text>
                <text
                  x="250"
                  y="190"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                >
                  Person
                </text>
              </g>

              {/* Company Nodes */}
              <g>
                {/* Company 1 */}
                <rect
                  x="50"
                  y="200"
                  width="50"
                  height="50"
                  rx="5"
                  fill="#cffafe"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <text
                  x="75"
                  y="220"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Acme Inc
                </text>
                <text
                  x="75"
                  y="235"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                >
                  Company
                </text>

                {/* Company 2 */}
                <rect
                  x="150"
                  y="200"
                  width="50"
                  height="50"
                  rx="5"
                  fill="#cffafe"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <text
                  x="175"
                  y="220"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  TechCorp
                </text>
                <text
                  x="175"
                  y="235"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                >
                  Company
                </text>
              </g>

              {/* Relationships */}
              <g>
                {/* WORKS_AT relationships */}
                <path
                  d="M 75,100 L 75,200"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="75,190 70,180 80,180"
                  fill="#06b6d4"
                />
                <text
                  x="50"
                  y="150"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#0891b2"
                >
                  WORKS_AT
                </text>

                <path
                  d="M 190,95 L 90,200"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="95,190 85,185 95,180"
                  fill="#06b6d4"
                />
                <text
                  x="130"
                  y="150"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#0891b2"
                >
                  WORKS_AT
                </text>

                <path
                  d="M 240,195 L 200,210"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="205,205 195,210 200,200"
                  fill="#06b6d4"
                />
                <text
                  x="225"
                  y="190"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#0891b2"
                >
                  WORKS_AT
                </text>

                {/* KNOWS relationships */}
                <path
                  d="M 100,75 L 175,75"
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="165,70 175,75 165,80"
                  fill="#6366f1"
                />
                <text
                  x="137"
                  y="65"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#4f46e5"
                >
                  KNOWS
                </text>

                <path
                  d="M 220,95 L 240,150"
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="235,140 240,150 225,145"
                  fill="#6366f1"
                />
                <text
                  x="240"
                  y="120"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#4f46e5"
                >
                  KNOWS
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Query & Results */}
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
    </>
  );
}
