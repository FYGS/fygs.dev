import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, BarChart, Code2, Lightbulb } from "lucide-react";
import type { TreeType } from "./types";

interface TreeTypeCardProps {
  type: TreeType;
}

export function TreeTypeCard({ type }: TreeTypeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <type.icon className="h-5 w-5 text-primary" />
              {type.title}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {type.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1">
            {type.id === "binary"
              ? "Fondamental"
              : type.id === "bst"
              ? "Intermédiaire"
              : type.id === "balanced"
              ? "Avancé"
              : "Avancé"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Complexity Table */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <BarChart className="h-4 w-4 text-primary" />
            Complexité
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">
                Accès
              </p>
              <p className="font-mono font-medium">
                {type.complexity.access}
              </p>
            </Card>
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">
                Recherche
              </p>
              <p className="font-mono font-medium">
                {type.complexity.search}
              </p>
            </Card>
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">
                Insertion
              </p>
              <p className="font-mono font-medium">
                {type.complexity.insertion}
              </p>
            </Card>
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">
                Suppression
              </p>
              <p className="font-mono font-medium">
                {type.complexity.deletion}
              </p>
            </Card>
          </div>
          {type.id === "graphs" && (
            <p className="text-xs text-muted-foreground mt-2">
              Liste d&apos;adjacence. Accès = parcourir les voisins d&apos;un
              sommet (tester une arête : O(deg(v))). Ajouter un sommet ou une
              arête : O(1) amorti (sans test de doublon). Supprimer un sommet :
              O(V+E) car il faut retirer ses arêtes dans les listes des autres
              sommets. Avec une matrice d&apos;adjacence : ajouter une arête
              O(1), ajouter un sommet O(V) amorti avec redimensionnement
              (O(V²) si l&apos;on recopie toute la matrice).
            </p>
          )}
          {type.id === "bst" && (
            <p className="text-xs text-muted-foreground mt-2">
              * Dans le cas moyen pour un arbre équilibré. Peut
              dégénérer à O(n) dans le pire cas.
            </p>
          )}
        </div>

        {/* Advantages and Disadvantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              Avantages
            </h3>
            <ul className="space-y-2">
              {type.advantages.map((adv, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Inconvénients
            </h3>
            <ul className="space-y-2">
              {type.disadvantages.map((disadv, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{disadv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Applications */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Applications
          </h3>
          <div className="flex flex-wrap gap-2">
            {type.applications.map((app, index) => (
              <Badge key={index} variant="secondary">
                {app}
              </Badge>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Implémentation
          </h3>
          <div className="relative">
            <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto" tabIndex={0}>
              <code>{type.code}</code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
