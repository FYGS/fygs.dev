"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Send,
  Radio,
  Layers,
  Zap,
  Server,
} from "lucide-react";
import { useState, useEffect } from "react";

type QueuedMessage = { id: number; text: string; status: "queued" | "processing" | "done" };

/** Starts the oldest queued message unless one is already being processed. */
function startNext(messages: QueuedMessage[]): QueuedMessage[] {
  if (messages.some((m) => m.status === "processing")) return messages;
  const next = messages.find((m) => m.status === "queued");
  if (!next) return messages;
  return messages.map((m) => (m.id === next.id ? { ...m, status: "processing" } : m));
}

function MessageQueueDemo() {
  const [messages, setMessages] = useState<QueuedMessage[]>([]);
  const [counter, setCounter] = useState(0);

  const enqueue = () => {
    const id = counter + 1;
    setCounter(id);
    setMessages((prev) => startNext([...prev, { id, text: `Message #${id}`, status: "queued" }]));
  };

  // Finish the message being processed after a delay, then start the next one.
  // Keyed on the processing id so that enqueueing meanwhile does not cancel the timer.
  const processingId = messages.find((m) => m.status === "processing")?.id;
  useEffect(() => {
    if (processingId === undefined) return;
    const timer = setTimeout(() => {
      setMessages((prev) =>
        startNext(prev.map((m) => (m.id === processingId ? { ...m, status: "done" } : m))),
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [processingId]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Inbox className="w-5 h-5 text-blue-400" /> Message Queue (FIFO)
      </h3>
      <p className="text-sm text-muted-foreground">
        Les messages sont traites dans l&apos;ordre d&apos;arrivee (First In,
        First Out). Cliquez pour ajouter des messages.
      </p>
      <div className="flex gap-3">
        <button
          onClick={enqueue}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          <Send className="w-4 h-4" /> Publish Message
        </button>
        <button
          onClick={() => {
            setMessages([]);
            setCounter(0);
          }}
          className="px-4 py-2 rounded-lg border border-border text-sm"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-400 flex items-center gap-1">
            <Inbox className="w-3 h-3" /> Queue
          </p>
          <div className="space-y-1 min-h-[100px]">
            {messages
              .filter((m) => m.status === "queued")
              .map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-mono animate-fadeIn"
                >
                  {m.text}
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <p className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Processing
          </p>
          <div className="space-y-1 min-h-[100px] w-full">
            {messages
              .filter((m) => m.status === "processing")
              .map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-mono animate-pulse"
                >
                  {m.text}
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Done
          </p>
          <div className="space-y-1 min-h-[100px]">
            {messages
              .filter((m) => m.status === "done")
              .map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-mono"
                >
                  {m.text}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PubSubFlow() {
  const [published, setPublished] = useState<string[]>([]);
  const subscribers = [
    {
      name: "Email Service",
      icon: Send,
      color: "text-blue-400",
      topics: ["order.created", "user.registered"],
    },
    {
      name: "Inventory Service",
      icon: Layers,
      color: "text-green-400",
      topics: ["order.created", "order.canceled"],
    },
    {
      name: "Analytics Service",
      icon: Radio,
      color: "text-purple-400",
      topics: ["order.created", "user.registered", "order.canceled"],
    },
    {
      name: "Notification Service",
      icon: MessageSquare,
      color: "text-orange-400",
      topics: ["order.created"],
    },
  ];
  const topics = ["order.created", "user.registered", "order.canceled"];

  const publish = (topic: string) => {
    setPublished((prev) => [...prev, topic]);
    setTimeout(() => setPublished((prev) => prev.slice(1)), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Radio className="w-5 h-5 text-purple-400" /> Publish/Subscribe Pattern
      </h3>
      <p className="text-sm text-muted-foreground">
        Le publisher envoie un evenement, tous les subscribers abonnes a ce
        topic le recoivent automatiquement.
      </p>
      <div className="flex gap-2 flex-wrap">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => publish(t)}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {subscribers.map((sub) => {
          const Icon = sub.icon;
          const receiving = published.some((p) => sub.topics.includes(p));
          return (
            <div
              key={sub.name}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${receiving ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "border-border/20 bg-muted/10"}`}
            >
              <Icon
                className={`w-5 h-5 ${sub.color} shrink-0 ${receiving ? "animate-bounce" : ""}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{sub.name}</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {sub.topics.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className={`text-[9px] ${published.includes(t) ? "bg-primary/10 text-primary" : ""}`}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              {receiving && (
                <span className="text-xs text-green-500 font-bold shrink-0">
                  RECEIVING
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrokerComparison() {
  const [selected, setSelected] = useState<
    "kafka" | "rabbitmq" | "redis" | "sqs"
  >("kafka");
  const brokers = {
    kafka: {
      name: "Apache Kafka",
      type: "Event Streaming",
      throughput: "Millions/sec",
      latency: "~5ms",
      ordering: "Par partition",
      persistence: "Durable (configurable)",
      useCase: "Event sourcing, logs, analytics real-time, CDC",
      pros: [
        "Throughput massif",
        "Replay des events",
        "Retention configurable",
        "Partitioning natif",
      ],
      cons: [
        "Complexe a operer",
        "Latence plus elevee",
        "Necessite Zookeeper/KRaft",
      ],
    },
    rabbitmq: {
      name: "RabbitMQ",
      type: "Message Broker",
      throughput: "~50K/sec",
      latency: "~1ms",
      ordering: "Par queue",
      persistence: "Optionnelle",
      useCase: "Task queues, RPC, routing complexe",
      pros: [
        "Routing flexible (exchanges)",
        "Faible latence",
        "Protocole AMQP standard",
        "Simple a demarrer",
      ],
      cons: [
        "Throughput limite",
        "Pas de replay",
        "Scaling horizontal difficile",
      ],
    },
    redis: {
      name: "Redis Streams",
      type: "In-Memory Streaming",
      throughput: "~100K/sec",
      latency: "< 1ms",
      ordering: "Par stream",
      persistence: "Optionnelle (AOF/RDB)",
      useCase: "Real-time notifications, caching + messaging",
      pros: [
        "Ultra-faible latence",
        "Simple",
        "Polyvalent (cache + queue)",
        "Consumer groups",
      ],
      cons: ["Limite par la RAM", "Pas de routing avance", "Single-threaded"],
    },
    sqs: {
      name: "AWS SQS",
      type: "Managed Queue",
      throughput: "Illimite",
      latency: "~10ms",
      ordering: "FIFO optionnel",
      persistence: "4 jours (max 14)",
      useCase: "Decouplage microservices, serverless",
      pros: [
        "Zero ops",
        "Scaling automatique",
        "Integre avec AWS Lambda",
        "Pas cher",
      ],
      cons: [
        "Vendor lock-in",
        "Latence plus elevee",
        "Fonctionnalites limitees",
      ],
    },
  };
  const current = brokers[selected];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Server className="w-5 h-5 text-orange-400" /> Comparaison des Message
        Brokers
      </h3>
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(brokers) as Array<keyof typeof brokers>).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selected === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {brokers[key].name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">Type</p>
          <p className="text-sm font-semibold mt-1">{current.type}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">Throughput</p>
          <p className="text-sm font-semibold mt-1">{current.throughput}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">Latence</p>
          <p className="text-sm font-semibold mt-1">{current.latency}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">Ordering</p>
          <p className="text-sm font-semibold mt-1">{current.ordering}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Cas d&apos;usage:</span>{" "}
        {current.useCase}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-green-400">Avantages</p>
          {current.pros.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              {p}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-400">Inconvenients</p>
          {current.cons.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <ArrowRight className="w-3 h-3 text-red-400 shrink-0" />
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventDrivenArchitecture() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      label: "Event Producer",
      desc: "Un service emet un evenement (ex: OrderService)",
      color: "text-blue-400",
      icon: Send,
    },
    {
      label: "Event Bus / Broker",
      desc: "Le broker recoit et distribue l'evenement",
      color: "text-purple-400",
      icon: Radio,
    },
    {
      label: "Event Consumer(s)",
      desc: "Les services abonnes traitent l'evenement",
      color: "text-green-400",
      icon: Inbox,
    },
    {
      label: "Side Effects",
      desc: "Chaque consumer produit son effet (email, stock, analytics)",
      color: "text-orange-400",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" /> Event-Driven Architecture
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${activeStep === i ? "bg-primary/5 border-primary/30" : "border-border/20 hover:border-border/50"}`}
              >
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      <div className="p-5 rounded-xl bg-muted/20 border border-border/20">
        <p className="text-sm">{steps[activeStep].desc}</p>
      </div>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
        <code>{`// Event-Driven Pattern
class OrderService {
  async createOrder(data: OrderData) {
    const order = await db.order.create({ data });

    // Emit event instead of calling services directly
    await eventBus.publish("order.created", {
      orderId: order.id,
      userId: order.userId,
      items: order.items,
      total: order.total,
      timestamp: new Date().toISOString(),
    });

    return order;
  }
}

// Each service handles its own concern
eventBus.subscribe("order.created", async (event) => {
  await emailService.sendConfirmation(event);
});

eventBus.subscribe("order.created", async (event) => {
  await inventoryService.decrementStock(event.items);
});

eventBus.subscribe("order.created", async (event) => {
  await analyticsService.trackPurchase(event);
});`}</code>
      </pre>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Messaging & Event-Driven
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Queues, Pub/Sub, Kafka vs RabbitMQ &mdash; maitrisez la
            communication asynchrone entre services.
          </p>
        </div>
      </section>
      <Card className="p-8 border-border/40">
        <MessageQueueDemo />
      </Card>
      <Card className="p-8 border-border/40">
        <PubSubFlow />
      </Card>
      <Card className="p-8 border-border/40">
        <BrokerComparison />
      </Card>
      <Card className="p-8 border-border/40">
        <EventDrivenArchitecture />
      </Card>
    </div>
  );
}
