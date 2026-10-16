import { type CourseEditFormApi } from "./schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

/** Public marketing content (MDX), trailer and FAQ. */
export function MarketingContentSection({ form }: {
  form: CourseEditFormApi;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section publique marketing</CardTitle>
        <CardDescription>
          Contenu marketing affiché publiquement avant inscription (MDX
          supporté)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="publicStructure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Structure du cours</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez la structure et l'organisation..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicResources"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ressources incluses</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="PDFs, vidéos, templates..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicEvaluation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Évaluation et certification</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Quizzes, projets, certificat..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicPrerequisites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prérequis et public cible</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Niveau requis, outils nécessaires..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trailerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de la bande-annonce</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://.../trailer.mp4"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Vidéo hero affichée sur la landing publique.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="faq"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FAQ (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='[{"q":"Question ?","a":"Réponse"}]'
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tableau JSON d&apos;objets contenant `q` et `a`.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
