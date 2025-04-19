import { Badge } from "@/components/ui/badge";

export function StateManagementHero() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            State Management
          </h1>
          <Badge variant="outline" className="ml-2">
            Intermédiaire
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Explorez les différentes approches et bibliothèques pour gérer l&apos;état dans les applications React
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
          Context API
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
          Redux
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
          Zustand
        </Badge>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
          React Query
        </Badge>
        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
          Performance
        </Badge>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
          Best Practices
        </Badge>
      </div>
    </section>
  );
}
