import { Badge } from "@/components/ui/badge";

export function AccessibilityHero() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Accessibility & UX
          </h1>
          <Badge variant="outline" className="ml-2">
            Expert
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Best practices for creating accessible and user-friendly interfaces in React applications
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
          ARIA
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
          Keyboard Navigation
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
          Color Contrast
        </Badge>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
          Screen Readers
        </Badge>
        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
          Semantic HTML
        </Badge>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
          Focus Management
        </Badge>
      </div>
    </section>
  );
}
