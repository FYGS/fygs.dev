import * as d3 from "d3";
import { performanceData } from "./chart-data";

// Fonction pour dessiner le graphique de performance (barres)
export function renderPerformanceBarChart(container: HTMLDivElement) {
  // Nettoyer le graphique précédent
  d3.select(container).selectAll("*").remove();

  const width = container.clientWidth;
  const height = 400;
  const margin = { top: 20, right: 100, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Créer le SVG
  const svg = d3
    .select(container)
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
}
