"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VideoUpload } from "@/components/admin/video-upload";
import { normalizeTrailerUrl } from "@/lib/curriculum/content";
import { FaqEditor } from "./faq-editor";
import type { CourseInfo } from "./types";

interface Props {
  info: CourseInfo;
  update: (patch: Partial<CourseInfo>) => void;
}

/** What a visitor sees before enrolling: price, trailer, the programme pitch and the questions they ask. */
export function SalesPanel({ info, update }: Props) {
  const premium = info.accessTier === "PREMIUM";
  const priceMissing = premium && !(info.price && info.price > 0);
  const trailerInvalid = info.trailerUrl.trim() !== "" && normalizeTrailerUrl(info.trailerUrl) === undefined;

  return (
    <div className="space-y-10">
      <section aria-labelledby="sales-access" className="space-y-5">
        <h2 id="sales-access" className="text-lg font-semibold">
          Accès et prix
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="course-tier">Accès</Label>
            <Select value={info.accessTier} onValueChange={(value) => update({ accessTier: value as CourseInfo["accessTier"] })}>
              <SelectTrigger id="course-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Gratuit — ouvert à tout compte</SelectItem>
                <SelectItem value="PREMIUM">Premium — achat ou abonnement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {premium && (
            <div className="space-y-1.5">
              <Label htmlFor="course-price">Prix (€)</Label>
              <Input
                id="course-price"
                type="number"
                min={0}
                step="0.01"
                value={info.price ?? ""}
                aria-invalid={priceMissing}
                aria-describedby={priceMissing ? "course-price-error" : undefined}
                onChange={(e) => update({ price: e.target.value === "" ? null : Number(e.target.value) })}
              />
              {priceMissing && (
                <p id="course-price-error" className="text-sm text-amber-600 dark:text-amber-400">
                  Un prix supérieur à 0 est nécessaire pour publier une formation premium.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="course-preview">Première leçon en aperçu gratuit</Label>
            <p className="text-sm text-muted-foreground">
              Si aucune leçon n&apos;est marquée « aperçu gratuit » dans le programme, la première est ouverte aux visiteurs sans accès. Les leçons marquées le sont toujours.
            </p>
          </div>
          <Switch id="course-preview" checked={info.previewEnabled} onCheckedChange={(checked) => update({ previewEnabled: checked })} />
        </div>
      </section>

      <section aria-labelledby="sales-trailer" className="space-y-4">
        <div>
          <h2 id="sales-trailer" className="text-lg font-semibold">
            Bande-annonce
          </h2>
          <p className="text-sm text-muted-foreground">Une vidéo courte en tête de la page de la formation. Envoyez un fichier ou collez une adresse.</p>
        </div>
        <VideoUpload value={info.trailerUrl} onChange={(url) => update({ trailerUrl: url })} />
        {trailerInvalid && (
          <p role="alert" className="text-sm text-destructive">
            Cette adresse n&apos;est pas valide (http ou https). Elle n&apos;est pas enregistrée.
          </p>
        )}
      </section>

      <section aria-labelledby="sales-pitch" className="space-y-5">
        <div>
          <h2 id="sales-pitch" className="text-lg font-semibold">
            Présentation détaillée
          </h2>
          <p className="text-sm text-muted-foreground">Texte libre, la syntaxe Markdown est acceptée (titres, listes, liens).</p>
        </div>
        {(
          [
            ["publicStructure", "Organisation de la formation", "Comment la formation est construite, son rythme, sa durée."],
            ["publicResources", "Ressources incluses", "Fichiers, modèles, dépôts de code, outils fournis."],
            ["publicEvaluation", "Évaluation et certificat", "Comment on valide les acquis et ce que l'apprenant obtient à la fin."],
          ] as const
        ).map(([field, label, help]) => (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={`course-${field}`}>{label}</Label>
            <Textarea id={`course-${field}`} rows={5} value={info[field]} onChange={(e) => update({ [field]: e.target.value })} />
            <p className="text-sm text-muted-foreground">{help}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="sales-faq" className="space-y-4">
        <h2 id="sales-faq" className="text-lg font-semibold">
          Questions fréquentes
        </h2>
        <FaqEditor entries={info.faq} onChange={(faq) => update({ faq })} />
      </section>
    </div>
  );
}
