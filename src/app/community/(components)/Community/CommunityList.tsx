"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import CommunityCard from "./CommunityCard";
import Aside from "./Aside/Aside";
import { useToast } from "@/hooks/common/useToast";
import useGetSelectedCategory from "@/hooks/reactQuery/community/useGetSelectedCategory";
import { Toast } from "sfac-designkit-react";

const CommunityList = () => {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { toastProps, setToastProps } = useToast();

  // 게시물 리스트
  const {
    data: postList,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    error,
  } = useGetSelectedCategory(activeCategory);

  // Dom에 접근하기 위해 사용
  const loadMoreButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 로딩 중이거나 더 이상 로드할 페이지가 없는 경우에는 함수 종료
    if (isLoading || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        // 첫 번째 요소가 뷰포트와 교차하는지 확인한다.
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      // 대상 요소 50%가 뷰포트와 교차했을 때 콜백 함수를 호출.
      { threshold: 0.5 },
    );

    const el = loadMoreButtonRef && loadMoreButtonRef.current;
    if (!el) return;
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [isLoading, hasNextPage, fetchNextPage]);

  return (
    <div className="flex w-[1024px]">
      <Aside onCategorySelect={setActiveCategory} />
      <div className="flex flex-col flex-1 min-h-[400px]">
        {postList?.pages?.flatMap(page => page.posts)?.length !== 0 ? (
          postList?.pages
            ?.flatMap(page => page.posts)
            ?.map(data => (
              <CommunityCard
                key={data.id}
                data={data}
                onToast={setToastProps}
              />
            ))
        ) : (
          <div className="mx-[auto] my-[50px] flex-1">
            <Image
              src="/images/noPostingMessage.svg"
              width={573}
              height={199}
              alt="게시글이 존재하지 않습니다."
              priority
            />
          </div>
        )}
        <div ref={loadMoreButtonRef} className="opacity-0">
          Load more
        </div>
      </div>
      {toastProps && (
        <div className="absolute bottom-[35%] right-[10%]">
          <Toast {...toastProps} />
        </div>
      )}
    </div>
  );
};

export default CommunityList;
