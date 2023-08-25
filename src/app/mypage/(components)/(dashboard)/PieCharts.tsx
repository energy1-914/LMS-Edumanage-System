"use client";

import PieChart from "@/components/PieChart/PieChart";
import React from "react";
import { useAppSelector } from "@/redux/store";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";

const PieCharts = () => {
  const userId = useAppSelector(state => state.userInfo.id);
  const { progressData, assignmentsData } = useUserActivityData(userId);
  const unsubmittedCount = assignmentsData?.unsubmitted.length || 1;
  const submittedCount = assignmentsData?.submitted.length || 0;

  return (
    <>
      <PieChart
        compeletedTasks={submittedCount}
        totalTasks={unsubmittedCount + submittedCount}
        title="과제제출률"
        subtitle="과제제출률"
        hoverText="제출"
      />
      <PieChart
        compeletedTasks={progressData?.completedLectures || 0}
        totalTasks={progressData?.total || 1}
        title="강의 수강률"
        subtitle="수강률"
        hoverText="완료"
      />
    </>
  );
};
export default PieCharts;
