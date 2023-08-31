"use client";

import React, { useEffect, useMemo, useRef } from "react";
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
import { curveMonotoneX } from "d3-shape";
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
        (timeParse("%m-%d")(a.date)?.getTime() || 0) -
        (timeParse("%m-%d")(b.date)?.getTime() || 0),
    );
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const sevenDaysData = useMemo(() => {
    const result = [];
    let tempDate = new Date(startDate);

    while (tempDate <= endDate) {
      const dateString = `${String(tempDate.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(tempDate.getDate()).padStart(2, "0")}`;
      const found = data.find(d => `${d.date}` === dateString);
      result.push({
        date: dateString,
        value: found ? found.value : 0,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return result;
  }, [data]);

  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = select(ref.current);
    const width = containerRef.current?.offsetWidth;
    const height = containerRef.current?.offsetHeight;
    const margin = { top: 25, right: 10, bottom: 0, left: 20 };
    const innerWidth = width ? width - margin.left - margin.right : 0;
    const innerHeight = height ? height - margin.top - margin.bottom : 0;
    const x = scaleTime().range([0, innerWidth]);
    const y = scaleLinear().range([innerHeight, 0]);

    const maxValue = max(data, d => d.value) || 0;

    const currentYear = new Date().getFullYear();

    x.domain([startDate, endDate]);
    y.domain([0, maxValue * 1.1]);

    const xAxis = axisBottom(x) // x축 생성
      .tickSize(0)
      .ticks(8) // 눈금 갯수
      .tickFormat((domainValue): string => {
        if (domainValue instanceof Date) {
          return timeFormat("%m월 %d일")(domainValue);
        }
        return String(domainValue);
      })
      .tickPadding(10);

    const yAxis = axisLeft(y)
      .tickSize(0) // y축 눈금의 길이를 0으로 설정
      .ticks(5)
      .tickPadding(10) // 원하는 눈금 갯수 설정
      .tickFormat(d => `${d}`);
      
    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    yAxisGroup.select(".domain").remove();
    yAxisGroup.selectAll("text").attr("font-size", "15px");

    const yAxisGrid = axisLeft(y) // y축 그리드 생성
      .tickSize(-innerWidth)
      .tickFormat(() => "")
      .ticks(5);

    svg
      .append("g")
      .attr("class", "y-gridlines")
      .call(yAxisGrid)
      .attr("transform", `translate(${margin.left},0)`)
      .selectAll(".tick line")
      .attr("stroke", "#e5e5e5");

    const getDateXCoordinate = (dateString: string) => {
      const dateWithYear = `${currentYear}-${dateString}`;
      const parsedDate = timeParse("%Y-%m-%d")(dateWithYear);
      return parsedDate ? x(parsedDate) : 0;
    };

    const myLine = line<Datum>() // 곡선 생성
      .x(d => getDateXCoordinate(d.date))
      .y(d => y(d.value))
      .curve(curveMonotoneX);

    svg
      .append("path")
      .data([sevenDaysData])
      .attr("class", "line")
      .attr("d", myLine)
      .attr("fill", "none")
      .attr("stroke", "#0059ff")
      .attr("transform", `translate(${margin.left},0)`);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll("text").attr("font-size", "13px");

    svg
      .selectAll(".dot")
      .data(sevenDaysData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("cx", d => getDateXCoordinate(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 5) 
      .attr("fill", "white") 
      .attr("stroke", "#0059ff")
      .attr("stroke-width", 2);
  }, [sevenDaysData]);

  return (
    <div>
      <h3 className="text-lg font-bold">전체</h3>
      <div
        ref={containerRef}
        className="w-[600px] h-[350px] text-base border-solid border border-gray-200 rounded-[10px] px-3 py-4 my-3"
      >
        <svg width="90%" height="90%" viewBox="0 0 600 350" ref={ref}></svg>
      </div>
    </div>
  );
};
export default UserActivityGraph;
