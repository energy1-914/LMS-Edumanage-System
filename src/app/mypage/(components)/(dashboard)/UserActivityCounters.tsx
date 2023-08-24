"use client";

import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import { useAppSelector } from "@/redux/store";

const UserActivityCounters = () => {
  const userId = useAppSelector(state => state.userInfo.id);
  const { filteredAssignments, filteredPosts, comments, progressData } =
    useUserActivityData(userId);

  return (
    <div className="h-[130px] text-base border-solid border border-gray-200 rounded-[10px] px-3 py-4 mb-3 mt-10 cursor-pointer">
      <div>총 게시글 : {filteredPosts?.length}</div>
      <div>댓글 : {comments.length}</div>
      <div>제출한 과제 : {filteredAssignments?.length}</div>
      <div>수강 완료 강의 : {progressData?.completedLectures}</div>
    </div>
  );
};
export default UserActivityCounters;
