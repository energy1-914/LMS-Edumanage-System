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
  const { lectureCommentLoading, myPostLoading, progressLoading } =
    useUserActivityData(userId);

  if (lectureCommentLoading || myPostLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-y-7 gap-x-3">
        <UserActivityGraph />
        <UserActivityCounters />
        <PieCharts />
      </div>
      <UserActivityList />
    </>
  );
};

export default Dashboard;
