"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, RotateCcw, Settings } from "lucide-react";

import type { AlgorithmType } from "./types";

interface SettingsCardProps {
  algorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  isRunning: boolean;
  arraySize: number;
  onSizeChange: (size: number) => void;
  target: number;
  onTargetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onGenerate: () => void;
}

export function SettingsCard({
  algorithm,
  onAlgorithmChange,
  isRunning,
  arraySize,
  onSizeChange,
  target,
  onTargetChange,
  speed,
  onSpeedChange,
  onToggle,
  onReset,
  onGenerate,
}: SettingsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Paramètres</CardTitle>
        <CardDescription>
          Configurez les paramètres de la visualisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sélection de l'algorithme */}
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithme</Label>
            <Select
              value={algorithm}
              onValueChange={(value) => onAlgorithmChange(value as AlgorithmType)}
              disabled={isRunning}
            >
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Choisir un algorithme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Recherche Linéaire</SelectItem>
                <SelectItem value="binary">Recherche Binaire</SelectItem>
                <SelectItem value="jump">Recherche par Saut</SelectItem>
                <SelectItem value="interpolation">
                  Recherche par Interpolation
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Taille du tableau */}
          <div className="space-y-2">
            <Label htmlFor="array-size">Taille du tableau: {arraySize}</Label>
            <Slider
              id="array-size"
              min={5}
              max={50}
              step={5}
              value={[arraySize]}
              onValueChange={(value) => onSizeChange(value[0])}
              disabled={isRunning}
            />
          </div>

          {/* Valeur cible */}
          <div className="space-y-2">
            <Label htmlFor="target-value">Valeur recherchée</Label>
            <Input
              id="target-value"
              type="number"
              min={1}
              max={100}
              value={target}
              onChange={onTargetChange}
              disabled={isRunning}
            />
          </div>

          {/* Vitesse */}
          <div className="space-y-2">
            <Label htmlFor="speed">Vitesse: {speed}%</Label>
            <Slider
              id="speed"
              min={10}
              max={100}
              step={10}
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
            />
          </div>
        </div>

        {/* Boutons de contrôle */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button
            onClick={onToggle}
            className="flex items-center gap-2"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Démarrer
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRunning}
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>

          <Button
            onClick={onGenerate}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRunning}
          >
            <Settings className="w-4 h-4" />
            Nouveau tableau
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
