"use client";

import React, { useEffect, useRef } from "react";
import {
  select,
  scaleTime,
  scaleLinear,
  axisBottom,
  line,
  axisLeft,
  timeParse,
  timeFormat,
  max,
} from "d3";
import { curveBasis } from "d3-shape";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import { useAppSelector } from "@/redux/store";

type Datum = {
  date: string;
  value: number;
};

const UserActivityGraph = () => {
  // 활동 지수 : 제출한 과제 + 게시글 작성 + 댓글 갯수
  const userId = useAppSelector(state => state.userInfo.id);
  const { activityCountsByDate } = useUserActivityData(userId);

  const data = Object.entries(activityCountsByDate)
    .map(([date, value]) => ({
      date: date,
      value: value,
    }))
    .sort(
      (a, b) =>
        timeParse("%m-%d")(a.date).getTime() -
        timeParse("%m-%d")(b.date).getTime(),
    );

  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = select(ref.current);
    const width = containerRef.current?.offsetWidth;
    const height = containerRef.current?.offsetHeight;
    const margin = { top: 15, right: 80, bottom: 50, left: 80 };
    const innerWidth = width ? width - margin.left - margin.right : 0;
    const innerHeight = height ? height - margin.top - margin.bottom : 0;
    const x = scaleTime().range([0, innerWidth]);
    const y = scaleLinear().range([innerHeight, 0]);

    const maxValue = max(data, d => d.value) || 0;

    const currentYear = new Date().getFullYear();
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    
    const sevenDaysData = [];
    let tempDate = new Date(startDate);

    while (tempDate <= endDate) {
      const dateString = `${String(tempDate.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(tempDate.getDate()).padStart(2, "0")}`;
      const found = data.find(d => `${d.date}` === dateString);
      sevenDaysData.push({
        date: dateString,
        value: found ? found.value : 0,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    x.domain([startDate, endDate]);
    y.domain([0, maxValue * 1.1]);

    const xAxis = axisBottom(x)
      .ticks(7)
      .tickFormat((domainValue): string => {
        if (domainValue instanceof Date) {
          return timeFormat("%m월 %d일")(domainValue);
        }
        return String(domainValue);
      });

    const myLine = line<Datum>()
      .x(d => {
        const dateWithYear = `${currentYear}-${d.date}`;
        const parsedDate = timeParse("%Y-%m-%d")(dateWithYear);
        return parsedDate ? x(parsedDate) : 0;
      })
      .y(d => y(d.value))
      .curve(curveBasis);

    svg
      .append("path")
      .data([sevenDaysData])
      .attr("class", "line")
      .attr("d", myLine)
      .attr("fill", "none")
      .attr("stroke", "#0059ff");

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(axisLeft(y));

    svg
      .selectAll(".dot")
      .data(sevenDaysData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => {
        const dateWithYear = `${currentYear}-${d.date}`;
        const parsedDate = timeParse("%Y-%m-%d")(dateWithYear);
        return parsedDate ? x(parsedDate) : 0;
      })
      .attr("cy", d => y(d.value))
      .attr("r", 5) // 원의 반지름을 5로 설정
      .attr("fill", "white") // 원 내부를 투명하게
      .attr("stroke", "#0059ff") // 원의 외곽선 색상
      .attr("stroke-width", 2); // 원의 외곽선 두께

    const yAxisGrid = axisLeft(y)
      .tickSize(-innerWidth)
      .tickFormat("")
      .ticks(maxValue);

    svg
      .append("g")
      .attr("class", "y-gridlines")
      .call(yAxisGrid)
      .selectAll(".tick line")
      .attr("stroke", "#e5e5e5");
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-bold">전체</h3>
      <div
        ref={containerRef}
        className="w-[550px] h-[350px] text-base border-solid border border-gray-200 rounded-[10px] px-3 py-4 my-3"
      >
        <svg width="100%" height="100%" ref={ref}></svg>
      </div>
    </div>
  );
};
export default UserActivityGraph;
