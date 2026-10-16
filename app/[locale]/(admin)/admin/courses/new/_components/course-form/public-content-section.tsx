import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CourseFormApi } from "./schema";

/** Public marketing content (MDX), trailer and FAQ. */
export function PublicContentSection({ form }: {
  form: CourseFormApi;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section publique marketing</CardTitle>
        <CardDescription>
          Contenu marketing affiché publiquement avant inscription.
          Utilisez MDX pour un formatage riche.
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
                    placeholder="Décrivez la structure et l'organisation de votre cours..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Format MDX supporté - utilisez **gras**, *italique*, -
                  listes, etc.
                </FormDescription>
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
                    placeholder="Listez les ressources, outils et supports fournis..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Exemples : PDFs, vidéos, templates, accès communauté...
                </FormDescription>
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
                    placeholder="Expliquez le système d'évaluation et les certifications..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Quizzes, projets, certificat de réussite...
                </FormDescription>
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
                    placeholder="Définissez les prérequis et le public visé..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Niveau requis, outils nécessaires, profil idéal...
                </FormDescription>
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
                  URL vidéo affichée dans le hero de la page publique.
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
                  Format attendu: tableau JSON d&apos;objets avec `q` et
                  `a`.
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
