"use client";

import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import { useAppSelector } from "@/redux/store";
import { v4 as uuid } from "uuid";

const UserActivityCounters = () => {
  const userId = useAppSelector(state => state.userInfo.id);
  const { filteredAssignments, filteredPosts, comments, progressData } =
    useUserActivityData(userId);
  const items = [
    { text: "총 게시글", count: filteredPosts?.length },
    { text: "댓글", count: comments.length },
    { text: "제출한 과제", count: filteredAssignments?.length },
    { text: "수강 완료 강의", count: progressData?.completedLectures },
  ];
  return (
    <div className="w-full flex flex-col justify-center text-base border-solid border border-gray-200 rounded-[10px] p-4 mb-3 mt-10">
      {items.map(item => (
        <div className="flex justify-between text-lg" key={uuid()}>
          <div>{item.text}:</div>
          <div>{item.count}</div>
        </div>
      ))}
    </div>
  );
};
export default UserActivityCounters;
