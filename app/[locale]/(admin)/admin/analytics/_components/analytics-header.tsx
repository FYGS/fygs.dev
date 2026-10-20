import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/services/admin-analytics";

/** Title, the period (a GET form: the URL carries it, the server computes it) and the CSV export of that period. */
export function AnalyticsHeader({ range }: { range: AnalyticsRange }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gradient-heading">Analytics & Rapports</h1>
        <p className="text-muted-foreground">Les chiffres de la plateforme FYGS Learning, calculés à chaque affichage</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form method="get" action="/admin/analytics" className="flex items-center gap-2">
          <label htmlFor="range" className="text-sm text-muted-foreground">
            Période
          </label>
          <select
            id="range"
            name="range"
            defaultValue={String(range)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ANALYTICS_RANGES.map((months) => (
              <option key={months} value={months}>
                {months} derniers mois
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="sm">
            Afficher
          </Button>
        </form>

        <Button variant="outline" size="sm" asChild>
          <a href={`/api/admin/analytics/export?range=${range}`} download>
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </a>
        </Button>
      </div>
    </div>
  );
}
