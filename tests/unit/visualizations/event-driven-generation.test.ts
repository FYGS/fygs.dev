import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createEvent,
  getConsumerServices,
  getEventInterval,
  pickEventAndProducer,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/event-generation";
import { generateEventPayload } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/event-payload";
import {
  getBrokerColor,
  getBrokerName,
  getServiceByType,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/broker-helpers";
import {
  INITIAL_EVENT_BROKER,
  INITIAL_SERVICES,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/data";

afterEach(() => vi.restoreAllMocks());

describe("event-driven helpers", () => {
  it("maps scenarios to event intervals", () => {
    expect(getEventInterval("normal")).toBe(1000);
    expect(getEventInterval("high-load")).toBe(300);
    expect(getEventInterval("failure")).toBe(800);
  });

  it("picks an event type and producer from the random value", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pickEventAndProducer()).toEqual({ eventType: "order_placed", producerType: "order" });
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(pickEventAndProducer()).toEqual({ eventType: "notification_sent", producerType: "inventory" });
  });

  it("routes each event type to its consumers", () => {
    expect(getConsumerServices("order_placed")).toEqual(["payment", "inventory"]);
    expect(getConsumerServices("payment_processed")).toEqual(["shipping", "notification"]);
    expect(getConsumerServices("inventory_updated")).toEqual(["shipping"]);
    expect(getConsumerServices("shipment_created")).toEqual(["notification"]);
    expect(getConsumerServices("notification_sent")).toEqual([]);
  });

  it("generates payloads per event type", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(generateEventPayload("order_placed", "order")).toMatchObject({
      orderId: "ORD-5000",
      customerId: "CUST-2500",
      totalAmount: 500,
    });
    expect(generateEventPayload("payment_processed", "payment")).toMatchObject({
      paymentId: "PAY-5000",
      method: "paypal",
      status: "success",
    });
    expect(generateEventPayload("inventory_updated", "inventory")).toMatchObject({
      quantityChanged: 0,
      warehouseId: "WH-5",
    });
    expect(generateEventPayload("shipment_created", "order")).toMatchObject({ carrier: "FedEx" });
    expect(generateEventPayload("notification_sent", "order")).toMatchObject({
      channel: "sms",
      subject: "Shipment Update",
    });
  });

  it("names and colours brokers", () => {
    expect(getBrokerName("kafka")).toBe("Apache Kafka");
    expect(getBrokerName("redis")).toBe("Redis Pub/Sub");
    expect(getBrokerColor("nats")).toBe("#0ea5e9");
    expect(getServiceByType("payment", INITIAL_SERVICES)?.position).toEqual({ x: 100, y: 250 });
  });

  it("creates an event travelling producer -> broker -> (consumer -> broker)*", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const producer = INITIAL_SERVICES[0];
    const event = createEvent({
      id: 4,
      eventType: "order_placed",
      producer,
      producerType: "order",
      consumerServices: ["payment", "inventory"],
      services: INITIAL_SERVICES,
      eventBroker: INITIAL_EVENT_BROKER,
      scenario: "high-load",
    });
    expect(event).toMatchObject({
      id: 4,
      status: "created",
      speed: 1.5,
      topic: "order",
      retryCount: 0,
      currentPathIndex: 0,
      priority: "medium",
      size: 550,
      correlationId: "1700000000000-500000",
    });
    expect(event.path).toEqual([
      { x: 100, y: 150 },
      { x: 400, y: 250 },
      { x: 100, y: 250 },
      { x: 400, y: 250 },
      { x: 100, y: 350 },
      { x: 400, y: 250 },
    ]);
  });
});
