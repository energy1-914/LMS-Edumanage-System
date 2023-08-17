import {
  DocumentData,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  DocumentReference,
} from "@firebase/firestore";
import { User } from "@/types/firebase.types";
import { db } from "@/utils/firebase";
import { useQueries, UseQueryResult } from "@tanstack/react-query";

const getNestedComment = async (docId: string) => {
  const commentQuery = query(
    collection(db, "posts"),
    where("parentId", "==", docId),
  );
  const querySnapshot = await getDocs(commentQuery);

  let postComments: DocumentData[] = [];
  for (const doc of querySnapshot.docs) {
    const postData = doc.data();
    let user: User | null = null;

    if (postData.userId instanceof DocumentReference) {
      const userSnapshot = await getDoc(postData.userId);
      if (userSnapshot.exists()) {
        user = userSnapshot.data() as User;
      }
    }
    postComments.push({ id: doc.id, user, ...postData });
  }

  return postComments;
};

export default function useGetNestedComment(docIds: string[]) {
  const commentQueries = useQueries({
    queries: docIds.map(id => ({
      queryKey: ["comment", id],
      queryFn: () => getNestedComment(id),
    })),
  });

  // 모든 유저 댓글 데이터를 하나의 배열로 결합
  const allCommentData = commentQueries
    .filter(query => query.data !== undefined && query.data !== null && query.data.length !== 0)
    .map(query => query.data)
    .concat()[0]
    ?.sort((a,b) => {return a.createdAt.seconds - b.createdAt.seconds})
  const isLoading = commentQueries.some(query => query.isLoading);
  const isError = commentQueries.some(query => query.isError);
  const error = commentQueries.find(query => query.error)?.error;

  return {
    data: allCommentData,
    isLoading,
    isError,
    error,
  } as UseQueryResult<DocumentData[], unknown>;
}
