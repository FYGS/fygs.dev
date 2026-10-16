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

  // Fonction pour dessiner le graphique de performance (ligne)
  const drawPerformanceLineChart = () => {
    if (!chartRef.current) return;
    renderPerformanceLineChart(chartRef.current);
  };

  // Fonction pour dessiner le graphique de performance (barres)
  const drawPerformanceBarChart = () => {
    if (!chartRef.current) return;
    renderPerformanceBarChart(chartRef.current);
  };

  // Fonction pour dessiner le graphique de mémoire
  const drawMemoryChart = () => {
    if (!chartRef.current) return;
    renderMemoryChart(chartRef.current);
  };

  // Fonction pour dessiner le graphique d'utilisation (radar)
  const drawUsageChart = () => {
    if (!chartRef.current) return;
    renderUsageChart(chartRef.current);
  };

  // Dessiner le graphique approprié en fonction de la métrique et du type de graphique
  useEffect(() => {
    if (metric === "performance") {
      if (chartType === "line") {
        drawPerformanceLineChart();
      } else if (chartType === "bar") {
        drawPerformanceBarChart();
      }
    } else if (metric === "memory") {
      drawMemoryChart();
    } else if (metric === "usage") {
      drawUsageChart();
    }
  }, [metric, chartType, chartRef.current?.clientWidth]);

  // Redessiner le graphique lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (metric === "performance") {
        if (chartType === "line") {
          drawPerformanceLineChart();
        } else if (chartType === "bar") {
          drawPerformanceBarChart();
        }
      } else if (metric === "memory") {
        drawMemoryChart();
      } else if (metric === "usage") {
        drawUsageChart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
