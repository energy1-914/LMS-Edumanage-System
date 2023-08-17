import { getFirestore, doc, deleteDoc, DocumentData } from "firebase/firestore";
import { getComment } from "../comment/useComment";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

const deletePostFromFirebase = async (postId: string): Promise<void> => {
  const db = getFirestore();
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);

  const comments = await getComment(postId);

  const deleteCommentsPromises = comments.map(async (comment: DocumentData) => {
    const commentRef = doc(db, "posts", comment.id);
    return deleteDoc(commentRef);
  });

  await Promise.all(deleteCommentsPromises);
};

const useDeletePost = (options: any): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation(deletePostFromFirebase, {
    onSuccess: () => {
      options.onSuccess();
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error: Error) => {
      alert("에러가 발생했습니다!");
    },
  });
};

export default useDeletePost;
