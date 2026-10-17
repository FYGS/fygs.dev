"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderMemoryChart } from "./memory-chart";
import { renderPerformanceBarChart } from "./performance-bar-chart";
import { renderPerformanceLineChart } from "./performance-line-chart";
import { renderUsageChart } from "./usage-chart";

type ChartType = "bar" | "line" | "radar";
type ComparisonMetric = "performance" | "memory" | "usage";

interface PerformanceChartProps {
  metric: ComparisonMetric;
}

export function PerformanceChart({ metric }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const chartRef = useRef<HTMLDivElement>(null);

  // Dessiner le graphique approprié en fonction de la métrique et du type de graphique,
  // et le redessiner lorsque la fenêtre ou le conteneur est redimensionné
  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const draw = () => {
      if (metric === "performance") {
        if (chartType === "line") {
          renderPerformanceLineChart(container);
        } else if (chartType === "bar") {
          renderPerformanceBarChart(container);
        }
      } else if (metric === "memory") {
        renderMemoryChart(container);
      } else if (metric === "usage") {
        renderUsageChart(container);
      }
    };

    draw();

    window.addEventListener("resize", draw);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw);
    observer?.observe(container);
    return () => {
      window.removeEventListener("resize", draw);
      observer?.disconnect();
    };
  }, [metric, chartType]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {metric === "performance" && (
          <div className="mb-4 flex justify-end">
            <Tabs
              value={chartType}
              onValueChange={(value) => setChartType(value as ChartType)}
            >
              <TabsList>
                <TabsTrigger
                  value="line"
                  className={
                    chartType === "line"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  Ligne
                </TabsTrigger>
                <TabsTrigger
                  value="bar"
                  className={
                    chartType === "bar"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Barres
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
        <div
          ref={chartRef}
          className="w-full h-[400px] md:h-[500px]"
          style={{ minHeight: "400px" }}
        ></div>
      </CardContent>
    </Card>
  );
}
