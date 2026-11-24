"use client";

import { CheckCircle } from "lucide-react";

export function DocumentStoreView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
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
                <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
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
                <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
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
                <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
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
              <pre className="text-xs overflow-auto whitespace-pre-wrap bg-slate-900 p-2 rounded border" tabIndex={0}>
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
            <pre className="text-xs overflow-auto whitespace-pre-wrap" tabIndex={0}>
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
  );
}
