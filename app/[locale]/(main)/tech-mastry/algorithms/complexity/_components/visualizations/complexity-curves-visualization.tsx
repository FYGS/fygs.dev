"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useRef, useState } from "react";

interface ComplexityFunction {
  name: string;
  label: string;
  color: string;
  calculate: (n: number) => number;
  description: string;
}

const complexityFunctions: ComplexityFunction[] = [
  {
    name: "constant",
    label: "O(1)",
    color: "#22c55e", // green
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    calculate: (n: number) => 1,
    description:
      "Temps d'exécution constant, indépendant de la taille des données",
  },
  {
    name: "logarithmic",
    label: "O(log n)",
    color: "#3b82f6", // blue
    calculate: (n: number) => Math.log2(n),
    description:
      "Croissance très lente, divise le problème en parties plus petites",
  },
  {
    name: "linear",
    label: "O(n)",
    color: "#f59e0b", // amber
    calculate: (n: number) => n,
    description: "Croissance proportionnelle à la taille des données",
  },
  {
    name: "linearithmic",
    label: "O(n log n)",
    color: "#8b5cf6", // violet
    calculate: (n: number) => n * Math.log2(n),
    description:
      "Légèrement plus que linéaire, typique des algorithmes efficaces de tri",
  },
  {
    name: "quadratic",
    label: "O(n²)",
    color: "#ef4444", // red
    calculate: (n: number) => n * n,
    description: "Croissance au carré, problématique pour les grands ensembles",
  },
  {
    name: "exponential",
    label: "O(2ⁿ)",
    color: "#ec4899", // pink
    calculate: (n: number) => Math.pow(2, n),
    description: "Croissance explosive, souvent impraticable pour n > 20",
  },
];

export function ComplexityCurvesVisualization() {
  const [n, setN] = useState(10);
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(
    complexityFunctions.map((f) => f.name)
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonction pour dessiner le graphique
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Définir les dimensions du canvas
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner les axes
    ctx.beginPath();
    ctx.strokeStyle = "#64748b"; // slate-500
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dessiner les étiquettes des axes
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Taille de l'entrée (n)", width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Temps d'exécution", 0, 0);
    ctx.restore();

    // Calculer les valeurs maximales pour l'échelle
    const maxN = n;
    let maxY = 0;

    const selectedComplexityFunctions = complexityFunctions.filter((f) =>
      selectedFunctions.includes(f.name)
    );

    selectedComplexityFunctions.forEach((func) => {
      const value = func.calculate(maxN);
      if (value > maxY) maxY = value;
    });

    // Ajouter une marge pour que les courbes ne touchent pas le haut
    maxY = maxY * 1.1;

    // Dessiner les graduations sur l'axe X
    const xStep = (width - 2 * padding) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = padding + i * xStep;
      const tickValue = Math.round((i / 10) * maxN);

      ctx.beginPath();
      ctx.moveTo(x, height - padding);
      ctx.lineTo(x, height - padding + 5);
      ctx.stroke();

      ctx.fillText(tickValue.toString(), x, height - padding + 20);
    }

    // Dessiner les graduations sur l'axe Y
    const yStep = (height - 2 * padding) / 5;
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - i * yStep;
      const tickValue = Math.round((i / 5) * maxY);

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding - 5, y);
      ctx.stroke();

      ctx.textAlign = "right";
      ctx.fillText(tickValue.toString(), padding - 10, y + 4);
    }

    // Dessiner les courbes
    selectedComplexityFunctions.forEach((func) => {
      ctx.beginPath();
      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2;

      const points = [];

      // Calculer les points de la courbe
      for (let i = 0; i <= 100; i++) {
        const currentN = (i / 100) * maxN;
        const value = func.calculate(Math.max(1, currentN)); // Éviter log(0)

        const x = padding + (i / 100) * (width - 2 * padding);
        const y = height - padding - (value / maxY) * (height - 2 * padding);

        points.push({ x, y });

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Ajouter une étiquette à la fin de la courbe
      const lastPoint = points[points.length - 1];
      ctx.fillStyle = func.color;
      ctx.textAlign = "left";
      ctx.fillText(func.label, lastPoint.x + 5, lastPoint.y);
    });
  }, [n, selectedFunctions]);

  // Redessiner le graphique lorsque n ou les fonctions sélectionnées changent
  useEffect(() => {
    drawGraph();
  }, [n, selectedFunctions, drawGraph]);

  // Redimensionner le canvas lors du chargement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = 400;
      drawGraph();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [drawGraph]);

  // Gérer la sélection/désélection des fonctions
  const toggleFunction = (name: string) => {
    if (selectedFunctions.includes(name)) {
      if (selectedFunctions.length > 1) {
        setSelectedFunctions(selectedFunctions.filter((f) => f !== name));
      }
    } else {
      setSelectedFunctions([...selectedFunctions, name]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisation des Courbes de Complexité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="graph">Graphique</TabsTrigger>
            <TabsTrigger value="table">Tableau Comparatif</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {complexityFunctions.map((func) => (
                <Badge
                  key={func.name}
                  variant={
                    selectedFunctions.includes(func.name)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedFunctions.includes(func.name)
                      ? func.color
                      : "transparent",
                    color: selectedFunctions.includes(func.name)
                      ? "white"
                      : func.color,
                    borderColor: func.color,
                  }}
                  onClick={() => toggleFunction(func.name)}
                >
                  {func.label}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Taille de l&apos;entrée (n): {n}
                </span>
              </div>
              <Slider
                value={[n]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => setN(value[0])}
              />
            </div>

            <div className="relative w-full h-[400px] border rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Valeurs pour n = {n}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complexityFunctions
                  .filter((func) => selectedFunctions.includes(func.name))
                  .map((func) => (
                    <div
                      key={func.name}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: func.color }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className="font-medium"
                          style={{ color: func.color }}
                        >
                          {func.label}
                        </span>
                        <span className="text-sm">
                          {func.calculate(n).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {func.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_repeat(5,minmax(80px,1fr))] gap-2 font-medium text-sm">
                  <div>Complexité</div>
                  <div className="text-center">n=10</div>
                  <div className="text-center">n=100</div>
                  <div className="text-center">n=1,000</div>
                  <div className="text-center">n=10,000</div>
                  <div className="text-center">n=100,000</div>
                </div>

                {complexityFunctions.map((func) => (
                  <div
                    key={func.name}
                    className="grid grid-cols-[1fr_repeat(5,minmax(80px,1fr))] gap-2 text-sm border-t pt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: func.color }}
                      />
                      <span className="font-mono">{func.label}</span>
                    </div>
                    <div className="text-center">
                      {func.calculate(10).toLocaleString()}
                    </div>
                    <div className="text-center">
                      {func.calculate(100).toLocaleString()}
                    </div>
                    <div className="text-center">
                      {func.calculate(1000).toLocaleString()}
                    </div>
                    <div className="text-center">
                      {func.calculate(10000).toLocaleString()}
                    </div>
                    <div className="text-center">
                      {func.calculate(100000).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium">Interprétation</h3>
              <p className="text-sm text-muted-foreground">
                Ce tableau montre comment le temps d&apos;exécution (en unités
                arbitraires) évolue en fonction de la taille de l&apos;entrée
                pour différentes classes de complexité. Notez comment les
                algorithmes O(n²) et O(2ⁿ) deviennent rapidement impraticables
                pour de grandes entrées, tandis que O(1) et O(log n) restent
                très efficaces même avec des entrées massives.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
