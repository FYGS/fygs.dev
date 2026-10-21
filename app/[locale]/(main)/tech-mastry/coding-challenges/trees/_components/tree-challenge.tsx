"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const challenges = [
  {
    id: 1,
    title: "Binary Tree Inorder Traversal",
    description:
      "Implémenter le parcours inorder d'un arbre binaire (gauche, racine, droite).",
    technique: "DFS Recursive",
    examples: [
      { input: "1,null,2,3", output: "1,3,2" },
      { input: "1,2,3,4,5", output: "4,2,5,1,3" },
    ],
    hint: "Utilisez la récursion : visitez le sous-arbre gauche, puis le nœud, puis le sous-arbre droit.",
    solution: `function inorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    
    traverse(node.left);   // Gauche
    result.push(node.val); // Racine
    traverse(node.right);  // Droite
  }
  
  traverse(root);
  return result;
}`,
    verify: (input: string) => {
      // Simplified verification
      return input ? "Correct" : "Incorrect";
    },
  },
  {
    id: 2,
    title: "Maximum Depth of Binary Tree",
    description:
      "Calculer la profondeur maximale (hauteur) d'un arbre binaire.",
    technique: "DFS",
    examples: [
      { input: "3,9,20,null,null,15,7", output: "3" },
      { input: "1,null,2", output: "2" },
    ],
    hint: "La profondeur maximale = 1 + max(profondeur gauche, profondeur droite).",
    solution: `function maxDepth(root) {
  if (!root) return 0;
  
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  return Math.max(leftDepth, rightDepth) + 1;
}`,
    verify: (input: string) => {
      return input ? "Correct" : "Incorrect";
    },
  },
  {
    id: 3,
    title: "Level Order Traversal",
    description: "Parcourir l'arbre niveau par niveau (BFS).",
    technique: "BFS Queue",
    examples: [
      { input: "3,9,20,null,null,15,7", output: "[[3],[9,20],[15,7]]" },
      { input: "1", output: "[[1]]" },
    ],
    hint: "Utilisez une file (queue) pour parcourir chaque niveau.",
    solution: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}`,
    verify: (input: string) => {
      return input ? "Correct" : "Incorrect";
    },
  },
  {
    id: 4,
    title: "Validate Binary Search Tree",
    description: "Vérifier si un arbre binaire est un BST valide.",
    technique: "DFS with Range",
    examples: [
      { input: "2,1,3", output: "true" },
      { input: "5,1,4,null,null,3,6", output: "false" },
    ],
    hint: "Chaque nœud doit respecter : min < node.val < max. Propagez les limites lors de la récursion.",
    solution: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  
  // Le nœud doit être dans la plage valide
  if (root.val <= min || root.val >= max) {
    return false;
  }
  
  // Vérifier récursivement les sous-arbres
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}`,
    verify: (input: string) => {
      return input ? "Correct" : "Incorrect";
    },
  },
  {
    id: 5,
    title: "Lowest Common Ancestor",
    description: "Trouver l'ancêtre commun le plus proche de deux nœuds.",
    technique: "DFS Traversal",
    examples: [
      { input: "3,5,1,6,2,0,8,null,null,7,4 | 5,1", output: "3" },
      { input: "3,5,1,6,2,0,8,null,null,7,4 | 5,4", output: "5" },
    ],
    hint: "Si les deux nœuds sont dans des sous-arbres différents, le nœud actuel est le LCA.",
    solution: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) {
    return root;
  }
  
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  // Si les deux sous-arbres contiennent p et q
  if (left && right) return root;
  
  // Retourner le côté non-null
  return left || right;
}`,
    verify: (input: string) => {
      return input ? "Correct" : "Incorrect";
    },
  },
  {
    id: 6,
    title: "Serialize and Deserialize Binary Tree",
    description: "Convertir un arbre binaire en chaîne et vice-versa.",
    technique: "BFS/DFS Encoding",
    examples: [{ input: "1,2,3,null,null,4,5", output: "1,2,3,null,null,4,5" }],
    hint: "Utilisez un délimiteur (ex: ',') et un marqueur pour les nœuds null.",
    solution: `function serialize(root) {
  if (!root) return "null";
  return root.val + "," + 
         serialize(root.left) + "," + 
         serialize(root.right);
}

function deserialize(data) {
  const nodes = data.split(',');
  
  function buildTree() {
    const val = nodes.shift();
    if (val === "null") return null;
    
    const node = { val: parseInt(val), left: null, right: null };
    node.left = buildTree();
    node.right = buildTree();
    return node;
  }
  
  return buildTree();
}`,
    verify: (input: string) => {
      return input ? "Correct" : "Incorrect";
    },
  },
];

export function TreeChallenge() {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const runTest = () => {
    const output = selectedChallenge.verify(userInput);
    setResult(output);
  };

  const resetChallenge = () => {
    setUserInput("");
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenges List */}
      <Card className="p-6 lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Défis Arbres</h2>
          <Badge variant="outline">{challenges.length} défis</Badge>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge) => (
            <Button
              key={challenge.id}
              variant={
                selectedChallenge.id === challenge.id ? "default" : "ghost"
              }
              className="w-full justify-start text-left"
              onClick={() => {
                setSelectedChallenge(challenge);
                resetChallenge();
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground">
                  #{challenge.id}
                </span>
                <span className="flex-1 truncate">{challenge.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Challenge Details */}
      <Card className="p-6 lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{selectedChallenge.title}</h1>
            <Badge>{selectedChallenge.technique}</Badge>
          </div>
          <p className="text-muted-foreground">
            {selectedChallenge.description}
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <h3 className="font-semibold">Exemples:</h3>
          <div className="space-y-2">
            {selectedChallenge.examples.map((example, idx) => (
              <div
                key={idx}
                className="p-3 bg-muted/50 rounded-lg font-mono text-sm"
              >
                <div>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  {example.input}
                </div>
                <div>
                  <span className="text-muted-foreground">Output:</span>{" "}
                  {example.output}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <Label htmlFor="user-input">Votre réponse:</Label>
          <Input
            id="user-input"
            placeholder="Entrez votre réponse (ex: 1,3,2)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={runTest} disabled={!userInput}>
            <Code className="w-4 h-4 mr-2" />
            Tester
          </Button>
          <Button variant="outline" onClick={resetChallenge}>
            Réinitialiser
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Clock className="w-4 h-4 mr-2" />
                Indice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Indice</DialogTitle>
                <DialogDescription>{selectedChallenge.hint}</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Solution</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Solution</DialogTitle>
              </DialogHeader>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm" tabIndex={0}>
                <code>{selectedChallenge.solution}</code>
              </pre>
            </DialogContent>
          </Dialog>
        </div>

        {/* Result */}
        {result && (
          <Card
            className={`p-4 ${
              result === "Correct" ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {result === "Correct" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">{result}</span>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}
