import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Filtrer par catégorie:</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("all")}
        >
          Tous
        </Badge>
        <Badge
          variant={selectedCategory === "arrays" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("arrays")}
        >
          Tableaux
        </Badge>
        <Badge
          variant={
            selectedCategory === "linked-lists" ? "default" : "outline"
          }
          className="cursor-pointer"
          onClick={() => setSelectedCategory("linked-lists")}
        >
          Listes Chaînées
        </Badge>
        <Badge
          variant={selectedCategory === "stacks" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("stacks")}
        >
          Piles
        </Badge>
        <Badge
          variant={selectedCategory === "queues" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("queues")}
        >
          Files
        </Badge>
        <Badge
          variant={
            selectedCategory === "hash-tables" ? "default" : "outline"
          }
          className="cursor-pointer"
          onClick={() => setSelectedCategory("hash-tables")}
        >
          Tables de Hachage
        </Badge>
        <Badge
          variant={
            selectedCategory === "binary-trees" ? "default" : "outline"
          }
          className="cursor-pointer"
          onClick={() => setSelectedCategory("binary-trees")}
        >
          Arbres Binaires
        </Badge>
      </div>
    </div>
  );
}
