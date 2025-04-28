"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as d3 from "d3";
import { BarChart, LineChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChartType = "bar" | "line" | "radar";
type ComparisonMetric = "performance" | "memory" | "usage";

// Données de performance pour les différents algorithmes
const performanceData = [
  {
    name: "Recherche Linéaire",
    complexity: "O(n)",
    color: "#ef4444", // red-500
    values: [
      { size: 10, time: 0.1 },
      { size: 100, time: 1 },
      { size: 1000, time: 10 },
      { size: 10000, time: 100 },
      { size: 100000, time: 1000 },
    ],
  },
  {
    name: "Recherche Binaire",
    complexity: "O(log n)",
    color: "#3b82f6", // blue-500
    values: [
      { size: 10, time: 0.033 },
      { size: 100, time: 0.067 },
      { size: 1000, time: 0.1 },
      { size: 10000, time: 0.133 },
      { size: 100000, time: 0.167 },
    ],
  },
  {
    name: "Recherche par Saut",
    complexity: "O(√n)",
    color: "#10b981", // emerald-500
    values: [
      { size: 10, time: 0.032 },
      { size: 100, time: 0.1 },
      { size: 1000, time: 0.32 },
      { size: 10000, time: 1 },
      { size: 100000, time: 3.2 },
    ],
  },
  {
    name: "Recherche par Interpolation",
    complexity: "O(log log n)",
    color: "#8b5cf6", // violet-500
    values: [
      { size: 10, time: 0.03 },
      { size: 100, time: 0.05 },
      { size: 1000, time: 0.07 },
      { size: 10000, time: 0.09 },
      { size: 100000, time: 0.11 },
    ],
  },
  {
    name: "Recherche par Hachage",
    complexity: "O(1)",
    color: "#f59e0b", // amber-500
    values: [
      { size: 10, time: 0.01 },
      { size: 100, time: 0.01 },
      { size: 1000, time: 0.01 },
      { size: 10000, time: 0.01 },
      { size: 100000, time: 0.01 },
    ],
  },
  {
    name: "Recherche Exponentielle",
    complexity: "O(log i)",
    color: "#ec4899", // pink-500
    values: [
      { size: 10, time: 0.035 },
      { size: 100, time: 0.07 },
      { size: 1000, time: 0.105 },
      { size: 10000, time: 0.14 },
      { size: 100000, time: 0.175 },
    ],
  },
  {
    name: "Recherche Ternaire",
    complexity: "O(log₃ n)",
    color: "#06b6d4", // cyan-500
    values: [
      { size: 10, time: 0.03 },
      { size: 100, time: 0.06 },
      { size: 1000, time: 0.09 },
      { size: 10000, time: 0.12 },
      { size: 100000, time: 0.15 },
    ],
  },
];

// Données de mémoire pour les différents algorithmes
const memoryData = [
  {
    name: "Recherche Linéaire",
    complexity: "O(1)",
    color: "#ef4444", // red-500
    value: 1,
  },
  {
    name: "Recherche Binaire",
    complexity: "O(1)",
    color: "#3b82f6", // blue-500
    value: 1,
  },
  {
    name: "Recherche par Saut",
    complexity: "O(1)",
    color: "#10b981", // emerald-500
    value: 1,
  },
  {
    name: "Recherche par Interpolation",
    complexity: "O(1)",
    color: "#8b5cf6", // violet-500
    value: 1,
  },
  {
    name: "Recherche par Hachage",
    complexity: "O(n)",
    color: "#f59e0b", // amber-500
    value: 10,
  },
  {
    name: "Recherche Exponentielle",
    complexity: "O(1)",
    color: "#ec4899", // pink-500
    value: 1,
  },
  {
    name: "Recherche Ternaire",
    complexity: "O(1)",
    color: "#06b6d4", // cyan-500
    value: 1,
  },
];

// Données d'utilisation pour les différents algorithmes
const usageData = [
  {
    name: "Recherche Linéaire",
    color: "#ef4444", // red-500
    scenarios: [
      { name: "Données non triées", value: 10 },
      { name: "Petits ensembles", value: 8 },
      { name: "Simplicité", value: 10 },
      { name: "Performance", value: 2 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche Binaire",
    color: "#3b82f6", // blue-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 5 },
      { name: "Simplicité", value: 7 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Saut",
    color: "#10b981", // emerald-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 3 },
      { name: "Simplicité", value: 6 },
      { name: "Performance", value: 7 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Interpolation",
    color: "#8b5cf6", // violet-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 2 },
      { name: "Simplicité", value: 4 },
      { name: "Performance", value: 9 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Hachage",
    color: "#f59e0b", // amber-500
    scenarios: [
      { name: "Données non triées", value: 10 },
      { name: "Petits ensembles", value: 5 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 10 },
      { name: "Mémoire", value: 3 },
    ],
  },
  {
    name: "Recherche Exponentielle",
    color: "#ec4899", // pink-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 6 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche Ternaire",
    color: "#06b6d4", // cyan-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 4 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
];

interface PerformanceChartProps {
  metric: ComparisonMetric;
}

export function PerformanceChart({ metric }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const chartRef = useRef<HTMLDivElement>(null);

  // Fonction pour dessiner le graphique de performance (ligne)
  const drawPerformanceLineChart = () => {
    if (!chartRef.current) return;

    // Nettoyer le graphique précédent
    d3.select(chartRef.current).selectAll("*").remove();

    const width = chartRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleLog().domain([10, 100000]).range([0, innerWidth]);

    const yScale = d3.scaleLog().domain([0.01, 1000]).range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(","));
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}ms`);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    svg.append("g").call(yAxis);

    // Étiquettes des axes
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Taille des données");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Temps (ms)");

    // Lignes
    const line = d3
      .line<{ size: number; time: number }>()
      .x((d) => xScale(d.size))
      .y((d) => yScale(d.time))
      .curve(d3.curveMonotoneX);

    performanceData.forEach((algorithm) => {
      // Ligne avec animation
      const path = svg
        .append("path")
        .datum(algorithm.values)
        .attr("fill", "none")
        .attr("stroke", algorithm.color)
        .attr("stroke-width", 2.5)
        .attr("stroke-opacity", 0.8)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line);

      // Animation de la ligne
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      // Points avec animation et interactivité
      const points = svg
        .selectAll(`.dot-${algorithm.name.replace(/\s+/g, "-")}`)
        .data(algorithm.values)
        .enter()
        .append("circle")
        .attr("class", `.dot-${algorithm.name.replace(/\s+/g, "-")}`)
        .attr("cx", (d) => xScale(d.size))
        .attr("cy", (d) => yScale(d.time))
        .attr("r", 0) // Commencer avec un rayon de 0 pour l'animation
        .attr("fill", algorithm.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer");

      // Animation des points
      points
        .transition()
        .delay((_d, i) => i * 150 + 500) // Délai progressif pour chaque point
        .duration(300)
        .attr("r", 5);

      // Ajouter des tooltips sur les points
      points
        .append("title")
        .text((d) => `Taille: ${d.size}, Temps: ${d.time}ms`);

      // Effet de survol
      points
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 7)
            .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 5)
            .attr("stroke-width", 1.5);
        });
    });

    // Légende
    const legend = svg
      .append("g")
      .attr("transform", `translate(${innerWidth + 10}, 0)`);

    // Diviser la légende en deux colonnes si nécessaire
    const legendItemHeight = 20;
    const maxLegendHeight = innerHeight;
    const itemsPerColumn = Math.ceil(maxLegendHeight / legendItemHeight);

    performanceData.forEach((algorithm, i) => {
      const columnIndex = Math.floor(i / itemsPerColumn);
      const rowIndex = i % itemsPerColumn;

      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(${columnIndex * 120}, ${rowIndex * legendItemHeight})`
        );

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", algorithm.color);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .attr("class", "chart-text")
        .style("font-size", "12px")
        .style("fill", "currentColor")
        .text(`${algorithm.name} - ${algorithm.complexity}`);
    });
  };

  // Fonction pour dessiner le graphique de performance (barres)
  const drawPerformanceBarChart = () => {
    if (!chartRef.current) return;

    // Nettoyer le graphique précédent
    d3.select(chartRef.current).selectAll("*").remove();

    const width = chartRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Données pour le graphique à barres (utiliser seulement la taille 10000)
    const barData = performanceData.map((algorithm) => {
      const dataPoint = algorithm.values.find((v) => v.size === 10000);
      return {
        name: algorithm.name,
        complexity: algorithm.complexity,
        color: algorithm.color,
        time: dataPoint ? dataPoint.time : 0,
      };
    });

    // Échelles
    const xScale = d3
      .scaleBand()
      .domain(barData.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.2);

    // Assurer que toutes les valeurs sont > 0 pour l'échelle logarithmique
    const minValue = 0.01;
    const maxValue =
      Math.max(...barData.map((d) => Math.max(d.time, minValue))) * 1.1;

    const yScale = d3
      .scaleLog()
      .domain([minValue, maxValue])
      .range([innerHeight, 0]);

    // S'assurer que les valeurs nulles ou trop petites sont gérées correctement
    barData.forEach((d) => {
      if (d.time < minValue) d.time = minValue;
    });

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}ms`);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("class", "chart-text")
      .style("fill", "currentColor");

    svg
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("class", "chart-text")
      .style("fill", "currentColor");

    // Étiquettes des axes
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Algorithme");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Temps (ms)");

    // Barres avec animation et interactivité
    const bars = svg
      .selectAll(".bar")
      .data(barData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name) || 0)
      .attr("y", innerHeight) // Commencer du bas pour l'animation
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Hauteur initiale 0 pour l'animation
      .attr("fill", (d) => d.color)
      .attr("rx", 4) // Coins arrondis
      .attr("ry", 4) // Coins arrondis
      .attr("opacity", 0.8)
      .style("cursor", "pointer");

    // Animation des barres
    bars
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100)
      .attr("y", (d) => yScale(d.time))
      .attr("height", (d) => innerHeight - yScale(d.time));

    // Ajouter des tooltips sur les barres
    bars
      .append("title")
      .text((d) => `${d.name}: ${d.time}ms (${d.complexity})`);

    // Effet de survol
    bars
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("stroke", "none");
      });

    // Légende
    const legend = svg
      .append("g")
      .attr("transform", `translate(${innerWidth + 10}, 0)`);

    // Diviser la légende en deux colonnes si nécessaire
    const legendItemHeight = 20;
    const maxLegendHeight = innerHeight;
    const itemsPerColumn = Math.ceil(maxLegendHeight / legendItemHeight);

    barData.forEach((algorithm, i) => {
      const columnIndex = Math.floor(i / itemsPerColumn);
      const rowIndex = i % itemsPerColumn;

      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(${columnIndex * 120}, ${rowIndex * legendItemHeight})`
        );

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", algorithm.color);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .attr("class", "chart-text")
        .style("font-size", "12px")
        .style("fill", "currentColor")
        .text(`${algorithm.name} - ${algorithm.complexity}`);
    });
  };

  // Fonction pour dessiner le graphique de mémoire
  const drawMemoryChart = () => {
    if (!chartRef.current) return;

    // Nettoyer le graphique précédent
    d3.select(chartRef.current).selectAll("*").remove();

    const width = chartRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3
      .scaleBand()
      .domain(memoryData.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(...memoryData.map((d) => d.value)) * 1.1])
      .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}x`);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("class", "chart-text")
      .style("fill", "currentColor");

    svg
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("class", "chart-text")
      .style("fill", "currentColor");

    // Étiquettes des axes
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Algorithme");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("class", "chart-text")
      .style("fill", "currentColor")
      .text("Utilisation de mémoire (relative)");

    // Barres avec animation et interactivité
    const bars = svg
      .selectAll(".bar")
      .data(memoryData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name) || 0)
      .attr("y", innerHeight) // Commencer du bas pour l'animation
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Hauteur initiale 0 pour l'animation
      .attr("fill", (d) => d.color)
      .attr("rx", 4) // Coins arrondis
      .attr("ry", 4) // Coins arrondis
      .attr("opacity", 0.8)
      .style("cursor", "pointer");

    // Animation des barres
    bars
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => innerHeight - yScale(d.value));

    // Ajouter des tooltips sur les barres
    bars.append("title").text((d) => `${d.name}: ${d.complexity}`);

    // Effet de survol
    bars
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("stroke", "none");
      });

    // Légende
    const legend = svg
      .append("g")
      .attr("transform", `translate(${innerWidth + 10}, 0)`);

    // Diviser la légende en deux colonnes si nécessaire
    const legendItemHeight = 20;
    const maxLegendHeight = innerHeight;
    const itemsPerColumn = Math.ceil(maxLegendHeight / legendItemHeight);

    memoryData.forEach((algorithm, i) => {
      const columnIndex = Math.floor(i / itemsPerColumn);
      const rowIndex = i % itemsPerColumn;

      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(${columnIndex * 120}, ${rowIndex * legendItemHeight})`
        );

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", algorithm.color);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .attr("class", "chart-text")
        .style("font-size", "12px")
        .style("fill", "currentColor")
        .text(`${algorithm.name} - ${algorithm.complexity}`);
    });
  };

  // Fonction pour dessiner le graphique d'utilisation (radar)
  const drawUsageChart = () => {
    if (!chartRef.current) return;

    // Nettoyer le graphique précédent
    d3.select(chartRef.current).selectAll("*").remove();

    const width = chartRef.current.clientWidth;
    const height = 500;
    const margin = { top: 50, right: 100, bottom: 50, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Configuration du radar
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const scenarios = usageData[0].scenarios.map((s) => s.name);
    const numScenarios = scenarios.length;
    const angleSlice = (Math.PI * 2) / numScenarios;

    // Échelle radiale
    const rScale = d3.scaleLinear().domain([0, 10]).range([0, radius]);

    // Dessiner les axes
    const axes = svg
      .selectAll(".axis")
      .data(scenarios)
      .enter()
      .append("g")
      .attr("class", "axis");

    // Lignes des axes
    axes
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr(
        "x2",
        (_d, i) => rScale(10) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y2",
        (_d, i) => rScale(10) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .attr("class", "line")
      .style("stroke", "var(--muted-foreground)")
      .style("stroke-width", "1px");

    // Étiquettes des axes
    axes
      .append("text")
      .attr("class", "legend chart-text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr(
        "x",
        (_d, i) => rScale(10.5) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y",
        (_d, i) => rScale(10.5) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .style("fill", "currentColor")
      .text((d) => d);

    // Cercles concentriques
    const levels = 5;
    svg
      .selectAll(".circle")
      .data(d3.range(1, levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", (d) => (radius / levels) * d)
      .style("fill", "none")
      .style("stroke", "var(--muted-foreground)")
      .style("stroke-width", "1px");

    // Fonction pour créer le chemin du radar
    const radarLine = d3
      .lineRadial<{ name: string; value: number }>()
      .radius((d) => rScale(d.value))
      .angle((_d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Dessiner les polygones pour chaque algorithme
    usageData.forEach((algorithm) => {
      // Préparer les données pour le radar
      const dataPoints = scenarios.map((scenario) => {
        const match = algorithm.scenarios.find((s) => s.name === scenario);
        return {
          name: scenario,
          value: match ? match.value : 0,
        };
      });

      // Dessiner le polygone avec animation
      const path = svg
        .append("path")
        .datum(dataPoints)
        .attr("class", "radarArea")
        .attr("d", radarLine)
        .style("fill", algorithm.color)
        .style("fill-opacity", 0)
        .style("stroke", algorithm.color)
        .style("stroke-width", "2.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round");

      // Animation du polygone
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .transition()
        .duration(500)
        .style("fill-opacity", 0.2);

      // Effet de survol sur le polygone
      path
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style("fill-opacity", 0.4)
            .style("stroke-width", "3px");
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style("fill-opacity", 0.2)
            .style("stroke-width", "2.5px");
        });

      // Ajouter des points aux sommets avec animation et interactivité
      const points = svg
        .selectAll(`.radarCircle-${algorithm.name.replace(/\s+/g, "-")}`)
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("class", `radarCircle-${algorithm.name.replace(/\s+/g, "-")}`)
        .attr("r", 0) // Commencer avec un rayon de 0 pour l'animation
        .attr(
          "cx",
          (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
        )
        .attr(
          "cy",
          (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
        )
        .style("fill", algorithm.color)
        .style("fill-opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .style("cursor", "pointer");

      // Animation des points
      points
        .transition()
        .delay((_d, i) => i * 150 + 1000) // Délai progressif après l'animation du polygone
        .duration(300)
        .attr("r", 5);

      // Ajouter des tooltips sur les points
      points.append("title").text((d) => `${d.name}: ${d.value}`);

      // Effet de survol
      points
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 7)
            .style("fill-opacity", 1)
            .style("stroke-width", 2);
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 5)
            .style("fill-opacity", 0.8)
            .style("stroke-width", 1.5);
        });
    });

    // Légende
    const legend = svg
      .append("g")
      .attr("transform", `translate(${radius + 20}, ${-radius})`);

    // Diviser la légende en deux colonnes si nécessaire
    const legendItemHeight = 20;
    const maxLegendHeight = radius * 2;
    const itemsPerColumn = Math.ceil(maxLegendHeight / legendItemHeight);

    usageData.forEach((algorithm, i) => {
      const columnIndex = Math.floor(i / itemsPerColumn);
      const rowIndex = i % itemsPerColumn;

      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(${columnIndex * 120}, ${rowIndex * legendItemHeight})`
        );

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", algorithm.color);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .attr("class", "chart-text")
        .style("font-size", "12px")
        .style("fill", "currentColor")
        .text(algorithm.name);
    });
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
