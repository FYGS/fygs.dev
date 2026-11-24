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
    description: "Contenu brut d'un fichier. Identifié par le hash SHA-1 de son contenu (SHA-256 en option dans les dépôts récents).",
    details: [
      "Un blob ne contient PAS le nom du fichier",
      "Même contenu = même hash = un seul blob (déduplication)",
      "Stocké dans .git/objects/ en format zlib compressé",
      "Commande : git hash-object -w fichier.txt",
    ],
    example: "$ echo \"Hello\" | git hash-object --stdin\ne965047ad7c57865823c7d992b1d046ea66edf78",
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
    example: "$ git cat-file -p HEAD\ntree a1b2c3d...\nparent e4f5a6b...\nauthor Fernand SOUALO\ncommitter Fernand SOUALO\n\nfeat: implement auth",
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

const packCommands = `# Objets "loose" (un fichier zlib par objet) vs objets empaquetés
git count-objects -vH
# count: objets loose | size: leur taille
# in-pack: objets dans des packfiles | packs: nombre de packfiles
# size-pack: taille des packfiles | garbage: fichiers inattendus

# Empaqueter les objets loose et nettoyer les inaccessibles
git gc

# Inspecter un packfile (hash, type, taille, taille compressée, delta)
git verify-pack -v .git/objects/pack/pack-*.idx | head`;

const modernGit = [
  {
    title: "SHA-256 en option",
    desc: "git init --object-format=sha256 crée un dépôt dont les objets sont identifiés par SHA-256. Les dépôts SHA-1 et SHA-256 ne sont pas interopérables, et le support par les forges reste limité : SHA-1 reste le défaut.",
  },
  {
    title: "git switch / git restore",
    desc: "Depuis Git 2.23, git switch change de branche et git restore restaure des fichiers, là où git checkout cumulait les deux rôles.",
  },
  {
    title: "git maintenance",
    desc: "git maintenance start planifie en tâche de fond le prefetch, le commit-graph, le repack incrémental et le gc, sans lancer git gc à la main.",
  },
  {
    title: "Backend reftable",
    desc: "Depuis Git 2.45, git init --ref-format=reftable stocke les références dans un format binaire compact plutôt que dans des fichiers séparés : utile pour les dépôts avec un très grand nombre de références.",
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

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Pack Files et Garbage Collection</h2>
        <Card className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Au départ, chaque objet est un fichier <em>loose</em> compressé dans{" "}
            <code>.git/objects/</code>. Pour économiser de la place et accélérer
            les transferts, Git regroupe les objets dans des{" "}
            <strong>packfiles</strong> (<code>.pack</code> + un index{" "}
            <code>.idx</code>). Dans un pack, les objets proches (par exemple
            deux versions d&apos;un même fichier) sont stockés sous forme de{" "}
            <strong>deltas</strong> : seule la différence avec un objet de base
            est conservée, ce qui est la principale source de compression.
          </p>
          <p className="text-sm text-muted-foreground">
            <code>git gc</code> empaquette les objets loose et supprime les
            objets inaccessibles devenus assez anciens ; Git le déclenche
            automatiquement de temps en temps. Les push et fetch échangent
            également des packs.
          </p>
          <pre
            className="rounded-lg bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto"
            tabIndex={0}
          >
            {packCommands}
          </pre>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Git Moderne (2.x)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modernGit.map((m) => (
            <Card key={m.title} className="p-5 space-y-2">
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

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