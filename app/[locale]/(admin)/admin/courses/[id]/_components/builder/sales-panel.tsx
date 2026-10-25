"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VideoUpload } from "@/components/admin/video-upload";
import { normalizeTrailerUrl } from "@/lib/curriculum/content";
import type { CurriculumSnapshot } from "@/lib/curriculum/curriculum";
import { MIN_PREMIUM_PRICE } from "@/lib/curriculum/publish";
import { allLessons, freeSampleLessons } from "@/lib/curriculum/snapshot";
import { FaqEditor } from "./faq-editor";
import type { CourseInfo, SectionId } from "./types";

interface Props {
  info: CourseInfo;
  update: (patch: Partial<CourseInfo>) => void;
  snapshot: CurriculumSnapshot;
  onGoToSection: (section: SectionId) => void;
}

/** What a visitor sees before enrolling: price, trailer, the programme pitch and the questions they ask. */
export function SalesPanel({ info, update, snapshot, onGoToSection }: Props) {
  const premium = info.accessTier === "PREMIUM";
  const priceMissing = premium && !(info.price !== null && info.price >= MIN_PREMIUM_PRICE);
  const samples = freeSampleLessons(snapshot, info.previewEnabled);
  const draftSamples = allLessons(snapshot).filter((l) => l.isPreview && !l.published);
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
                <SelectItem value="FREE">Gratuite — ouverte à tout compte inscrit</SelectItem>
                <SelectItem value="PREMIUM">Premium — achat à vie ou abonnement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {premium && (
            <div className="space-y-1.5">
              <Label htmlFor="course-price">Prix (€)</Label>
              <Input
                id="course-price"
                type="number"
                min={MIN_PREMIUM_PRICE}
                step="0.01"
                inputMode="decimal"
                value={info.price ?? ""}
                aria-invalid={priceMissing}
                aria-describedby={priceMissing ? "course-price-error" : undefined}
                onChange={(e) => update({ price: e.target.value === "" ? null : Number(e.target.value) })}
              />
              {priceMissing && (
                <p id="course-price-error" className="text-sm text-amber-800 dark:text-amber-300">
                  Un prix d&apos;au moins 0,50 € est nécessaire pour publier une formation premium.
                </p>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {premium
            ? "Ouverte à vie par un achat à ce prix, ou incluse tant que l'apprenant a un abonnement Premium actif."
            : "Ouverte à tout apprenant qui s'inscrit, sans paiement."}
        </p>
      </section>

      <section aria-labelledby="sales-sample" className="space-y-4">
        <div>
          <h2 id="sales-sample" className="text-lg font-semibold">
            Aperçu gratuit
          </h2>
          <p className="text-sm text-muted-foreground">
            Des leçons que tout le monde peut suivre, même sans compte, pour découvrir la formation avant de s&apos;inscrire ou de
            l&apos;acheter. Ce sont les leçons publiées marquées « Aperçu gratuit » dans le programme, et la première leçon si vous
            l&apos;activez ci-dessous.
          </p>
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="course-preview">Offrir la première leçon en aperçu</Label>
            <p className="text-sm text-muted-foreground">La première leçon publiée du programme s&apos;ajoute aux leçons marquées.</p>
          </div>
          <Switch id="course-preview" checked={info.previewEnabled} onCheckedChange={(checked) => update({ previewEnabled: checked })} />
        </div>
        <div className="rounded-lg border bg-card p-4 text-sm">
          {samples.length === 0 ? (
            <p className="text-muted-foreground">Aucune leçon en aperçu : les visiteurs ne voient que le programme.</p>
          ) : (
            <>
              <p className="font-medium">
                {samples.length} leçon{samples.length > 1 ? "s" : ""} en aperçu gratuit
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {samples.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ul>
            </>
          )}
          {draftSamples.length > 0 && (
            <p className="mt-3 text-amber-800 dark:text-amber-300">
              Marquée{draftSamples.length > 1 ? "s" : ""} mais en brouillon, donc sans effet :{" "}
              {draftSamples.map((l) => `« ${l.title} »`).join(", ")}.{" "}
              <button type="button" className="underline underline-offset-4" onClick={() => onGoToSection("programme")}>
                Ouvrir le programme
              </button>
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="sales-trailer" className="space-y-4">
        <div>
          <h2 id="sales-trailer" className="text-lg font-semibold">
            Bande-annonce
          </h2>
          <p className="text-sm text-muted-foreground">Une vidéo courte en tête de la page de la formation. Envoyez un fichier ou collez une adresse.</p>
        </div>
        <VideoUpload value={info.trailerUrl} onChange={(url) => update({ trailerUrl: url })} label="Adresse de la bande-annonce" />
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
