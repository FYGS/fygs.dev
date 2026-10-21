"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Box,
  Cloud,
  Shield,
  Gauge,
  Server,
} from "lucide-react";
import { useState } from "react";

function CiCdPipeline() {
  const [activeStage, setActiveStage] = useState(0);
  const stages = [
    {
      name: "Source",
      icon: GitBranch,
      color: "text-blue-400",
      desc: "Développeur pousse du code sur une branche. Le pipeline se déclenche automatiquement.",
      tools: ["GitHub", "GitLab", "Bitbucket"],
      yaml: `# Trigger
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]`,
    },
    {
      name: "Build",
      icon: Box,
      color: "text-yellow-400",
      desc: "Compile le code, génère les artifacts, vérifie les types TypeScript.",
      tools: ["Docker", "Webpack", "tsc"],
      yaml: `build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: 20 }
    - run: pnpm install --frozen-lockfile
    - run: pnpm build
    - run: pnpm type-check`,
    },
    {
      name: "Test",
      icon: Shield,
      color: "text-green-400",
      desc: "Exécute les tests unitaires, d'intégration et les checks de qualité.",
      tools: ["Vitest", "Playwright", "ESLint"],
      yaml: `test:
  needs: build
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
      env: { POSTGRES_DB: test }
  steps:
    - run: pnpm test:unit --coverage
    - run: pnpm test:integration
    - run: pnpm lint
    - uses: codecov/codecov-action@v3`,
    },
    {
      name: "Security",
      icon: Shield,
      color: "text-red-400",
      desc: "Scan des vulnérabilités dans les dépendances et le code.",
      tools: ["Snyk", "Trivy", "npm audit"],
      yaml: `security:
  needs: build
  steps:
    - run: pnpm audit --audit-level=high
    - uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        severity: 'CRITICAL,HIGH'
    - uses: snyk/actions/node@master
      env: { SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }} }`,
    },
    {
      name: "Deploy Staging",
      icon: Cloud,
      color: "text-purple-400",
      desc: "Déploie sur l'environnement de staging pour validation.",
      tools: ["Vercel", "AWS", "Docker"],
      yaml: `deploy-staging:
  needs: [test, security]
  runs-on: ubuntu-latest
  environment: staging
  steps:
    - run: docker build -t app:$GITHUB_SHA .
    - run: docker push registry/app:$GITHUB_SHA
    - run: kubectl set image deployment/app app=registry/app:$GITHUB_SHA
    - run: kubectl rollout status deployment/app`,
    },
    {
      name: "Deploy Production",
      icon: Server,
      color: "text-orange-400",
      desc: "Déploie en production avec rollback automatique si les health checks échouent.",
      tools: ["Kubernetes", "Terraform", "ArgoCD"],
      yaml: `deploy-production:
  needs: deploy-staging
  runs-on: ubuntu-latest
  environment: production
  steps:
    - run: kubectl set image deployment/app app=registry/app:$GITHUB_SHA --namespace=production
    - run: kubectl rollout status deployment/app --timeout=300s
    - name: Rollback on failure
      if: failure()
      run: kubectl rollout undo deployment/app`,
    },
  ];
  const current = stages[activeStage];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <GitBranch className="w-6 h-6 text-blue-400" /> CI/CD Pipeline
      </h2>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stages.map((s, i) => {
          const I = s.icon;
          return (
            <div key={s.name} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveStage(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${activeStage === i ? "bg-primary/10 text-primary border-primary/30" : i < activeStage ? "border-green-500/20 text-green-400" : "border-border/20"}`}
              >
                {i < activeStage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <I
                    className={`w-3.5 h-3.5 ${activeStage === i ? s.color : ""}`}
                  />
                )}
                {s.name}
              </button>
              {i < stages.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <Card className="p-6 space-y-4 border-border/40">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${current.color}`} />
          <div>
            <h3 className="font-bold text-lg">{current.name}</h3>
            <p className="text-sm text-muted-foreground">{current.desc}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {current.tools.map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
        <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
          <code>{current.yaml}</code>
        </pre>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
          disabled={activeStage === 0}
          className="px-4 py-2 rounded-lg bg-muted text-sm disabled:opacity-30"
        >
          Précédent
        </button>
        <button
          onClick={() =>
            setActiveStage(Math.min(stages.length - 1, activeStage + 1))
          }
          disabled={activeStage === stages.length - 1}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-30"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function DockerGuide() {
  const [activeSection, setActiveSection] = useState(0);
  const sections = [
    {
      name: "Dockerfile",
      code: `# Multi-stage build — production optimized
FROM node:20-alpine AS base
RUN corepack enable

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Production (minimal image)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]

# Result: ~150MB vs ~1.5GB (90% smaller)`,
    },
    {
      name: "Docker Compose",
      code: `# docker-compose.yml — development
services:
  app:
    build: .
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_started }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: password
    volumes: ["pgdata:/var/lib/postgresql/data"]
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:`,
    },
    {
      name: "Best Practices",
      code: `# ✅ Docker Best Practices

# 1. Use specific image tags (never :latest in prod)
FROM node:20.11.1-alpine3.19

# 2. Multi-stage builds (reduce image size)
# Build stage → 1.5GB  |  Production stage → 150MB

# 3. .dockerignore (don't COPY unnecessary files)
# node_modules, .git, .env, *.md, tests/

# 4. Non-root user (security)
USER app  # Never run as root in production

# 5. Health checks
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:3000/api/health || exit 1

# 6. Layer caching (order matters!)
COPY package.json pnpm-lock.yaml ./  # Changes rarely
RUN pnpm install                      # Cached if lockfile unchanged
COPY . .                              # Changes often (cache busted)

# 7. Security scanning
# docker scout cves myimage:latest
# trivy image myimage:latest`,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Box className="w-6 h-6 text-cyan-400" /> Docker & Conteneurisation
      </h2>
      <div className="flex gap-2">
        {sections.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setActiveSection(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeSection === i ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20 max-h-[400px] overflow-y-auto" tabIndex={0}>
        <code>{sections[activeSection].code}</code>
      </pre>
    </div>
  );
}

function ProductionChecklist() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const categories = [
    {
      name: "Infrastructure",
      color: "text-blue-400",
      items: [
        "Environnements séparés : dev / staging / production",
        "Infrastructure as Code (Terraform, Pulumi, CDK)",
        "Auto-scaling configuré avec métriques CPU/memory",
        "Load balancer avec health checks",
      ],
    },
    {
      name: "Security",
      color: "text-red-400",
      items: [
        "Secrets dans un vault (AWS SM, Vault, Doppler)",
        "SSL/TLS automatisé (Let's Encrypt, cert-manager)",
        "WAF (Web Application Firewall) activé",
        "Network policies / Security groups",
      ],
    },
    {
      name: "Observability",
      color: "text-green-400",
      items: [
        "Logging centralisé (ELK, Loki, Datadog)",
        "Metrics & dashboards (Prometheus + Grafana)",
        "Alerting configuré (PagerDuty, OpsGenie)",
        "Distributed tracing (Jaeger, Zipkin)",
      ],
    },
    {
      name: "Resilience",
      color: "text-purple-400",
      items: [
        "Backup automatisé et testé régulièrement",
        "Disaster Recovery Plan documenté (RTO/RPO)",
        "Health checks et readiness probes (K8s)",
        "Circuit breaker pattern pour les dépendances",
      ],
    },
  ];

  let globalIdx = 0;
  const total = categories.reduce((sum, c) => sum + c.items.length, 0);
  const progress = Math.round((checked.size / total) * 100);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gauge className="w-6 h-6 text-yellow-400" /> Production-Ready
          Checklist
        </h2>
        <Badge
          variant="outline"
          className={`text-sm ${progress === 100 ? "text-green-500 border-green-500/30" : ""}`}
        >
          {progress}%
        </Badge>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : progress > 50 ? "bg-blue-500" : "bg-orange-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const catItems = cat.items.map((item) => {
            const idx = globalIdx++;
            return { item, idx };
          });
          return (
            <div key={cat.name} className="space-y-3">
              <h3 className={`font-semibold text-sm ${cat.color}`}>
                {cat.name}
              </h3>
              {catItems.map(({ item, idx }) => (
                <button
                  key={idx}
                  onClick={() => toggle(idx)}
                  className={`flex items-center gap-3 w-full text-left p-2.5 rounded-lg border transition-all ${checked.has(idx) ? "bg-green-500/5 border-green-500/20" : "border-border/20 hover:border-border/50"}`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked.has(idx) ? "border-green-500 bg-green-500" : "border-border"}`}
                  >
                    {checked.has(idx) && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${checked.has(idx) ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BackendDevopsPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Terminal className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            DevOps & Infrastructure
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CI/CD pipelines, Docker, et checklist production-ready &mdash;
            déployez avec confiance en production.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <CiCdPipeline />
      </Card>
      <Card className="p-8 border-border/40">
        <DockerGuide />
      </Card>
      <Card className="p-8 border-border/40">
        <ProductionChecklist />
      </Card>
    </div>
  );
}
