import { doc, deleteDoc } from "@firebase/firestore";
import { db } from "@/utils/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
interface deleteCommentProps {
  commentId: string;
}

const deleteComment = async ({ commentId }: deleteCommentProps) => {
  let commentRef;
  commentRef = doc(db, "posts", commentId);
  await deleteDoc(commentRef);
};
const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { mutate, error } = useMutation<void, Error, deleteCommentProps>(
    deleteComment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comment"]);
        queryClient.invalidateQueries(["commentCount"]);
      },
    },
  );
  return { mutate, error };
};
export default useDeleteComment;
