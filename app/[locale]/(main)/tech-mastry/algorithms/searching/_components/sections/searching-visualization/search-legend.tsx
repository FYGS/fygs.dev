export function SearchLegend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-8">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-muted border border-muted-foreground/20 rounded"></div>
        <span className="text-sm text-muted-foreground">Non visité</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-900/30 border border-blue-500 rounded"></div>
        <span className="text-sm text-muted-foreground">
          En cours d&apos;examen
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-amber-900/30 border border-amber-500 rounded"></div>
        <span className="text-sm text-muted-foreground">
          Position actuelle
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-900/30 border border-green-500 rounded"></div>
        <span className="text-sm text-muted-foreground">
          Élément trouvé
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-900/30 border border-red-500 rounded"></div>
        <span className="text-sm text-muted-foreground">
          Élément non trouvé
        </span>
      </div>
    </div>
  );
}
