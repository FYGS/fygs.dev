import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CourseFormApi, generateSlug } from "./schema";

/** Title, slug and description. */
export function BasicInfoSection({ form }: {
  form: CourseFormApi;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de base</CardTitle>
        <CardDescription>
          Définissez les informations principales de votre formation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la formation</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Introduction à React"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Auto-generate slug
                      const newSlug = generateSlug(e.target.value);
                      form.setValue("slug", newSlug);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="introduction-a-react" {...field} />
                </FormControl>
                <FormDescription>
                  URL de votre formation (généré automatiquement)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre formation en détail..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
