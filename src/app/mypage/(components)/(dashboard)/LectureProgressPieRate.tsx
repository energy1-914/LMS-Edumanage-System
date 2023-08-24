"use client";

import React, { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import * as d3 from "d3";
import { PieArcDatum } from "d3";

const LectureProgressPieRate = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const userId = useAppSelector(state => state.userInfo.id);
  const { progressData } = useUserActivityData(userId);
  let percentage = 0;
  if (progressData && progressData.completedLectures && progressData.total) {
    percentage = Math.round(
      (progressData.completedLectures / progressData.total) * 100,
    );
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 100;
    const height = 100;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(["#0059ff", "#CCDEFF"]); // 첫 번째 색상은 완료된 강의, 두 번째 색상은 남은 강의

    const pie = d3.pie().sort(null);
    const arc = d3
      .arc<PieArcDatum<number>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius);

    const data = [percentage, 100 - percentage].map(d => +d);

    svg.attr("width", width).attr("height", height);

    const group = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

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

    arcs
      .append("path")
      .attr("fill", (d, i) => color(`${i}`))
      .attr("d", (d: PieArcDatum<number>) => arc(d))
      .on("mouseover", function (d, i) {
        if (i.index === 0) {
          tooltip.text(`완료: ${percentage}%`);
        } else {
          tooltip.text(`미완료:  ${100 - percentage}%`);
        }
        tooltip
          .style("border-color", color(`${i.index}`)) // 테두리 색을 해당 파이 색상으로 변경
          .style("visibility", "visible");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .delay((d, i) => i * 500)
      .duration(500)
      .attrTween("d", function (d, i) {
        const interp = d3.interpolate(d.startAngle, d.endAngle);
        if (i === 0) {
          // 완료 부분
          return function (t) {
            d.endAngle = interp(t);
            return arc(d);
          };
        } else {
          // 미완료 부분
          d.startAngle = interp(0);
          return function (t) {
            d.endAngle = interp(t);
            return arc(d);
          };
        }
      });

    return () => {
      tooltip.remove();
    };
  }, [percentage]);

  return (
    <div>
      <h3 className="text-lg font-bold">강의 수강률</h3>
      <div
        ref={containerRef}
        className="h-full flex justify-center items-center gap-6 border-solid border border-gray-200 rounded-[10px] px-3 py-4 my-3 cursor-pointer"
      >
        <svg ref={svgRef} />
        <small>수강률 ({percentage}%)</small>
      </div>
    </div>
  );
};

export default LectureProgressPieRate;
