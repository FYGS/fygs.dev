"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

interface NewsletterFormProps {
  categories: string[];
  currentEmail?: string;
}

export function NewsletterForm({
  categories,
  currentEmail,
}: NewsletterFormProps) {
  const [email, setEmail] = useState(currentEmail || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ici, vous pouvez ajouter votre logique d'API pour l'inscription à la newsletter
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation d'appel API

      toast.success("Successfully subscribed!", {
        description: "Thank you for subscribing to our newsletter.",
      });

      // Réinitialiser le formulaire
      setEmail("");
      setSelectedCategories([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Stay Updated</h3>
          <p className="text-muted-foreground">
            Get the latest articles and insights delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interests (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      setSelectedCategories((prev) =>
                        checked
                          ? [...prev, category]
                          : prev.filter((c) => c !== category)
                      );
                    }}
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: selectedCategories.length > 0 ? "auto" : 0,
              opacity: selectedCategories.length > 0 ? 1 : 0,
            }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive personalized updates for:{" "}
              {selectedCategories.join(", ")}
            </p>
          </motion.div>
        </form>

        <p className="text-xs text-muted-foreground">
          By subscribing, you agree to receive newsletter emails. You can
          unsubscribe at any time.
        </p>
      </motion.div>
    </Card>
  );
}
