export function GraphData() {
  return (
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
  );
}
