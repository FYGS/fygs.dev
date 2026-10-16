import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CourseFormApi } from "./schema";

/** Price and estimated duration. */
export function PricingSection({ form }: {
  form: CourseFormApi;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarification et durée</CardTitle>
        <CardDescription>
          Définissez le prix et la durée estimée de la formation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Laissez vide pour une formation gratuite
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="120"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Durée totale estimée de la formation
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
