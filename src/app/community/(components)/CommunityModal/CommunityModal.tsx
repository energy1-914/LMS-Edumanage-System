"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import 화살표 from "/public/images/화살표.svg";
import CommentInput from "./CommentInput";
import ImageModal from "./ImageModal";
import PostCard from "./PostCard";
import CommentCard from "./CommentCard";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import useGetUserQuery from "@/hooks/reactQuery/navbar/useGetUserQuery";
import useGetComment from "@/hooks/reactQuery/comment/useGetComment";
import useGetSelectedPost from "@/hooks/reactQuery/community/useGetSelectedPost";
import useGetPostImage from "@/hooks/reactQuery/community/useGetPostImage";
import useGetNestedComment from "@/hooks/reactQuery/comment/useGetNestedComment";
import { useAppSelector } from "@/redux/store";
import { DocumentData } from "@firebase/firestore";

interface NestedId {
  parentId: string | undefined;
  tagId: string | undefined;
}

export default function CommunityModal() {
  const postId = useAppSelector(state => state.postInfo.postId);
  const userId = useAppSelector(state => state.userInfo.id);

  // 이미지 모달
  const [isImageModalOn, setIsImageModalOn] = useState(false);
  const [SelectedImg, setSelectedImg] = useState<string | undefined>(undefined);
  const [updateId, setUpdateId] = useState<DocumentData | undefined>(undefined);
  const [nestedId, setNestedId] = useState<NestedId | undefined>(undefined);
  const [commentIds, setCommentIds] = useState<string[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);

  const handleModalOn = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedImg(e.currentTarget.value);
    setIsImageModalOn(prev => !prev);
  };

  const handleUpdateId = (updateId: DocumentData | undefined) => {
    setUpdateId(updateId);
  };

  const handleNestedId = (nestedId: NestedId | undefined) => {
    setNestedId(nestedId);
  };

  // 글 정보
  const {
    data: postData,
    isLoading: postLoading,
    isError: postError,
    error: postFetchError,
  } = useGetSelectedPost(postId);

  // 유저 정보
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userFetchError,
  } = useGetUserQuery(userId);

  // 유저 댓글
  const {
    data: commentData,
    isLoading: commentLoading,
    isError: commentError,
    error: commentFetchError,
  } = useGetComment(postId);

  useEffect(() => {
    if (postData?.thumbnailImages) {
      setImageIds(postData.thumbnailImages);
    }
  }, [postData]);

  useEffect(() => {
    if (commentData) {
      const ids = commentData.map(x => x.id);
      setCommentIds(ids);
    }
  }, [commentData]);

  // 유저 대댓글
  const {
    data: nestedCommentData,
    isLoading: nestedCommentLoading,
    isError: nestedError,
    error: nestedFetchError,
  } = useGetNestedComment(commentIds);

  // 글 이미지
  const {
    data: imageData,
    isLoading: imageLoading,
    isError: imageError,
    error: imageFetchError,
  } = useGetPostImage(imageIds);

  if (
    postLoading ||
    nestedCommentLoading ||
    userLoading ||
    commentLoading ||
    imageLoading
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="z-50">
      <PostCard
        key={postId}
        postData={postData}
        imageData={imageData}
        handleModalOn={handleModalOn}
      />
      {commentData?.map((comment, idx) => (
        <div key={idx}>
          <CommentCard
            comment={comment}
            commentData={comment}
            postId={postId}
            userId={userId}
            handleUpdateId={handleUpdateId}
            handleNestedId={handleNestedId}
          />
          {nestedCommentData
            ?.filter((el, idx) => comment.id === el.parentId)
            .map((nestedComment, idx) => (
              <div className="flex" key={idx}>
                <Image
                  src={화살표}
                  alt="대댓글 화살표"
                  className="ml-2 mr-[5px]"
                ></Image>
                <CommentCard
                  comment={nestedComment}
                  commentData={comment}
                  userId={userId}
                  handleUpdateId={handleUpdateId}
                  handleNestedId={handleNestedId}
                />
              </div>
            ))}
        </div>
      ))}
      <CommentInput
        postData={postData}
        userData={userData}
        postId={postId}
        updateId={updateId}
        nestedId={nestedId}
        handleUpdateId={handleUpdateId}
        handleNestedId={handleNestedId}
      />
      {isImageModalOn && SelectedImg && (
        <ImageModal handleModalOn={handleModalOn} props={SelectedImg} />
      )}
    </div>
  );
}
