"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Database,
  FileJson,
  LayoutGrid,
  Network,
  Table,
} from "lucide-react";
import { useState } from "react";

export function SqlVsNoSqlVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for selected database type
  const [dbType, setDbType] = useState<"sql" | "nosql">("sql");

  // State for selected NoSQL type
  const [nosqlType, setNosqlType] = useState<
    "document" | "key-value" | "column" | "graph"
  >("document");

  // State for query being shown
  const [queryType, setQueryType] = useState<
    "simple" | "complex" | "aggregation" | "update"
  >("simple");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          SQL vs NoSQL
        </CardTitle>
        <CardDescription>
          Comparez les bases de données relationnelles et non-relationnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Database Type Selector */}
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={dbType === "sql" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDbType("sql")}
                  className="flex items-center gap-1"
                >
                  <Table className="h-4 w-4" />
                  <span>SQL</span>
                </Button>
                <Button
                  variant={dbType === "nosql" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDbType("nosql")}
                  className="flex items-center gap-1"
                >
                  <FileJson className="h-4 w-4" />
                  <span>NoSQL</span>
                </Button>
              </div>

              {/* NoSQL Type Selector - Only visible when NoSQL is selected */}
              {dbType === "nosql" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex rounded-md border p-1 bg-muted/30"
                >
                  <Button
                    variant={nosqlType === "document" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setNosqlType("document")}
                    className="flex items-center gap-1"
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Document</span>
                  </Button>
                  <Button
                    variant={nosqlType === "key-value" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setNosqlType("key-value")}
                    className="flex items-center gap-1"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Clé-Valeur</span>
                  </Button>
                  <Button
                    variant={nosqlType === "column" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setNosqlType("column")}
                    className="flex items-center gap-1"
                  >
                    <Database className="h-4 w-4" />
                    <span>Colonne</span>
                  </Button>
                  <Button
                    variant={nosqlType === "graph" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setNosqlType("graph")}
                    className="flex items-center gap-1"
                  >
                    <Network className="h-4 w-4" />
                    <span>Graphe</span>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
              {dbType === "sql" ? (
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
              ) : (
                <div className="p-4 h-full flex flex-col">
                  {/* NoSQL Database Visualization */}
                  <div className="flex gap-4 h-full">
                    {nosqlType === "document" && (
                      <>
                        {/* Documents Collection */}
                        <div className="w-1/3 h-full flex flex-col">
                          <div className="text-sm font-medium mb-2 text-center">
                            Collection
                          </div>
                          <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
                            {/* Users Collection */}
                            <div className="mb-4">
                              <div className="bg-blue-900/30 p-2 rounded-t-md border border-blue-800">
                                <div className="font-medium text-sm">
                                  users (collection)
                                </div>
                              </div>
                              <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
                                <div className="p-2 bg-slate-900">
                                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                    {`// Document 1
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 28,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    }
  },
  "roles": ["user", "admin"],
  "created_at": "2023-01-15T08:30:00Z"
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            {/* Orders Collection */}
                            <div>
                              <div className="bg-green-900/30 p-2 rounded-t-md border border-green-800">
                                <div className="font-medium text-sm">
                                  orders (collection)
                                </div>
                              </div>
                              <div className="border border-t-0 border-slate-700 rounded-b-md overflow-hidden">
                                <div className="p-2 bg-slate-900">
                                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                    {`// Document 1
{
  "_id": "60a6f35d9f15f32d2c256236",
  "user_id": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product_id": "5f8d43e1c7ba06a8e456b293",
      "name": "Smartphone",
      "price": 699.99,
      "quantity": 1
    },
    {
      "product_id": "5f8d43e1c7ba06a8e456b294",
      "name": "Wireless Earbuds",
      "price": 149.99,
      "quantity": 2
    }
  ],
  "total": 999.97,
  "shipping": {
    "address": "123 Main St, New York, USA",
    "method": "express",
    "cost": 15.00
  },
  "status": "delivered",
  "payment": {
    "method": "credit_card",
    "transaction_id": "tr_123456789"
  },
  "order_date": "2023-06-10T14:20:00Z"
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Document Schema */}
                        <div className="w-1/3 h-full flex flex-col">
                          <div className="text-sm font-medium mb-2 text-center">
                            Schéma Flexible
                          </div>
                          <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
                            <div className="space-y-4">
                              <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-md">
                                <h4 className="text-sm font-medium mb-2 text-blue-300">
                                  Flexibilité du Schéma
                                </h4>
                                <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                                  <li>Pas de schéma fixe prédéfini</li>
                                  <li>
                                    Les documents d&apos;une même collection
                                    peuvent avoir des structures différentes
                                  </li>
                                  <li>
                                    Ajout de champs sans migration de schéma
                                  </li>
                                  <li>
                                    Structures imbriquées (objets et tableaux)
                                  </li>
                                </ul>
                              </div>

                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-slate-800 p-2 text-xs font-medium">
                                  Exemple: Documents avec structures différentes
                                </div>
                                <div className="p-2 bg-slate-900">
                                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                    {`// Document 1 dans la collection "users"
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "verified": true
}

// Document 2 dans la même collection
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "alice_smith",
  "email": "alice@example.com",
  "phone": "+1234567890",    // Champ supplémentaire
  "preferences": {          // Structure imbriquée
    "newsletter": true,
    "darkMode": false
  }
}`}
                                  </pre>
                                </div>
                              </div>

                              <div className="p-3 bg-amber-900/20 border border-amber-800 rounded-md">
                                <h4 className="text-sm font-medium mb-2 text-amber-300">
                                  Validation Optionnelle
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Bien que flexible, il est possible
                                  d&apos;ajouter des règles de validation:
                                </p>
                                <pre className="text-xs overflow-auto whitespace-pre-wrap bg-slate-900 p-2 rounded border">
                                  {`db.createCollection("users", {
  validator: {
    $jsonSchema: {
      required: ["username", "email"],
      properties: {
        username: { type: "string" },
        email: { type: "string" }
      }
    }
  }
})`}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Query & Results */}
                        <div className="w-1/3 h-full flex flex-col">
                          <div className="text-sm font-medium mb-2 text-center">
                            Requête NoSQL
                          </div>
                          <div className="flex-1 border rounded-md overflow-auto flex flex-col">
                            <div className="bg-slate-800 p-2 border-b">
                              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                {queryType === "simple" &&
                                  `// Recherche simple
db.users.find({
  "username": "john_doe"
})`}
                                {queryType === "complex" &&
                                  `// Recherche avec conditions multiples
db.orders.find({
  "user_id": "507f1f77bcf86cd799439011",
  "total": { $gt: 100 },
  "status": "delivered"
}).sort({ "order_date": -1 })`}
                                {queryType === "aggregation" &&
                                  `// Agrégation (total des commandes par utilisateur)
db.orders.aggregate([
  { $match: { "status": "delivered" } },
  { $group: {
      _id: "$user_id",
      order_count: { $sum: 1 },
      total_spent: { $sum: "$total" }
    }
  },
  { $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user_info"
    }
  },
  { $project: {
      _id: 0,
      username: { $arrayElemAt: ["$user_info.username", 0] },
      order_count: 1,
      total_spent: 1
    }
  }
])`}
                                {queryType === "update" &&
                                  `// Mise à jour avec opérations atomiques
db.orders.updateOne(
  { "_id": "60a6f35d9f15f32d2c256236" },
  {
    $set: { "status": "shipped" },
    $push: {
      "tracking": {
        "status": "en route",
        "timestamp": new Date(),
        "location": "Centre de distribution"
      }
    }
  }
)`}
                              </pre>
                            </div>
                            <div className="flex-1 p-2 bg-slate-900 overflow-auto">
                              <div className="text-xs font-medium mb-2">
                                Résultats:
                              </div>
                              {queryType === "simple" && (
                                <pre className="text-xs p-2 bg-slate-800 rounded border">
                                  {`[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "age": 28,
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      }
    },
    "roles": ["user", "admin"],
    "created_at": "2023-01-15T08:30:00Z"
  }
]`}
                                </pre>
                              )}
                              {queryType === "complex" && (
                                <pre className="text-xs p-2 bg-slate-800 rounded border">
                                  {`[
  {
    "_id": "60a6f35d9f15f32d2c256236",
    "user_id": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product_id": "5f8d43e1c7ba06a8e456b293",
        "name": "Smartphone",
        "price": 699.99,
        "quantity": 1
      },
      {
        "product_id": "5f8d43e1c7ba06a8e456b294",
        "name": "Wireless Earbuds",
        "price": 149.99,
        "quantity": 2
      }
    ],
    "total": 999.97,
    "shipping": {
      "address": "123 Main St, New York, USA",
      "method": "express",
      "cost": 15.00
    },
    "status": "delivered",
    "payment": {
      "method": "credit_card",
      "transaction_id": "tr_123456789"
    },
    "order_date": "2023-06-10T14:20:00Z"
  },
  // ... autres résultats
]`}
                                </pre>
                              )}
                              {queryType === "aggregation" && (
                                <pre className="text-xs p-2 bg-slate-800 rounded border">
                                  {`[
  {
    "username": "john_doe",
    "order_count": 5,
    "total_spent": 2450.75
  },
  {
    "username": "alice_smith",
    "order_count": 3,
    "total_spent": 1280.50
  }
]`}
                                </pre>
                              )}
                              {queryType === "update" && (
                                <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Opération réussie</span>
                                  </div>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <pre className="bg-slate-900 p-2 rounded border">
                                      {`{
  "acknowledged": true,
  "matchedCount": 1,
  "modifiedCount": 1
}`}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {nosqlType === "key-value" && (
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
                              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                {queryType === "simple" &&
                                  `// Récupération simple
GET user:1001`}
                                {queryType === "complex" &&
                                  `// Opérations multiples
MGET user:1001 user:1002 user:1003

// Ou avec pattern matching
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

// Mise à jour conditionnelle
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
                    )}

                    {nosqlType === "column" && (
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
                    )}

                    {nosqlType === "graph" && (
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
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Query Controls - Will be implemented in next steps */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={queryType === "simple" ? "default" : "outline"}
                size="sm"
                onClick={() => setQueryType("simple")}
              >
                Requête Simple
              </Button>
              <Button
                variant={queryType === "complex" ? "default" : "outline"}
                size="sm"
                onClick={() => setQueryType("complex")}
              >
                Requête Complexe
              </Button>
              <Button
                variant={queryType === "aggregation" ? "default" : "outline"}
                size="sm"
                onClick={() => setQueryType("aggregation")}
              >
                Agrégation
              </Button>
              <Button
                variant={queryType === "update" ? "default" : "outline"}
                size="sm"
                onClick={() => setQueryType("update")}
              >
                Mise à Jour
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bases de Données SQL</h3>
                <p className="text-muted-foreground">
                  Les bases de données SQL (Structured Query Language) sont
                  relationnelles et organisent les données dans des tables avec
                  des schémas prédéfinis.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Schéma fixe et prédéfini</li>
                    <li>Relations entre tables (clés étrangères)</li>
                    <li>Transactions ACID</li>
                    <li>Langage SQL standardisé</li>
                    <li>Mise à l&apos;échelle verticale principalement</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Bases de Données NoSQL
                </h3>
                <p className="text-muted-foreground">
                  Les bases de données NoSQL (Not Only SQL) sont
                  non-relationnelles et offrent une flexibilité de schéma pour
                  différents types de données.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Schéma flexible ou sans schéma</li>
                    <li>
                      Différents modèles de données (document, clé-valeur, etc.)
                    </li>
                    <li>Mise à l&apos;échelle horizontale facilitée</li>
                    <li>Performances élevées pour certains cas d&apos;usage</li>
                    <li>Cohérence éventuelle (selon le type)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Comparaison SQL vs NoSQL
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border">SQL</th>
                      <th className="p-2 text-left border">NoSQL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Structure</td>
                      <td className="p-2 border">
                        Tables avec lignes et colonnes
                      </td>
                      <td className="p-2 border">
                        Documents, paires clé-valeur, colonnes ou graphes
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Schéma</td>
                      <td className="p-2 border">Fixe et prédéfini</td>
                      <td className="p-2 border">Flexible ou sans schéma</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Requêtes</td>
                      <td className="p-2 border">SQL standardisé</td>
                      <td className="p-2 border">
                        Varie selon la base de données
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Relations</td>
                      <td className="p-2 border">Jointures entre tables</td>
                      <td className="p-2 border">
                        Généralement dénormalisé, données imbriquées
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Transactions</td>
                      <td className="p-2 border">ACID complet</td>
                      <td className="p-2 border">
                        Varie (souvent BASE, certains supportent ACID)
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Évolutivité</td>
                      <td className="p-2 border">Verticale principalement</td>
                      <td className="p-2 border">Horizontale facilitée</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">
                        Cas d&apos;usage
                      </td>
                      <td className="p-2 border">
                        Applications avec schéma stable et relations complexes
                      </td>
                      <td className="p-2 border">
                        Big data, contenu varié, évolution rapide du schéma
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Quand choisir SQL?
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Données structurées avec schéma stable</li>
                    <li>Relations complexes entre entités</li>
                    <li>Besoin de transactions ACID</li>
                    <li>Requêtes complexes avec jointures</li>
                    <li>Analyses et rapports avancés</li>
                    <li>Applications financières ou de comptabilité</li>
                  </ul>
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Exemples:</span> MySQL,
                    PostgreSQL, Oracle, SQL Server
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Quand choisir NoSQL?
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Données non structurées ou semi-structurées</li>
                    <li>Schéma évolutif ou inconnu à l&apos;avance</li>
                    <li>Grands volumes de données</li>
                    <li>Besoin de mise à l&apos;échelle horizontale</li>
                    <li>Développement rapide et itératif</li>
                    <li>Applications temps réel ou IoT</li>
                  </ul>
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Exemples:</span> MongoDB,
                    Redis, Cassandra, Neo4j
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
