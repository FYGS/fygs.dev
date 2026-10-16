import { type CourseEditFormApi, generateSlug } from "./schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

/** Title, slug, description and cover image. */
export function BasicInfoSection({ form }: {
  form: CourseEditFormApi;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de base</CardTitle>
        <CardDescription>
          Modifiez les informations principales de votre formation
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
                      form.setValue("slug", generateSlug(e.target.value));
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
                <FormDescription>Généré automatiquement</FormDescription>
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

        <div className="space-y-2">
          <Label>Image de couverture</Label>
          <ImageUpload
            onImageUploaded={(url) => form.setValue("thumbnail", url)}
            currentImageUrl={form.watch("thumbnail")}
            folder="courses"
            prefix="cover"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
