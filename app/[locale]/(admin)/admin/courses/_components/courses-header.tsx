import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const COURSE_STATUS_FILTERS = [
  { value: "published", label: "Publiés" },
  { value: "draft", label: "Brouillons" },
  { value: "featured", label: "Mis en avant" },
] as const;

export const COURSE_CATEGORY_FILTERS = [
  { value: "JAVASCRIPT", label: "JavaScript" },
  { value: "TYPESCRIPT", label: "TypeScript" },
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "FULLSTACK", label: "Fullstack" },
  { value: "AI", label: "Intelligence Artificielle" },
  { value: "CLOUD", label: "Cloud" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "PRODUCTIVITY", label: "Productivité" },
] as const;

export interface CourseFilters {
  q: string;
  status: string;
  category: string;
}

const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-48";

/** Title, "new course", and the filters as a GET form: the URL carries them, the server applies them. */
export function CoursesHeader({ filters }: { filters: CourseFilters }) {
  const filtered = Boolean(filters.q || filters.status || filters.category);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gradient-heading">Gestion des Formations</h1>
          <p className="text-muted-foreground">Créez, modifiez et gérez vos formations et leurs contenus</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle formation
          </Link>
        </Button>
      </div>

      <form method="get" action="/admin/courses" role="search" className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            name="q"
            defaultValue={filters.q}
            aria-label="Rechercher une formation"
            placeholder="Rechercher par titre, description..."
            className="pl-10"
            maxLength={100}
          />
        </div>

        <select name="status" defaultValue={filters.status} aria-label="Statut" className={selectClass}>
          <option value="">Tous les statuts</option>
          {COURSE_STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select name="category" defaultValue={filters.category} aria-label="Catégorie" className={selectClass}>
          <option value="">Toutes catégories</option>
          {COURSE_CATEGORY_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button type="submit">Filtrer</Button>
        {filtered && (
          <Button variant="ghost" asChild>
            <Link href="/admin/courses">Réinitialiser</Link>
          </Button>
        )}
      </form>
    </div>
  );
}
