"use client";

import UserActivityGraph from "./UserActivityGraph";
import SubmittedAssignmentPieRate from "./SubmittedAssignmentPieRate";
import LectureProgressPieRate from "./LectureProgressPieRate";
import UserActivityCounters from "./UserActivityCounters";
import UserActivityList from "./UserActivityList";
import { useAppSelector } from "@/redux/store";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

const Dashboard = () => {
  const userId = useAppSelector(state => state.userInfo.id);
  const {
    lectureCommentLoading,
    myPostLoading,
    assignmentLoading,
    progressLoading,
  } = useUserActivityData(userId);

  if (
    lectureCommentLoading ||
    myPostLoading ||
    assignmentLoading ||
    progressLoading
  ) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-y-7 gap-x-3">
        <UserActivityGraph />
        <UserActivityCounters />
        <SubmittedAssignmentPieRate />
        <LectureProgressPieRate />
      </div>
      <UserActivityList />
    </>
  );
};

export default Dashboard;
