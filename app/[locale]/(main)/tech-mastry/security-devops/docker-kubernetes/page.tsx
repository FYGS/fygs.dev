import { Card } from "@/components/ui/card";
import { Container } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/security-devops/docker-kubernetes");

const concepts = [
  {
    title: "Container vs VM",
    desc: "Les conteneurs partagent le noyau OS, sont légers (~MB) et démarrent en secondes. Les VMs virtualisent tout le hardware, sont lourdes (~GB) et démarrent en minutes.",
    color: "border-cyan-500/30",
  },
  {
    title: "Dockerfile Best Practices",
    desc: "Multi-stage builds, .dockerignore, non-root user, layer caching. Les instructions RUN, COPY et ADD créent chacune un layer — regroupez-les et ordonnez-les pour tirer parti du cache.",
    color: "border-blue-500/30",
  },
  {
    title: "Kubernetes Architecture",
    desc: "Control Plane (API Server, Scheduler, Controller Manager, etcd) + Worker Nodes (Kubelet, Kube-Proxy, Container Runtime). Kubernetes sort environ trois versions mineures par an (1.37 à la date de rédaction) : vérifiez celle supportée par votre fournisseur.",
    color: "border-purple-500/30",
  },
];

const k8sResources = [
  {
    name: "Pod",
    desc: "Plus petite unité déployable. Un ou plusieurs conteneurs partageant réseau et stockage.",
  },
  {
    name: "Deployment",
    desc: "Gère le cycle de vie des Pods. Rolling updates, rollbacks, scaling.",
  },
  {
    name: "Service",
    desc: "Expose les Pods avec un point d'accès réseau stable (ClusterIP, NodePort, LoadBalancer).",
  },
  {
    name: "Ingress",
    desc: "Routage HTTP/HTTPS externe vers les Services internes. TLS termination. Le projet Ingress NGINX est retiré (maintenance arrêtée en mars 2026) : pour de nouveaux déploiements, privilégiez la Gateway API (HTTPRoute) ou un autre contrôleur maintenu.",
  },
  {
    name: "ConfigMap/Secret",
    desc: "Configuration externalisée et gestion des secrets. Un Secret n'est qu'encodé en base64 : le chiffrement au repos (etcd) se configure sur le cluster.",
  },
  {
    name: "HPA",
    desc: "Horizontal Pod Autoscaler. Scale automatique basé sur CPU/mémoire/métriques custom.",
  },
];

export default function DockerKubernetesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <Container className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Docker & Kubernetes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conteneurisation et orchestration : les fondations du déploiement
            cloud moderne.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Concepts Fondamentaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concepts.map((c) => (
            <Card key={c.title} className={"p-6 space-y-3 border-2 " + c.color}>
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Ressources Kubernetes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {k8sResources.map((r) => (
            <Card key={r.name} className="p-5 space-y-2 border-border/40">
              <h3 className="font-semibold text-primary">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Dockerfile Multi-Stage</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
          <code>{`# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:24-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
# Nécessite output: "standalone" dans next.config
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]`}</code>
        </pre>
      </section>
    </div>
  );
}
