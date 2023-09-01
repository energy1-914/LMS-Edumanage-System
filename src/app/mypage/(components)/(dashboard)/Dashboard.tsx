"use client";

import UserActivityGraph from "./UserActivityGraph";
import UserActivityCounters from "./UserActivityCounters";
import UserActivityList from "./UserActivityList";
import { useAppSelector } from "@/redux/store";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import PieCharts from "./PieCharts";

const Dashboard = () => {
  const userId = useAppSelector(state => state.userInfo.id);
  const {
    assignmentsLoading,
    lectureCommentLoading,
    myPostLoading,
    progressLoading,
  } = useUserActivityData(userId);

  if (
    assignmentsLoading ||
    lectureCommentLoading ||
    myPostLoading ||
    progressLoading
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3">
        <UserActivityGraph />
        <UserActivityCounters />
      </div>
      <PieCharts />
      <UserActivityList />
    </div>
  );
};

export default Dashboard;
