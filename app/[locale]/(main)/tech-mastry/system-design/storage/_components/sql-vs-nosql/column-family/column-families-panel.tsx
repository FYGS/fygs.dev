export function ColumnFamiliesPanel() {
  return (
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
  );
}
