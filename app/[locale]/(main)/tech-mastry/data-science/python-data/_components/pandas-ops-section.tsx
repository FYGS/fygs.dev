import { Badge } from "@/components/ui/badge";
import { pandasOps } from "../_data/content";

export function PandasOpsSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Pandas — Opérations essentielles</h2>
      <div className="overflow-x-auto rounded-lg border border-border/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold">Opération</th>
              <th className="px-4 py-3 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {pandasOps.map((o, i) => (
              <tr
                key={i}
                className="border-t border-border/20 hover:bg-muted/20"
              >
                <td className="px-4 py-2 font-mono text-xs text-primary">
                  {o.op}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{o.desc}</td>
                <td className="px-4 py-2">
                  <Badge variant="outline" className="text-[10px]">
                    {o.cat}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
