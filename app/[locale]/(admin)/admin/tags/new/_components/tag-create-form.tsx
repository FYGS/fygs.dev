"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createTag } from "../../_actions/tag-actions";

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
];

export function TagCreateForm() {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Le nom du tag est requis");
      return;
    }

    const finalColor = customColor.trim() || color;

    startTransition(async () => {
      try {
        const result = await createTag({
          name: name.trim(),
          color: finalColor,
        });

        if (result.success) {
          toast.success("Tag créé avec succès!");
          router.push("/admin/tags");
        } else {
          toast.error(result.error || "Erreur lors de la création du tag");
        }
      } catch (error) {
        console.error("Tag creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du tag</CardTitle>
            <CardDescription>
              Définissez le nom et la couleur de votre tag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du tag *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Frontend, Backend, API..."
                required
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground">
                {name.length}/50 caractères
              </p>
            </div>

            {/* Color Presets */}
            <div className="space-y-4">
              <Label>Couleur du tag</Label>
              
              {/* Preset Colors */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Couleurs prédéfinies
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => {
                        setColor(presetColor);
                        setCustomColor("");
                      }}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        color === presetColor && !customColor
                          ? "border-gray-900 scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: presetColor }}
                      aria-label={`Couleur ${presetColor}`}
                      aria-pressed={color === presetColor && !customColor}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Couleur personnalisée
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    aria-label="Couleur personnalisée"
                    value={customColor || color}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customColor || color}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: (customColor || color) + "20",
                    color: `color-mix(in srgb, ${customColor || color} 35%, hsl(var(--foreground)))`,
                    borderColor: (customColor || color) + "40",
                  }}
                  className="border"
                >
                  {name || "Nom du tag"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Aperçu du tag tel qu&apos;il apparaîtra
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Annuler
          </Button>
          
          <Button type="submit" disabled={isPending || !name.trim()}>
            {isPending ? "Création..." : "Créer le tag"}
          </Button>
        </div>
      </form>
    </div>
  );
}