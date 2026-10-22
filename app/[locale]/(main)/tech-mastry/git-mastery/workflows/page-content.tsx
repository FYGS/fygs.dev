"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  bumpSemver,
  type SemverVersion,
} from "../../_utils/semver-bump";
import {
  Workflow,
  GitCommit,
  Tag,
  MessagesSquare,
  CheckCircle,
  Copy,
} from "lucide-react";

const conventionalTypes = [
  {
    type: "feat",
    desc: "Nouvelle fonctionnalité",
    color: "text-green-500",
    semver: "MINOR",
  },
  {
    type: "fix",
    desc: "Correction de bug",
    color: "text-red-500",
    semver: "PATCH",
  },
  {
    type: "docs",
    desc: "Documentation uniquement",
    color: "text-blue-500",
    semver: "-",
  },
  {
    type: "style",
    desc: "Formatage, espaces, etc.",
    color: "text-pink-500",
    semver: "-",
  },
  {
    type: "refactor",
    desc: "Restructuration sans changement de comportement",
    color: "text-purple-500",
    semver: "-",
  },
  {
    type: "test",
    desc: "Ajout ou modification de tests",
    color: "text-cyan-500",
    semver: "-",
  },
  {
    type: "chore",
    desc: "Build, CI, dépendances",
    color: "text-yellow-500",
    semver: "-",
  },
  {
    type: "perf",
    desc: "Amélioration des performances (PATCH selon la config de semantic-release)",
    color: "text-orange-500",
    semver: "-",
  },
  {
    type: "ci",
    desc: "Configuration CI/CD",
    color: "text-amber-500",
    semver: "-",
  },
  {
    type: "BREAKING CHANGE",
    desc: "Changement non rétrocompatible (footer BREAKING CHANGE: ou ! après le type)",
    color: "text-red-600",
    semver: "MAJOR",
  },
];

const prTemplate = `## Description
<!-- Décrivez le changement -->

## Type de changement
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Les tests passent localement
- [ ] Le code suit les conventions du projet
- [ ] La documentation est à jour
- [ ] Self-review effectuée

## Screenshots (si applicable)
<!-- Ajoutez des captures d'écran -->`;

const commitExamples = [
  { msg: "feat(auth): add Google OAuth provider", good: true },
  { msg: "fix(api): resolve race condition in checkout", good: true },
  { msg: "docs: update README with deployment instructions", good: true },
  { msg: "feat!: drop support for Node 16", good: true },
  { msg: "Updated stuff", good: false },
  { msg: "fix bug", good: false },
  { msg: "WIP", good: false },
  { msg: "asdfgh", good: false },
];

function SemverSection() {
  const [version, setVersion] = useState<SemverVersion>({
    major: 1,
    minor: 4,
    patch: 2,
  });
  const { major, minor, patch } = version;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Tag className="w-5 h-5 text-yellow-500" />
        Semantic Versioning (SemVer)
      </h3>
      <div className="flex items-center justify-center gap-1 text-4xl font-mono font-bold">
        <button
          onClick={() => setVersion((v) => bumpSemver(v, "major"))}
          className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
        >
          {major}
        </button>
        <span className="text-muted-foreground">.</span>
        <button
          onClick={() => setVersion((v) => bumpSemver(v, "minor"))}
          className="text-blue-500 hover:bg-blue-500/10 px-3 py-1 rounded-lg transition-colors"
        >
          {minor}
        </button>
        <span className="text-muted-foreground">.</span>
        <button
          onClick={() => setVersion((v) => bumpSemver(v, "patch"))}
          className="text-green-500 hover:bg-green-500/10 px-3 py-1 rounded-lg transition-colors"
        >
          {patch}
        </button>
      </div>
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <span className="text-red-500">MAJOR</span>
        <span className="text-blue-500">MINOR</span>
        <span className="text-green-500">PATCH</span>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Cliquez sur chaque chiffre pour l&apos;incrémenter : augmenter MAJOR
        remet MINOR et PATCH à 0, augmenter MINOR remet PATCH à 0.{" "}
        <strong>MAJOR</strong> = breaking changes, <strong>MINOR</strong> =
        nouvelles features, <strong>PATCH</strong> = bug fixes.
      </p>
      <button
        onClick={() => {
          setVersion({ major: 1, minor: 0, patch: 0 });
        }}
        className="mx-auto block text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Réinitialiser à 1.0.0
      </button>
    </Card>
  );
}

const monorepoCommands = `# Clone partiel : les blobs sont téléchargés à la demande
git clone --filter=blob:none --sparse https://example.com/org/monorepo.git
cd monorepo

# Sparse-checkout (mode cone) : ne matérialiser que certains dossiers
git sparse-checkout set apps/web packages/ui

# Scalar (livré avec Git) : clone partiel + sparse-checkout + maintenance
scalar clone https://example.com/org/monorepo.git`;

export default function WorkflowsPage() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
          <Workflow className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            Workflows Professionnels
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Workflows Git Professionnels
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conventional Commits, Semantic Versioning, PR templates et code
          review. Les pratiques des équipes de classe mondiale.
        </p>
      </section>

      {/* Conventional Commits */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GitCommit className="w-6 h-6 text-orange-500" />
          Conventional Commits
        </h2>
        <Card className="p-6">
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm mb-4">
            <code className="text-primary">{`<type>[(<scope>)][!]: <description>`}</code>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conventionalTypes.map((ct) => (
              <div
                key={ct.type}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <code className={`font-mono text-sm font-bold ${ct.color}`}>
                  {ct.type}
                </code>
                <span className="text-xs text-muted-foreground flex-1">
                  {ct.desc}
                </span>
                {ct.semver !== "-" && (
                  <Badge variant="outline" className="text-[10px]">
                    {ct.semver}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Good vs Bad */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Exemples de Messages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commitExamples.map((ex) => (
              <div
                key={ex.msg}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-mono ${ex.good ? "bg-green-500/5 border border-green-500/20" : "bg-red-500/5 border border-red-500/20"}`}
              >
                {ex.good ? (
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </span>
                )}
                <code className="text-xs">{ex.msg}</code>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <SemverSection />

      {/* Monorepo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Git et Monorepo</h2>
        <Card className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Un monorepo regroupe plusieurs applications et bibliothèques dans un
            seul dépôt. Quand il grossit, cloner tout l&apos;historique et tous
            les fichiers devient lent. Git propose trois leviers : le{" "}
            <strong>clone partiel</strong> (<code>--filter=blob:none</code>),
            le <strong>sparse-checkout</strong> pour n&apos;extraire que les
            dossiers utiles, et <strong>Scalar</strong>, qui active ces
            optimisations (plus la maintenance en arrière-plan) pour les gros
            dépôts.
          </p>
          <pre
            className="rounded-lg bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto"
            tabIndex={0}
          >
            {monorepoCommands}
          </pre>
        </Card>
      </section>

      {/* PR Template */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessagesSquare className="w-6 h-6 text-blue-500" />
          Pull Request Template
        </h2>
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Ajoutez ce template dans{" "}
              <code className="text-primary">
                .github/PULL_REQUEST_TEMPLATE.md
              </code>
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(prTemplate);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
          <pre className="rounded-lg bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
            {prTemplate}
          </pre>
        </Card>
      </section>
    </div>
  );
}
