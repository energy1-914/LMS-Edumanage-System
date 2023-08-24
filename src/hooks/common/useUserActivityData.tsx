import useGetMyPosts from "@/hooks/reactQuery/mypage/useGetMyPosts";
import useGetLectureComments from "@/hooks/reactQuery/mypage/useGetLectureComments";
import useGetProgressInfoQuery from "@/hooks/reactQuery/mypage/useGetProgressQuery";
import { useGetAssignmentsByUser } from "@/hooks/reactQuery/mypage/useGetAssignmentsByUser";

export const useUserActivityData = (userId: string) => {
  const { data: assignmentsData } = useGetAssignmentsByUser(userId);

  const {
    data: myPostData,
    isLoading: myPostLoading,
    isError: myPostError,
    error: myPostFetchError,
  } = useGetMyPosts(userId);

  const {
    data: lectureCommentData,
    isLoading: lectureCommentLoading,
    isError: lectureCommentError,
    error: lectureCommentFetchError,
  } = useGetLectureComments(userId);

  // 내가 제출한 과제
  const filteredAssignments = assignmentsData?.submitted.map(assignment => ({
    id: assignment.id,
    title: assignment.AssignmentData?.title,
    content: assignment.content,
    attachmentFiles: assignment.attachmentFiles,
    category: assignment.AssignmentData?.level,
    createdAt: assignment.AssignmentData?.createdAt,
  }));

  // 내가 쓴 글
  const filteredPosts = myPostData
    ?.filter(el => !el.parentId)
    .map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      createdAt: post.createdAt,
    }));

  // 내가 쓴 댓글
  const filteredComments = myPostData
    ?.filter(el => el.parentId && el.parentData?.title)
    .map(comment => ({
      parentId: comment.parentId,
      id: comment.id,
      title: comment.parentData.title,
      content: comment.content,
      category: comment.parentData.category,
      createdAt: comment.createdAt,
    }));

  // 내가 쓴 강의 댓글
  const filteredLectureComments = lectureCommentData
    ?.filter(el => el.parentData)
    .map(comment => ({
      id: comment.id,
      title: comment.parentData.title,
      content: comment.content,
      category: "강의실",
      createdAt: comment.createdAt,
    }));

  const comments = [
    ...(filteredComments || []),
    ...(filteredLectureComments || []),
  ].sort((a, b) => a.createdAt - b.createdAt);

  //강의 수강 정보
  const {
    data: progressData,
    isLoading: progressLoading,
    isError: progressError,
    error: progressFetchError,
  } = useGetProgressInfoQuery(userId);

  return {
    filteredAssignments,
    filteredPosts,
    comments,
    progressData,
    lectureCommentLoading,
    myPostLoading,
    progressLoading,
  };
};
