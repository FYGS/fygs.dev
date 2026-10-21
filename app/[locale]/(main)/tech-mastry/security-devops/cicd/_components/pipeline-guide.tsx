"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GitCommit, Package, Play, Shield, TestTube } from "lucide-react";
import { useState } from "react";

const pipelineStages = [
  {
    id: "commit",
    label: "Commit",
    icon: GitCommit,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    id: "test",
    label: "Test",
    icon: TestTube,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500",
  },
  {
    id: "build",
    label: "Build",
    icon: Package,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: Play,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
];

const stageDetails: Record<
  string,
  { description: string; tools: string[]; code: string }
> = {
  commit: {
    description:
      "Le développeur push son code. Le pipeline se déclenche automatiquement.",
    tools: ["Git Hooks", "Commitlint", "Husky", "Lint-staged"],
    code: `# .github/workflows/ci.yml
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint`,
  },
  test: {
    description:
      "Tests unitaires, d'intégration et e2e pour valider la qualité du code.",
    tools: ["Vitest", "Playwright", "Jest", "Testing Library"],
    code: `  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/`,
  },
  security: {
    description:
      "Scan des dépendances et du code pour détecter les vulnérabilités.",
    tools: ["Dependabot", "Snyk", "CodeQL", "Trivy"],
    code: `  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'`,
  },
  build: {
    description:
      "Construction de l'image Docker et des artefacts de production.",
    tools: ["Docker", "Buildx", "GHCR", "ECR"],
    code: `  build:
    needs: security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/org/app:$\{{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
  },
  deploy: {
    description:
      "Déploiement automatique en staging puis production avec stratégie de rollback.",
    tools: ["Vercel", "AWS ECS", "Kubernetes", "ArgoCD"],
    code: `  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/app \
            app=ghcr.io/org/app:$\{{ github.sha }}
      - name: Run smoke tests
        run: pnpm test:smoke --url $STAGING_URL

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Blue/Green Deploy
        run: ./scripts/blue-green-deploy.sh`,
  },
};

export function PipelineGuide() {
  const [activeStage, setActiveStage] = useState("commit");
  const detail = stageDetails[activeStage];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Pipeline CI/CD</h2>

      {/* Visual Pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-4">
        {pipelineStages.map((stage, i) => (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => setActiveStage(stage.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap",
                activeStage === stage.id
                  ? stage.bgColor + " text-white shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              <stage.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{stage.label}</span>
            </button>
            {i < pipelineStages.length - 1 && (
              <div className="w-8 h-0.5 bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6 space-y-4 border-border/40">
        <p className="text-muted-foreground">{detail.description}</p>
        <div className="flex flex-wrap gap-2">
          {detail.tools.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
          <code>{detail.code}</code>
        </pre>
      </Card>
    </section>
  );
}
