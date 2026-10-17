"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, GitCommit, FolderTree, FileText, ArrowRight, Database } from "lucide-react";

const objects = [
  {
    type: "blob",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Contenu brut d'un fichier. Stocké par hash SHA-1 du contenu.",
    details: [
      "Un blob ne contient PAS le nom du fichier",
      "Même contenu = même hash = un seul blob (déduplication)",
      "Stocké dans .git/objects/ en format zlib compressé",
      "Commande : git hash-object -w fichier.txt",
    ],
    example: "$ echo \"Hello\" | git hash-object --stdin\nce013625030ba8dba906f756967f9e9ca394464a",
  },
  {
    type: "tree",
    icon: FolderTree,
    color: "text-green-500",
    bg: "bg-green-500/10",
    description: "Représente un répertoire. Lie des noms de fichiers à des blobs ou d'autres trees.",
    details: [
      "Chaque entrée : mode (100644/040000), type (blob/tree), hash, nom",
      "Les sous-dossiers sont des trees imbriqués",
      "Snapshot complet de l'arborescence à un instant T",
      "Commande : git ls-tree HEAD",
    ],
    example: "$ git ls-tree HEAD\n100644 blob a1b2c3d  README.md\n040000 tree d4e5f6a  src/",
  },
  {
    type: "commit",
    icon: GitCommit,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    description: "Pointe vers un tree (snapshot), référence le(s) parent(s), et contient les métadonnées.",
    details: [
      "Contient : tree hash, parent hash(es), auteur, committer, message",
      "Le premier commit n'a pas de parent",
      "Un merge commit a 2+ parents",
      "L'historique Git est un DAG (Directed Acyclic Graph)",
    ],
    example: "$ git cat-file -p HEAD\ntree a1b2c3d...\nparent e4f5g6h...\nauthor Fernand SOUALO\ncommitter Fernand SOUALO\n\nfeat: implement auth",
  },
  {
    type: "tag (annotated)",
    icon: Database,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Objet nommé pointant vers un commit avec des métadonnées (tagger, message, signature GPG).",
    details: [
      "Les tags annotés sont des objets Git complets",
      "Les tags légers sont de simples pointeurs (pas d'objet)",
      "Utilisés pour les releases : v1.0.0, v2.1.0",
      "Commande : git tag -a v1.0.0 -m \"Release 1.0\"",
    ],
    example: "$ git cat-file -p v1.0.0\nobject a1b2c3d...\ntype commit\ntag v1.0.0\ntagger Fernand SOUALO\n\nRelease 1.0.0",
  },
];

function DAGVisualization() {
  const nodes = [
    { id: "c1", label: "Initial", x: 50, y: 140, parents: [] },
    { id: "c2", label: "feat: auth", x: 150, y: 140, parents: ["c1"] },
    { id: "c3", label: "feat: user", x: 250, y: 80, parents: ["c2"] },
    { id: "c4", label: "fix: login", x: 250, y: 200, parents: ["c2"] },
    { id: "c5", label: "merge", x: 370, y: 140, parents: ["c3", "c4"] },
    { id: "c6", label: "HEAD", x: 470, y: 140, parents: ["c5"] },
  ];

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Eye className="w-5 h-5 text-purple-500" />
        Le DAG (Directed Acyclic Graph)
      </h3>
      <p className="text-sm text-muted-foreground">
        L&apos;historique Git n&apos;est pas une ligne droite — c&apos;est un graphe orienté acyclique.
        Chaque commit pointe vers son ou ses parents.
      </p>
      <div className="relative bg-muted/30 rounded-xl p-4 overflow-x-auto min-h-[200px]">
        <svg viewBox="0 0 540 280" className="w-full h-auto max-w-lg mx-auto">
          {/* Edges */}
          {nodes.map((node) =>
            node.parents.map((pid) => {
              const parent = nodes.find((n) => n.id === pid)!;
              return (
                <line
                  key={`${pid}-${node.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="2"
                />
              );
            }),
          )}
          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="16"
                className={node.id === "c6" ? "fill-orange-500" : node.id === "c5" ? "fill-purple-500" : "fill-blue-500"}
                opacity="0.8"
              />
              <text
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                className="fill-current text-[11px]"
              >
                {node.label}
              </text>
            </g>
          ))}
          {/* Branch labels */}
          <text x={250} y={60} textAnchor="middle" className="fill-green-500 text-[10px] font-bold">feature</text>
          <text x={250} y={235} textAnchor="middle" className="fill-red-500 text-[10px] font-bold">hotfix</text>
          <text x={470} y={120} textAnchor="middle" className="fill-orange-500 text-[10px] font-bold">main</text>
        </svg>
      </div>
    </Card>
  );
}

export default function GitInternalsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Eye className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Git Internals</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Comment Git Fonctionne Vraiment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprenez les objets internes de Git — blobs, trees, commits — et comment
          ils forment le DAG qui constitue votre historique.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objects.map((obj) => {
          const Icon = obj.icon;
          const isOpen = selected === obj.type;
          return (
            <Card
              key={obj.type}
              className={`p-6 space-y-4 cursor-pointer transition-all border-border/40 hover:shadow-lg ${isOpen ? "ring-2 ring-primary/30" : ""}`}
              onClick={() => setSelected(isOpen ? null : obj.type)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${obj.bg}`}>
                  <Icon className={`w-5 h-5 ${obj.color}`} />
                </div>
                <div>
                  <h3 className="font-bold">{obj.type}</h3>
                  <p className="text-xs text-muted-foreground">{obj.description}</p>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <ul className="space-y-1.5">
                    {obj.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap">
                    {obj.example}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <DAGVisualization />

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold">Résumé des Relations</h3>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Badge className="bg-orange-500/10 text-orange-500">commit</Badge>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge className="bg-green-500/10 text-green-500">tree</Badge>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge className="bg-blue-500/10 text-blue-500">blob</Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Un commit référence un tree (snapshot du projet), qui référence des blobs
          (contenu des fichiers) et d&apos;autres trees (sous-répertoires).
        </p>
      </Card>
    </div>
  );
}