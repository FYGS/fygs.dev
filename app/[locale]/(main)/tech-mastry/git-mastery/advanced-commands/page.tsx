"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Copy, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Command {
  name: string;
  syntax: string;
  description: string;
  examples: { cmd: string; explanation: string }[];
  tips: string[];
  danger?: boolean;
}

const categories: { id: string; label: string; commands: Command[] }[] = [
  {
    id: "rewriting",
    label: "Réécriture",
    commands: [
      {
        name: "git rebase -i",
        syntax: "git rebase -i HEAD~n",
        description: "Rebase interactif : réordonnez, squash, edit ou supprimez des commits de votre historique local.",
        examples: [
          { cmd: "git rebase -i HEAD~5", explanation: "Réécrire les 5 derniers commits" },
          { cmd: "git rebase -i --root", explanation: "Réécrire tout l'historique depuis le premier commit" },
          { cmd: "# pick → squash", explanation: "Fusionner un commit avec le précédent" },
          { cmd: "# pick → reword", explanation: "Modifier le message du commit" },
        ],
        tips: [
          "Ne jamais rebase une branche partagée (publiée)",
          "Utilisez fixup au lieu de squash pour ne pas garder le message",
          "Memorisez : pick, reword, edit, squash, fixup, drop",
        ],
        danger: true,
      },
      {
        name: "git cherry-pick",
        syntax: "git cherry-pick <commit-hash>",
        description: "Appliquer un commit spécifique d'une autre branche sur la branche courante.",
        examples: [
          { cmd: "git cherry-pick a1b2c3d", explanation: "Appliquer un commit" },
          { cmd: "git cherry-pick A..B", explanation: "Appliquer une plage de commits (exclusif A)" },
          { cmd: "git cherry-pick -n a1b2c3d", explanation: "Appliquer sans committer (--no-commit)" },
        ],
        tips: [
          "Crée un nouveau commit avec un hash différent",
          "Utile pour les hotfixes : cherry-pick du fix vers main",
          "Utilisez -x pour ajouter une référence au commit original",
        ],
      },
      {
        name: "git commit --amend",
        syntax: "git commit --amend",
        description: "Modifier le dernier commit : message, contenu ou les deux.",
        examples: [
          { cmd: "git commit --amend -m \"nouveau message\"", explanation: "Changer le message du dernier commit" },
          { cmd: "git add file.ts && git commit --amend --no-edit", explanation: "Ajouter des fichiers au dernier commit" },
        ],
        tips: [
          "Crée un nouveau hash (réécrit l'historique)",
          "Parfait avant le push, dangereux après",
        ],
        danger: true,
      },
    ],
  },
  {
    id: "debugging",
    label: "Debugging",
    commands: [
      {
        name: "git bisect",
        syntax: "git bisect start / good / bad",
        description: "Recherche dichotomique automatique pour trouver le commit qui a introduit un bug.",
        examples: [
          { cmd: "git bisect start", explanation: "Démarrer la session bisect" },
          { cmd: "git bisect bad", explanation: "Marquer le commit actuel comme bugué" },
          { cmd: "git bisect good v2.0", explanation: "Marquer un commit connu comme bon" },
          { cmd: "git bisect run npm test", explanation: "Automatiser avec un script de test" },
        ],
        tips: [
          "O(log n) — trouve le commit parmi 1000 en ~10 étapes",
          "git bisect reset pour terminer la session",
          "Combiné avec git bisect run, c'est entièrement automatique",
        ],
      },
      {
        name: "git reflog",
        syntax: "git reflog",
        description: "Journal local de TOUTES les modifications de HEAD. Votre filet de sécurité ultime.",
        examples: [
          { cmd: "git reflog", explanation: "Voir les 30 dernières actions" },
          { cmd: "git reflog show feature-branch", explanation: "Reflog d'une branche spécifique" },
          { cmd: "git checkout HEAD@{5}", explanation: "Revenir 5 actions en arrière" },
          { cmd: "git branch recovery HEAD@{3}", explanation: "Récupérer une branche supprimée" },
        ],
        tips: [
          "Le reflog est LOCAL uniquement (pas partagé)",
          "Expire après 90 jours par défaut",
          "Sauve des rebase ou reset --hard accidentels",
        ],
      },
      {
        name: "git blame",
        syntax: "git blame <file>",
        description: "Voir l'auteur et le commit de chaque ligne d'un fichier.",
        examples: [
          { cmd: "git blame src/auth.ts", explanation: "Blame classique ligne par ligne" },
          { cmd: "git blame -L 10,20 src/auth.ts", explanation: "Blame sur les lignes 10 à 20" },
          { cmd: "git blame -w src/auth.ts", explanation: "Ignorer les changements d'espaces" },
        ],
        tips: [
          "Utilisez -C pour détecter le code copié entre fichiers",
          "Combiné avec git log -p pour le contexte complet",
        ],
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    commands: [
      {
        name: "git stash",
        syntax: "git stash [push|pop|list|apply|drop]",
        description: "Sauvegarder temporairement des modifications non committées pour changer de contexte.",
        examples: [
          { cmd: "git stash", explanation: "Stash les modifications trackées" },
          { cmd: "git stash -u", explanation: "Inclure les fichiers untracked" },
          { cmd: "git stash push -m \"WIP: auth\"", explanation: "Stash nommé" },
          { cmd: "git stash pop", explanation: "Appliquer et supprimer le dernier stash" },
          { cmd: "git stash apply stash@{2}", explanation: "Appliquer sans supprimer" },
          { cmd: "git stash branch feature stash@{0}", explanation: "Créer une branche depuis un stash" },
        ],
        tips: [
          "stash pop = apply + drop (supprime en cas de succès)",
          "Les stash sont locaux et partagent un stack LIFO",
          "Utilisez git stash show -p pour voir le contenu",
        ],
      },
      {
        name: "git worktree",
        syntax: "git worktree add <path> <branch>",
        description: "Travailler sur plusieurs branches simultanément dans des répertoires séparés.",
        examples: [
          { cmd: "git worktree add ../hotfix main", explanation: "Créer un worktree sur main" },
          { cmd: "git worktree list", explanation: "Lister tous les worktrees" },
          { cmd: "git worktree remove ../hotfix", explanation: "Supprimer un worktree" },
        ],
        tips: [
          "Plus efficace que git clone multiple",
          "Partage le même .git (un seul repo)",
          "Idéal pour les code reviews parallèles",
        ],
      },
    ],
  },
];

function CommandCard({ command }: { command: Command }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className={`p-6 space-y-4 border-border/40 ${command.danger ? "border-l-4 border-l-red-500/50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-500" />
            <h3 className="text-lg font-bold font-mono">{command.name}</h3>
            {command.danger && <Badge variant="destructive" className="text-[10px]">Réécrit l&apos;historique</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{command.description}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 font-mono text-sm">
        <code className="text-primary">{command.syntax}</code>
      </div>

      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Exemples</h4>
            {command.examples.map((ex) => (
              <div key={ex.cmd} className="flex items-start gap-2 group">
                <div className="flex-1 rounded-lg bg-muted/30 p-2 font-mono text-xs flex items-center justify-between">
                  <code>{ex.cmd}</code>
                  <button
                    onClick={() => copyCmd(ex.cmd)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    {copied === ex.cmd ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </div>
                <span className="text-xs text-muted-foreground mt-2 max-w-48">{ex.explanation}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Conseils Pro</h4>
            <ul className="space-y-1">
              {command.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdvancedCommandsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Terminal className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Commandes Avancées</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Commandes Git Avancées
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Les commandes que les développeurs seniors utilisent quotidiennement.
          Rebase interactif, cherry-pick, bisect, reflog et plus encore.
        </p>
      </section>

      <Tabs defaultValue="rewriting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-6">
            {cat.commands.map((cmd) => (
              <CommandCard key={cmd.name} command={cmd} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}