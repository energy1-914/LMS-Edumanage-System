import { Post, User } from "@/types/firebase.types";
import { useEffect } from "react";
import {
  getDoc,
  getDocs,
  collection,
  DocumentReference,
  orderBy,
  where,
  QueryDocumentSnapshot,
  startAfter,
  limit,
  query as fireStoreQuery,
  onSnapshot,
} from "@firebase/firestore";
import { db } from "@/utils/firebase";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

// 가져올 문서의 개수
const PAGE_SIZE = 8;

interface GetPostsResult {
  posts: Post[];
  next: QueryDocumentSnapshot;
}

const getSelectedPost = async (
  category: string,
  startAt: any = null,
): Promise<GetPostsResult> => {
  // limit 메서드를 활용해서 문서의 개수를 한 번에 몇 개 가져올 것인지 설정.
  let query = category
    ? fireStoreQuery(
        collection(db, "posts"),
        where("category", "==", category),
        orderBy("updatedAt", "desc"),
        limit(PAGE_SIZE),
      )
    : fireStoreQuery(
        collection(db, "posts"),
        where("parentId", "==", ""),
        orderBy("updatedAt", "desc"),
        limit(PAGE_SIZE),
      );

  if (startAt) {
    // 마지막 문서 이후에 값을 가져온다.
    query = fireStoreQuery(query, startAfter(startAt));
  }

  const querySnapshot = await getDocs(query);

  // 다음페이지를 위한 정보와 현재 페이지에 대한 게시물 정보를 모두 리턴한다.
  // next는 다음 페이지를 로드하기 위한 시점(즉, 현재 페이지의 마지막 게시물)이다.
  return {
    posts: await Promise.all(
      querySnapshot.docs.map(async doc => {
        const postData = doc.data();
        let user: User | null = null;

        if (postData.userId instanceof DocumentReference) {
          const userSnapshot = await getDoc(postData.userId);
          if (userSnapshot.exists()) {
            user = userSnapshot.data() as User;
          }
        }

        return { id: doc.id, user, ...postData } as Post;
      }),
    ),
    next: querySnapshot.docs[querySnapshot.docs.length - 1],
  };
};

export default function useGetSelectedCategory(category: string) {
  const queryClient = useQueryClient();
  const queryKey = ["posts", category];

  useEffect(() => {
    let query = category
      ? fireStoreQuery(
          collection(db, "posts"),
          where("category", "==", category),
          orderBy("updatedAt", "desc"),
          limit(PAGE_SIZE),
        )
      : fireStoreQuery(
          collection(db, "posts"),
          where("parentId", "==", ""),
          orderBy("updatedAt", "desc"),
          limit(PAGE_SIZE),
        );

    const unsubscribe = onSnapshot(query, async snapshot => {
      const updatedPosts = await Promise.all(
        snapshot.docs.map(async doc => {
          const postData = doc.data();
          let user: User | null = null;

          if (postData.userId instanceof DocumentReference) {
            const userSnapshot = await getDoc(postData.userId);
            if (userSnapshot.exists()) {
              user = userSnapshot.data() as User;
            }
          }

          return { id: doc.id, user, ...postData } as Post;
        }),
      );

      queryClient.setQueryData(queryKey, {
        pages: [
          {
            posts: updatedPosts,
            next: snapshot.docs[snapshot.docs.length - 1],
          },
        ],
        pageParams: [null],
      });
    });

    return () => unsubscribe();
  }, [queryClient]);

  return useInfiniteQuery<GetPostsResult, Error>(
    queryKey,
    async ({ pageParam = null }) => await getSelectedPost(category, pageParam),
    {
      getNextPageParam: lastPage => lastPage.next,
    },
  );
}
