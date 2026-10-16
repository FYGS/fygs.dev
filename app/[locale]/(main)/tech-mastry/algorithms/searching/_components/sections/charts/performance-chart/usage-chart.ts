import * as d3 from "d3";
import { usageData } from "./chart-data";

// Fonction pour dessiner le graphique d'utilisation (radar)
export function renderUsageChart(container: HTMLDivElement) {
  // Nettoyer le graphique précédent
  d3.select(container).selectAll("*").remove();

  const width = container.clientWidth;
  const height = 500;
  const margin = { top: 50, right: 100, bottom: 50, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Créer le SVG
  const svg = d3
    .select(container)
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
}
