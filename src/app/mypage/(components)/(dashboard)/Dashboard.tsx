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
    <>
      <div className="flex gap-y-7 gap-x-3">
        <UserActivityGraph />
        <UserActivityCounters />
      </div>
      <PieCharts />
      <UserActivityList />
    </>
  );
};

export default Dashboard;
