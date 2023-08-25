"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PieArcDatum } from "d3";
import { SVG_WIDTH, SVG_HEIGHT, COLORS } from "@/constants/pie-chart";

type PieChartProps = {
  compeletedTasks: number;
  totalTasks: number;
  title: string;
  subtitle: string;
  hoverText: string;
};

const PieChart = ({
  compeletedTasks,
  totalTasks,
  title,
  subtitle,
  hoverText,
}: PieChartProps) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  let percentage = Math.round((compeletedTasks / totalTasks) * 100);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const radius = SVG_WIDTH / 2;
    const color = d3.scaleOrdinal(COLORS);
    const pie = d3.pie().sort(null);
    const arc = d3
      .arc<PieArcDatum<number>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius);

    const data = [percentage, 100 - percentage].map(d => +d);

    svg.attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

    const group = svg
      .append("g")
      .attr("transform", `translate(${SVG_WIDTH / 2},${SVG_HEIGHT / 2})`);

    const arcs = group
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("padding", "8px")
      .style("border", "1px solid black")
      .style("border-radius", "5px")
      .style("font-size", "0.8rem")
      .style("color", "#555");

    const handleMouseOver = (d: PieArcDatum<number>, i: { index: number }) => {
      if (i.index === 0) {
        tooltip.text(`${hoverText}: ${percentage}%`);
      } else {
        tooltip.text(`미${hoverText}:  ${100 - percentage}%`);
      }
      tooltip
        .style("border-color", color(`${i.index}`))
        .style("visibility", "visible");
    };

    const handleMouseMove = (event: MouseEvent) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    };

    const handleMouseOut = () => {
      tooltip.style("visibility", "hidden");
    };

    const arcTween = (d: PieArcDatum<number | { valueOf(): number }>) => {
      const interp = d3.interpolate(d.startAngle, d.endAngle);
      return (t: number) => {
        d.endAngle = interp(t);
        return arc(d as PieArcDatum<number>) || "";
      };
    };

    arcs
      .append("path") 
      .attr("fill", (d, i) => color(`${i}`))
      .attr("d", d => arc(d as PieArcDatum<number>) || "")
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .transition()
      .delay((d, i) => i * 500) 
      .duration(700)
      .attrTween("d", arcTween);

    return () => {
      tooltip.remove();
    };
  }, [percentage]);

  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <div
        ref={containerRef}
        className="h-full flex justify-center items-center gap-6 border-solid border border-gray-200 rounded-[10px] px-3 py-4 my-3"
      >
        <svg ref={svgRef} className="cursor-pointer" />
        <small>
          {subtitle} ({percentage}%)
        </small>
      </div>
    </div>
  );
};
export default PieChart;
