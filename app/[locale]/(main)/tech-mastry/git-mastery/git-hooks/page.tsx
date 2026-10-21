"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Webhook, Copy, CheckCircle, Terminal, Settings, Zap } from "lucide-react";

const hooks = [
  {
    name: "pre-commit",
    phase: "Client",
    trigger: "Avant la création du commit",
    use: "Linting, formatage, vérification des types",
    example: `#!/bin/sh
# .husky/pre-commit
npx lint-staged`,
  },
  {
    name: "commit-msg",
    phase: "Client",
    trigger: "Après la saisie du message de commit",
    use: "Validation du format Conventional Commits",
    example: `#!/bin/sh
# .husky/commit-msg
npx --no -- commitlint --edit "\${1}"`,
  },
  {
    name: "pre-push",
    phase: "Client",
    trigger: "Avant l'envoi au remote",
    use: "Tests, build de vérification",
    example: `#!/bin/sh
# .husky/pre-push
npm test
npm run build`,
  },
  {
    name: "prepare-commit-msg",
    phase: "Client",
    trigger: "Avant l'ouverture de l'éditeur de message",
    use: "Template de message automatique, numéro de ticket",
    example: `#!/bin/sh
# Ajouter le numéro de branche au message
BRANCH=$(git branch --show-current)
TICKET=$(echo "$BRANCH" | grep -oE '[A-Z]+-[0-9]+')
if [ -n "$TICKET" ]; then
  sed -i.bak -e "1s/^/[$TICKET] /" "$1"
fi`,
  },
  {
    name: "post-merge",
    phase: "Client",
    trigger: "Après un merge réussi",
    use: "Installation des dépendances, migrations",
    example: `#!/bin/sh
# Réinstaller si package.json a changé
CHANGED=$(git diff-tree -r --name-only ORIG_HEAD HEAD)
if echo "$CHANGED" | grep -q "package.json"; then
  echo "package.json changed, running install..."
  pnpm install
fi`,
  },
  {
    name: "pre-receive",
    phase: "Serveur",
    trigger: "Avant l'acceptation du push côté serveur",
    use: "Politique de branches, vérification des signatures",
    example: `#!/bin/sh
# Refuser les pushes directs sur main
while read oldrev newrev refname; do
  if [ "$refname" = "refs/heads/main" ]; then
    echo "ERROR: Direct push to main is not allowed"
    exit 1
  fi
done`,
  },
];

const huskySetup = `# Installation de Husky + lint-staged + commitlint
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Initialiser Husky
npx husky init

# Configurer lint-staged dans package.json
# "lint-staged": {
#   "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
#   "*.{json,md}": ["prettier --write"]
# }

# Configurer commitlint
# echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Créer les hooks
echo "npx lint-staged" > .husky/pre-commit
echo 'npx --no -- commitlint --edit "\${1}"' > .husky/commit-msg`;

export default function GitHooksPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedHook, setExpandedHook] = useState<string | null>("pre-commit");

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <Webhook className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-medium text-cyan-500">Git Hooks</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Git Hooks & Automatisation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Automatisez vos vérifications de qualité avec les Git hooks.
          De Husky et lint-staged aux hooks serveur.
        </p>
      </section>

      {/* Hooks Reference */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Référence des Hooks</h2>
        <div className="space-y-4">
          {hooks.map((hook) => (
            <Card
              key={hook.name}
              className={`p-5 space-y-3 border-border/40 cursor-pointer transition-all ${expandedHook === hook.name ? "ring-2 ring-primary/20" : ""}`}
              onClick={() => setExpandedHook(expandedHook === hook.name ? null : hook.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-cyan-500" />
                  <code className="font-mono font-bold text-primary">{hook.name}</code>
                  <Badge variant="outline" className="text-[10px]">{hook.phase}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{hook.trigger}</span>
              </div>
              <p className="text-sm text-muted-foreground">{hook.use}</p>

              {expandedHook === hook.name && (
                <div className="relative group animate-in fade-in duration-300">
                  <pre className="rounded-lg bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
                    {hook.example}
                  </pre>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyText(hook.example, hook.name); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied === hook.name ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Husky Setup */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          Setup Complet avec Husky
        </h2>
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configuration complète Husky + lint-staged + commitlint
            </p>
            <button
              onClick={() => copyText(huskySetup, "husky")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {copied === "husky" ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied === "husky" ? "Copié" : "Copier"}
            </button>
          </div>
          <pre className="rounded-lg bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
            {huskySetup}
          </pre>
        </Card>
      </section>

      {/* Benefits */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Pourquoi Automatiser ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Qualité Constante", desc: "Chaque commit passe les mêmes vérifications, indépendamment du développeur." },
            { title: "Feedback Immédiat", desc: "Détectez les erreurs avant le commit, pas 10 minutes plus tard dans la CI." },
            { title: "Convention Automatique", desc: "Les messages de commit et le formatage du code sont standardisés automatiquement." },
          ].map((b) => (
            <Card key={b.title} className="p-5 space-y-2">
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}