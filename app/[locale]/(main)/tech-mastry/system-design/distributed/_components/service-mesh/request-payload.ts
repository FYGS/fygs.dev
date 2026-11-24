import type { RequestPayload } from "./types";

// Generate a request payload based on method and target service
export function generateRequestPayload(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  targetService: string
): RequestPayload {
  switch (targetService) {
    case "auth":
      if (method === "POST") {
        return {
          username: `user${Math.floor(Math.random() * 1000)}`,
          password: "********",
          rememberMe: Math.random() > 0.5,
        };
      } else {
        return {
          token: `jwt-${Math.random().toString(36).substring(2, 15)}`,
          expiresIn: 3600,
        };
      }
    case "users":
      if (method === "GET") {
        return {
          userId: `usr-${Math.floor(Math.random() * 10000)}`,
          includeOrders: Math.random() > 0.5,
        };
      } else if (method === "POST") {
        return {
          name: `User ${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
          role: Math.random() > 0.8 ? "admin" : "user",
        };
      } else {
        return {
          userId: `usr-${Math.floor(Math.random() * 10000)}`,
          fields: ["name", "email", "preferences"],
        };
      }
    case "products":
      if (method === "GET") {
        return {
          category: ["electronics", "clothing", "books", "home"][
            Math.floor(Math.random() * 4)
          ],
          limit: Math.floor(Math.random() * 50) + 10,
          sort: Math.random() > 0.5 ? "price" : "popularity",
        };
      } else if (method === "POST") {
        return {
          name: `Product ${Math.floor(Math.random() * 1000)}`,
          price: Math.floor(Math.random() * 10000) / 100,
          description: "A new product description",
          category: ["electronics", "clothing", "books", "home"][
            Math.floor(Math.random() * 4)
          ],
          inStock: Math.random() > 0.2,
        };
      } else {
        return {
          productId: `prod-${Math.floor(Math.random() * 10000)}`,
          fields: ["price", "inStock", "description"],
        };
      }
    case "orders":
      if (method === "GET") {
        return {
          userId: `usr-${Math.floor(Math.random() * 10000)}`,
          status: ["pending", "processing", "shipped", "delivered"][
            Math.floor(Math.random() * 4)
          ],
          limit: Math.floor(Math.random() * 10) + 5,
        };
      } else if (method === "POST") {
        return {
          userId: `usr-${Math.floor(Math.random() * 10000)}`,
          items: Array(Math.floor(Math.random() * 5) + 1)
            .fill(0)
            .map(() => ({
              productId: `prod-${Math.floor(Math.random() * 10000)}`,
              quantity: Math.floor(Math.random() * 5) + 1,
              price: Math.floor(Math.random() * 10000) / 100,
            })),
          shippingAddress: {
            street: "123 Main St",
            city: "Anytown",
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          },
          paymentMethod: ["credit_card", "paypal", "bank_transfer"][
            Math.floor(Math.random() * 3)
          ],
        };
      } else {
        return {
          orderId: `ord-${Math.floor(Math.random() * 10000)}`,
          status: ["processing", "shipped", "delivered"][
            Math.floor(Math.random() * 3)
          ],
        };
      }
    default:
      return {
        timestamp: new Date().toISOString(),
        requestId: `req-${Math.floor(Math.random() * 1000000)}`,
      };
  }
}
