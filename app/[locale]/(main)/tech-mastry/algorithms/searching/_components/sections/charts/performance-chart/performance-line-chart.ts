import * as d3 from "d3";
import { performanceData } from "./chart-data";

// Fonction pour dessiner le graphique de performance (ligne)
export function renderPerformanceLineChart(container: HTMLDivElement) {
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
}
