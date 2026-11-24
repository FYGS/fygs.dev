import type { EventType, ServiceType } from "./types";

// Helper function to generate event payload based on event type
export const generateEventPayload = (
  eventType: EventType,
  _producerType: ServiceType // Prefix with underscore to indicate it's not used
): { [key: string]: unknown } => {
  switch (eventType) {
    case "order_placed":
      return {
        orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
        customerId: `CUST-${Math.floor(Math.random() * 5000)}`,
        items: Array(Math.floor(Math.random() * 5) + 1)
          .fill(0)
          .map(() => ({
            productId: `PROD-${Math.floor(Math.random() * 1000)}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            price: Math.floor(Math.random() * 10000) / 100,
          })),
        totalAmount: Math.floor(Math.random() * 100000) / 100,
        timestamp: new Date().toISOString(),
      };
    case "payment_processed":
      return {
        paymentId: `PAY-${Math.floor(Math.random() * 10000)}`,
        orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
        amount: Math.floor(Math.random() * 100000) / 100,
        method: ["credit_card", "paypal", "bank_transfer"][
          Math.floor(Math.random() * 3)
        ],
        status: "success",
        timestamp: new Date().toISOString(),
      };
    case "inventory_updated":
      return {
        inventoryId: `INV-${Math.floor(Math.random() * 10000)}`,
        productId: `PROD-${Math.floor(Math.random() * 1000)}`,
        quantityChanged: Math.floor(Math.random() * 10) - 5,
        newQuantity: Math.floor(Math.random() * 100),
        warehouseId: `WH-${Math.floor(Math.random() * 10)}`,
        timestamp: new Date().toISOString(),
      };
    case "shipment_created":
      return {
        shipmentId: `SHIP-${Math.floor(Math.random() * 10000)}`,
        orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
        carrier: ["DHL", "FedEx", "UPS"][Math.floor(Math.random() * 3)],
        trackingNumber: `TRK-${Math.floor(Math.random() * 1000000)}`,
        estimatedDelivery: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        timestamp: new Date().toISOString(),
      };
    case "notification_sent":
      return {
        notificationId: `NOTIF-${Math.floor(Math.random() * 10000)}`,
        recipientId: `CUST-${Math.floor(Math.random() * 5000)}`,
        channel: ["email", "sms", "push"][Math.floor(Math.random() * 3)],
        subject: [
          "Order Confirmation",
          "Shipment Update",
          "Payment Received",
        ][Math.floor(Math.random() * 3)],
        status: "sent",
        timestamp: new Date().toISOString(),
      };
    default:
      return {
        id: `EVENT-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
      };
  }
};
