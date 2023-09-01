"use client";

import React, { useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Category from "../Category";
import AssignmentsDetailModal from "./AssignmentsDetailModal";
import PostDetailModal from "./PostDetailModal";
import CommentsDetailModal from "./CommentsDetailModal";
import { useUserActivityData } from "@/hooks/common/useUserActivityData";
import { useAppSelector } from "@/redux/store";

export default function UserActivityList() {
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isAssignmentsDetailModalOpen, setIsAssignmentsDetailModalOpen] =
    useState(false);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [isCommentsDetailModalOpen, setIsCommentsDetailModalOpen] =
    useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState("");

  const handleAssignmentsModalClick = () => {
    setIsAssignmentsModalOpen(!isAssignmentsModalOpen);
  };
  const handlePostModalClick = () => {
    setIsPostModalOpen(!isPostModalOpen);
  };
  const handleCommentsModalClick = () => {
    setIsCommentsModalOpen(!isCommentsModalOpen);
  };
  const handleAssignmentsDetailModalClick = (id: string) => {
    setIsAssignmentsModalOpen(!isAssignmentsModalOpen);
    setIsAssignmentsDetailModalOpen(true);
    setSelectedId(() => id);
  };
  const handlePostDetailModalClick = (id: string) => {
    setIsPostModalOpen(!isPostModalOpen);
    setIsPostDetailModalOpen(true);
    setSelectedId(() => id);
  };
  const handleCommentsDetailModalClick = (id: string) => {
    setIsCommentsModalOpen(!isCommentsModalOpen);
    setIsCommentsDetailModalOpen(true);
    setSelectedCommentId(() => id);
  };
  const userId = useAppSelector(state => state.userInfo.id);
  const { filteredAssignments, filteredPosts, comments } =
    useUserActivityData(userId);

  return (
    <>
      <div className="flex gap-x-4 mt-12">
        <Category
          title="제출한 과제"
          targetData={filteredAssignments}
          handleClick={handleAssignmentsModalClick}
        />
        {isAssignmentsModalOpen && (
          <ModalWrapper
            onCloseModal={() =>
              setIsAssignmentsModalOpen(!isAssignmentsModalOpen)
            }
            modalTitle="제출한 과제"
            children={
              <Category
                title=""
                targetData={filteredAssignments}
                handleClick={handleAssignmentsModalClick}
                handleDetailModalClick={handleAssignmentsDetailModalClick}
                width="w-full"
              />
            }
          />
        )}
        <Category
          title="나의 게시글"
          targetData={filteredPosts}
          handleClick={handlePostModalClick}
        />
        {isPostModalOpen && (
          <ModalWrapper
            onCloseModal={() => setIsPostModalOpen(!isPostModalOpen)}
            modalTitle="나의 게시글"
            children={
              <Category
                title=""
                targetData={filteredPosts}
                handleClick={handlePostModalClick}
                handleDetailModalClick={handlePostDetailModalClick}
                width="w-full"
              />
            }
          />
        )}
        <Category
          title="나의 댓글"
          targetData={comments}
          handleClick={handleCommentsModalClick}
        />
        {isCommentsModalOpen && (
          <ModalWrapper
            onCloseModal={() => setIsCommentsModalOpen(!isCommentsModalOpen)}
            modalTitle="나의 댓글"
            children={
              <Category
                title=""
                targetData={comments}
                handleClick={handleCommentsModalClick}
                handleDetailModalClick={handleCommentsDetailModalClick}
                width="w-full"
              />
            }
          />
        )}
        {isAssignmentsDetailModalOpen && (
          <ModalWrapper
            onCloseModal={() => {
              setIsAssignmentsDetailModalOpen(!isAssignmentsDetailModalOpen);
              setSelectedId("");
            }}
            modalTitle="제출한 과제"
            children={
              filteredAssignments && (
                <AssignmentsDetailModal
                  id={selectedId}
                  filteredAssignments={filteredAssignments}
                />
              )
            }
          />
        )}
        {isPostDetailModalOpen && (
          <ModalWrapper
            onCloseModal={() => {
              setIsPostDetailModalOpen(!isPostDetailModalOpen);
              setSelectedId("");
            }}
            modalTitle="나의 게시글"
            children={<PostDetailModal id={selectedId} />}
          />
        )}
        {isCommentsDetailModalOpen && (
          <ModalWrapper
            onCloseModal={() => {
              setIsCommentsDetailModalOpen(!isCommentsDetailModalOpen);
              setSelectedCommentId("");
            }}
            modalTitle="나의 댓글"
            children={
              <CommentsDetailModal id={selectedCommentId} comments={comments} />
            }
          />
        )}
      </div>
    </>
  );
}
