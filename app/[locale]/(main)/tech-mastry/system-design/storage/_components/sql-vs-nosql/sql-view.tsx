"use client";

import { CheckCircle } from "lucide-react";

export function SqlView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <div className="p-4 h-full flex flex-col">
      {/* SQL Database Visualization */}
      <div className="flex gap-4 h-full">
        {/* Tables Section */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="text-sm font-medium mb-2 text-center">
            Tables
          </div>
          <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
            {/* Users Table */}
            <div className="mb-4">
              <div className="bg-blue-900/30 p-2 rounded-t-md border border-blue-800">
                <div className="font-medium text-sm">users</div>
              </div>
              <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border-b">
                        Column
                      </th>
                      <th className="p-1 text-left border-b">
                        Type
                      </th>
                      <th className="p-1 text-left border-b">
                        Key
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border-b">id</td>
                      <td className="p-1 border-b">int</td>
                      <td className="p-1 border-b">PK</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">username</td>
                      <td className="p-1 border-b">varchar</td>
                      <td className="p-1 border-b"></td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">email</td>
                      <td className="p-1 border-b">varchar</td>
                      <td className="p-1 border-b">UQ</td>
                    </tr>
                    <tr>
                      <td className="p-1">created_at</td>
                      <td className="p-1">timestamp</td>
                      <td className="p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Table */}
            <div className="mb-4">
              <div className="bg-green-900/30 p-2 rounded-t-md border border-green-800">
                <div className="font-medium text-sm">orders</div>
              </div>
              <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border-b">
                        Column
                      </th>
                      <th className="p-1 text-left border-b">
                        Type
                      </th>
                      <th className="p-1 text-left border-b">
                        Key
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border-b">id</td>
                      <td className="p-1 border-b">int</td>
                      <td className="p-1 border-b">PK</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">user_id</td>
                      <td className="p-1 border-b">int</td>
                      <td className="p-1 border-b">FK</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">total</td>
                      <td className="p-1 border-b">decimal</td>
                      <td className="p-1 border-b"></td>
                    </tr>
                    <tr>
                      <td className="p-1">order_date</td>
                      <td className="p-1">timestamp</td>
                      <td className="p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Products Table */}
            <div>
              <div className="bg-amber-900/30 p-2 rounded-t-md border border-amber-800">
                <div className="font-medium text-sm">products</div>
              </div>
              <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border-b">
                        Column
                      </th>
                      <th className="p-1 text-left border-b">
                        Type
                      </th>
                      <th className="p-1 text-left border-b">
                        Key
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border-b">id</td>
                      <td className="p-1 border-b">int</td>
                      <td className="p-1 border-b">PK</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">name</td>
                      <td className="p-1 border-b">varchar</td>
                      <td className="p-1 border-b"></td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b">price</td>
                      <td className="p-1 border-b">decimal</td>
                      <td className="p-1 border-b"></td>
                    </tr>
                    <tr>
                      <td className="p-1">stock</td>
                      <td className="p-1">int</td>
                      <td className="p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Schema Diagram */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="text-sm font-medium mb-2 text-center">
            Schéma Relationnel
          </div>
          <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
            <div className="min-h-[500px]">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 500"
                preserveAspectRatio="xMidYMin meet"
              >
                {/* Users Table */}
                <g transform="translate(50, 50)">
                  <rect
                    width="200"
                    height="100"
                    rx="5"
                    fill="#dbeafe"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                  <text
                    x="100"
                    y="25"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    users
                  </text>
                  <line
                    x1="20"
                    y1="35"
                    x2="180"
                    y2="35"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                  <text x="30" y="55" fontSize="12">
                    id (PK)
                  </text>
                  <text x="30" y="75" fontSize="12">
                    username
                  </text>
                  <text x="30" y="95" fontSize="12">
                    email
                  </text>
                </g>

                {/* Orders Table */}
                <g transform="translate(50, 200)">
                  <rect
                    width="200"
                    height="100"
                    rx="5"
                    fill="#dcfce7"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text
                    x="100"
                    y="25"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    orders
                  </text>
                  <line
                    x1="20"
                    y1="35"
                    x2="180"
                    y2="35"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text x="30" y="55" fontSize="12">
                    id (PK)
                  </text>
                  <text x="30" y="75" fontSize="12">
                    user_id (FK)
                  </text>
                  <text x="30" y="95" fontSize="12">
                    total
                  </text>
                </g>

                {/* Products Table */}
                <g transform="translate(50, 350)">
                  <rect
                    width="200"
                    height="100"
                    rx="5"
                    fill="#fef3c7"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text
                    x="100"
                    y="25"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    products
                  </text>
                  <line
                    x1="20"
                    y1="35"
                    x2="180"
                    y2="35"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text x="30" y="55" fontSize="12">
                    id (PK)
                  </text>
                  <text x="30" y="75" fontSize="12">
                    name
                  </text>
                  <text x="30" y="95" fontSize="12">
                    price
                  </text>
                </g>

                {/* Relationship Lines */}
                {/* Users to Orders (1:N) */}
                <path
                  d="M 150,150 L 150,200"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <circle cx="150" cy="150" r="3" fill="#3b82f6" />
                <circle cx="150" cy="200" r="3" fill="#10b981" />

                {/* Orders to Products (N:M) */}
                <path
                  d="M 150,300 L 150,350"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <circle cx="150" cy="300" r="3" fill="#10b981" />
                <circle cx="150" cy="350" r="3" fill="#f59e0b" />

                {/* Relationship Labels */}
                <text x="160" y="175" fontSize="10" fill="#64748b">
                  1:N
                </text>
                <text x="160" y="325" fontSize="10" fill="#64748b">
                  N:M
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Query & Results */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="text-sm font-medium mb-2 text-center">
            Requête SQL
          </div>
          <div className="flex-1 border rounded-md overflow-auto flex flex-col">
            <div className="bg-slate-800 p-2 border-b">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {queryType === "simple" &&
                  `SELECT * FROM users
WHERE id = 1;`}
                {queryType === "complex" &&
                  `SELECT u.username, o.total, o.order_date
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
ORDER BY o.order_date DESC;`}
                {queryType === "aggregation" &&
                  `SELECT u.username,
       COUNT(o.id) as order_count,
       SUM(o.total) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING COUNT(o.id) > 2;`}
                {queryType === "update" &&
                  `BEGIN TRANSACTION;

UPDATE products
SET stock = stock - 1
WHERE id = 5;

UPDATE orders
SET total = 150.00
WHERE id = 10;

COMMIT;`}
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
                      <th className="p-1 text-left border">id</th>
                      <th className="p-1 text-left border">
                        username
                      </th>
                      <th className="p-1 text-left border">
                        email
                      </th>
                      <th className="p-1 text-left border">
                        created_at
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border">1</td>
                      <td className="p-1 border">john_doe</td>
                      <td className="p-1 border">
                        john@example.com
                      </td>
                      <td className="p-1 border">
                        2023-01-15 08:30:00
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {queryType === "complex" && (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        username
                      </th>
                      <th className="p-1 text-left border">
                        total
                      </th>
                      <th className="p-1 text-left border">
                        order_date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border">john_doe</td>
                      <td className="p-1 border">250.00</td>
                      <td className="p-1 border">
                        2023-06-10 14:20:00
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border">alice_smith</td>
                      <td className="p-1 border">180.50</td>
                      <td className="p-1 border">
                        2023-06-05 09:15:00
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border">john_doe</td>
                      <td className="p-1 border">120.75</td>
                      <td className="p-1 border">
                        2023-05-28 16:45:00
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {queryType === "aggregation" && (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="p-1 text-left border">
                        username
                      </th>
                      <th className="p-1 text-left border">
                        order_count
                      </th>
                      <th className="p-1 text-left border">
                        total_spent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border">john_doe</td>
                      <td className="p-1 border">5</td>
                      <td className="p-1 border">750.25</td>
                    </tr>
                    <tr>
                      <td className="p-1 border">alice_smith</td>
                      <td className="p-1 border">3</td>
                      <td className="p-1 border">420.80</td>
                    </tr>
                  </tbody>
                </table>
              )}
              {queryType === "update" && (
                <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Transaction complétée avec succès</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    2 lignes affectées (1 dans products, 1 dans
                    orders)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
