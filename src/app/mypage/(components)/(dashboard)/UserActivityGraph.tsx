"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import informationIcon from "public/images/information.png";
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
  area,
  pointer,
  utcParse,
} from "d3";
import { curveMonotoneX } from "d3-shape";
import { bisector } from "d3-array";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import { useAppSelector } from "@/redux/store";
import InformationTooltip from "./InformationTooltip";

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
  // 정보 아이콘 툴팁
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleIconMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    setShowTooltip(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 30,
    });
  };

  const handleIconMouseLeave = () => {
    setShowTooltip(false);
  };
  useEffect(() => {
    const svg = select(ref.current);
    const width = containerRef.current?.offsetWidth;
    const height = containerRef.current?.offsetHeight;
    const margin = { top: 25, right: 10, bottom: 0, left: 60 };
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

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll("text").attr("font-size", "13px");

    const yAxis = axisLeft(y)
      .tickSize(0) // y축 눈금의 길이를 0으로 설정
      .ticks(5)
      .tickPadding(10) // 원하는 눈금 갯수 설정
      .tickFormat(d => `${d}`);

    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

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
      .attr("stroke", "#d4d2d2");

    svg.selectAll(".domain").style("stroke", "none");

    const getDateXCoordinate = (dateString: string) => {
      const dateWithYear = `${currentYear}-${dateString}`;
      const parsedDate = timeParse("%Y-%m-%d")(dateWithYear);
      return parsedDate ? x(parsedDate) : 0;
    };

    const myLine = line<Datum>() // 곡선 생성
      .x(d => getDateXCoordinate(d.date))
      .y(d => y(d.value))
      .curve(curveMonotoneX);

    const tooltip = select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "5px")
      .style("border", "1.5px solid #0059ff")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("font-size", "0.8rem")
      .style("color", "#555");

    const defs = svg.append("defs");

    const areaPath = area<Datum>()
      .x(d => getDateXCoordinate(d.date))
      .y0(innerHeight) // 아랫부분의 시작점 (x축 바닥)
      .y1(d => y(d.value))
      .curve(curveMonotoneX);

    const gradient = defs
      .append("linearGradient")
      .attr("id", "activityGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0059ff")
      .attr("stop-opacity", 0.2);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0059ff")
      .attr("stop-opacity", 0);

    //그라데이션
    svg
      .append("path")
      .data([sevenDaysData])
      .attr("d", areaPath)
      .attr("fill", "url(#activityGradient)")
      .attr("transform", `translate(${margin.left},0)`)
      .style("pointer-events", "none");

    //선그리기
    svg
      .append("path")
      .data([sevenDaysData])
      .attr("class", "line")
      .attr("d", myLine)
      .attr("fill", "none")
      .attr("stroke", "#0059ff")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("stroke-width", 2.5);

    //원그리기
    const dots = svg
      .selectAll(".dot")
      .data(sevenDaysData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("cx", d => getDateXCoordinate(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#0059ff")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    const handleMouseOver = (_: any, d: Datum) => {
      const i = sevenDaysData.findIndex(
        item => item.date === d.date && item.value === d.value,
      );
      tooltip.transition().duration(200).style("opacity", 1);
      select(dots.nodes()[i]).attr("r", 8);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
      const [mouseX] = pointer(event);
      const parsedUtcDate = utcParse("%Y-%m-%d");
      const bisectDate = bisector(
        (d: Datum) => parsedUtcDate(`${currentYear}-${d.date}`)!,
      ).left;
      const x0 = x.invert(mouseX - margin.left); // 마우스의 위치를 도메인 값으로 변환
      const i = bisectDate(sevenDaysData, x0, 1);
      const d0 = sevenDaysData[i - 1];
      const d1 = sevenDaysData[i];
      const d0Date = timeParse("%m-%d")(d0.date);
      const d1Date = d1 ? timeParse("%m-%d")(d1.date) : null;
      let d: Datum;
      if (d0Date && d1Date) {
        d =
          x0.getTime() - d0Date.getTime() > d1Date.getTime() - x0.getTime()
            ? d1
            : d0;
      } else {
        d = d0;
      }

      tooltip
        .html(`활동지수: ${d.value}개`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);

      select(event.currentTarget)
        .selectAll(".dot-range")
        .attr("r", (dotData: any) => {
          const data = dotData as Datum;
          return data.date === d.date ? 8 : 5;
        });
    };

    const handleMouseOut = (event: React.MouseEvent, d: Datum) => {
      const i = sevenDaysData.findIndex(
        item => item.date === d.date && item.value === d.value,
      );
      select(dots.nodes()[i]).attr("r", 5);

      tooltip.transition().duration(500).style("opacity", 0);
    };

    //툴팁
    svg
      .selectAll(".dot-range")
      .data(sevenDaysData)
      .enter()
      .append("circle")
      .attr("class", "dot-range")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("cx", d => getDateXCoordinate(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 90)
      .attr("opacity", 0)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);

    return () => {
      tooltip.transition().duration(500).style("opacity", 0);
    };
  }, [sevenDaysData]);

  return (
    <div>
      <h3 className="text-lg font-bold">전체</h3>
      <div
        ref={containerRef}
        className="flex flex-col gap-2 w-[550px] text-base border-solid border border-gray-200 rounded-[10px] px-3 py-4 my-3"
      >
        <Image
          src={informationIcon}
          alt="information icon"
          className="self-end w-4 h-4"
          onMouseEnter={handleIconMouseEnter}
          onMouseLeave={handleIconMouseLeave}
        />
        <InformationTooltip
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          handleIconMouseLeave={handleIconMouseLeave}
          position={tooltipPos}
        />
        <svg width="90%" height="90%" viewBox="0 0 580 350" ref={ref}></svg>
      </div>
    </div>
  );
};
export default UserActivityGraph;
