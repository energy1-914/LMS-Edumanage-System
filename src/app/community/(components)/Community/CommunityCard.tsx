"use client";

import React, { useState } from "react";
import Image from "next/image";
import ModalWrapper from "@/components/ModalWrapper";
import useDeletePost from "@/hooks/reactQuery/community/useDeletePost";
import { useFetchThumbnail } from "@/hooks/reactQuery/community/useFetchThumbnail";
import { useCommentCount } from "@/hooks/reactQuery/comment/useCommentCount";
import { choicePost } from "@redux/postSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { auth } from "@/utils/firebase";
import deleteStorageImages from "@/utils/deleteStorageImages";
import { Avatar } from "sfac-designkit-react";
import timestampToDate from "@/utils/timestampToDate";
import { ToastProps } from "sfac-designkit-react/dist/Toast";
import useGetSelectedPost from "@/hooks/reactQuery/community/useGetSelectedPost";

interface CommunityCardProps {
  id: string;
  onToast: (toastProps: ToastProps) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ id, onToast }) => {
  const userId = useAppSelector(state => state.userInfo.id);
  const currentUserId = auth.currentUser?.uid;
  const isAuthor = userId === currentUserId;
  const dispatch = useAppDispatch();
  const {
    data: postData,
    isLoading: postLoading,
    isError: postError,
    error: postFetchError,
  } = useGetSelectedPost(id);

  const handleChoicePost = () => {
    dispatch(choicePost({ postId: id, type: "detail" }));
  };
  const { data: thumbnailImageUrl } = useFetchThumbnail(
    postData?.thumbnailImages,
  );

  // 댓글의 개수
  const { data: commentCount } = useCommentCount(id);

  // 게시글에서 삭제 버튼 클릭 시
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleDeleteButton = () => {
    setIsDeleteModalOpen(true);
  };

  // 모달창에서 삭제 버튼 클릭 시 로직
  const deleteMutation = useDeletePost();
  const handleDeletePost = () => {
    // 삭제하기 위해서 배열에 이미지, 썸네일을 같이 담는다.
    const pathsToDelete = [
      ...(postData?.postImages || []),
      ...(postData?.thumbnailImages || []),
    ];

    // 함수 호출해서 이미지 삭제
    deleteStorageImages(pathsToDelete);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        onToast({
          type: "Success",
          text: "게시물이 삭제되었습니다!",
          textSize: "base",
        });
      },
    });
    setIsDeleteModalOpen(false);
  };

  //수정하기 함수
  const handleUpdateButton = () => {
    dispatch(choicePost({ postId: id, type: "update" }));
  };
  const postImageLength = postData?.postImages?.length || 0;
  return (
    <div className="flex flex-col h-[240px] rounded-[4px] border-[1px] border-grayscale-5 p-[20px] mb-[10px] z-1">
      <div className="w-full flex justify-between items-center mb-[10px]">
        <div className="flex justify-between items-center">
          <Avatar
            src={postData?.user?.profileImage ?? "/images/avatar.svg"}
            alt="프로필"
            size={34}
            ring={false}
            className="rounded-[50%] object-cover object-center h-[34px] mr-2"
          />
          <span className="text-xs text-primary-80 font-bold">
            {postData?.category === "익명피드백"
              ? "익명"
              : postData?.user?.username}
          </span>
          <span className="text-xs text-grayscale-60 font-medium mx-1">
            • {postData?.user?.role} •
          </span>
          <span className="text-xs text-grayscale-60 font-medium">
            {postData &&
              (postData.createdAt.seconds === postData?.updatedAt.seconds
                ? timestampToDate(postData.createdAt).replaceAll(".", "/")
                : `${timestampToDate(postData.updatedAt).replaceAll(
                    ".",
                    "/",
                  )} 수정`)}
          </span>
        </div>
        {isAuthor && (
          <div className="text-xs text-grayscale-100 font-normal">
            <button onClick={handleUpdateButton}>수정</button>
            <span className="text-grayscale-30"> | </span>
            <button onClick={handleDeleteButton}>삭제</button>
            {isDeleteModalOpen && (
              <ModalWrapper
                width="500px"
                isCloseButtonVisible={false}
                onCloseModal={() => setIsDeleteModalOpen(false)}
              >
                <div className="text-center flex flex-col justify-center h-[120px]">
                  <h2 className="text-xl font-bold mb-[10px]">
                    게시글을 삭제하시겠습니까?
                  </h2>
                  <div>
                    <button
                      className="bg-grayscale-5 text-grayscale-60 font-bold text-sm px-[46px] py-[6px] rounded-[7px] mr-[8px]"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      취소
                    </button>
                    <button
                      className="bg-red text-white font-bold text-sm px-[46px] py-[6px] rounded-[7px]"
                      onClick={handleDeletePost}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </ModalWrapper>
            )}
          </div>
        )}
      </div>

      <button className="flex flex-col" onClick={handleChoicePost}>
        <div className="mb-[10px] flex w-full h-[135px]">
          <div className="flex flex-col items-start w-full">
            <h3 className="text-base font-bold mb-[10px]">{postData?.title}</h3>
            <div className="text-sm font-normal text-grayscale-60 mb-[10px] text-left line-clamp-3">
              {postData?.content.split("\n").map((text, index) => (
                <p key={index}>
                  {text}
                  <br />
                </p>
              ))}
            </div>
            <div>
              <div>
                {postData?.tags?.map(tag => (
                  <span
                    key={tag}
                    className="
                    bg-grayscale-5
                    text-grayscale-60
                    text-[10px] font-medium py-[4px] px-[10px] mr-2 rounded-[4px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {thumbnailImageUrl && (
            <div className="relative w-[119px] h-[119px] flex-shrink-0">
              <Image
                src={thumbnailImageUrl}
                alt="썸네일"
                width={100}
                height={100}
                className="rounded-[10px] object-cover object-center w-[120px] h-[120px]"
                priority
              />
              {postImageLength > 1 && (
                <span
                  className="
                rounded-[50px] bg-primary-5 text-primary-60
                text-[10px] font-bold px-[5px] absolute top-[10px] right-[0px]
                "
                >
                  + {postImageLength - 1}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-normal text-grayscale-60 text-left">
          댓글 {commentCount}개
        </span>
      </button>
    </div>
  );
};

export default CommunityCard;
