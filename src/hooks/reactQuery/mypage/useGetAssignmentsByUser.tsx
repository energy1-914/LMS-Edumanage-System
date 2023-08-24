import { useQuery } from "@tanstack/react-query";
import {
  DocumentData,
  QuerySnapshot,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Assignment } from "@/types/firebase.types";

const fetchAssignmentsByUser = async (
  userId: string,
): Promise<{ submitted: DocumentData[]; unsubmitted: Assignment[] }> => {
  // 현재시각이 endDate보다 크다면, unsubmitted 배열 추가하지 않는 로직 추가
  // 현재 시각을 seconds로 가져온다.
  const currentSeconds = Math.floor(Date.now() / 1000);

  // 제출한 과제 목록에서 해당 사용자가 제출한 과제의 ID 목록을 가져온다.
  const userRef = doc(db, "users", userId);
  const submittedQuery = query(
    collection(db, "submittedAssignments"),
    where("userId", "==", userRef),
  );
  const submittedSnapshot = await getDocs(submittedQuery);

  const attachmentQuery = query(
    collection(db, "attachments"),
    where("userId", "==", userRef),
  );
  const querySnapshot = await getDocs(attachmentQuery);

  const submittedIds = submittedSnapshot.docs.map(
    doc => doc.data().assignmentId.id,
  );

  // 모든 과제 목록을 가져온다.
  const assignmentsRef = collection(db, "assignments");
  const assignmentsSnapshot: QuerySnapshot = await getDocs(assignmentsRef);

  // 과제 ID를 이용해서 과제를 제출한 것과 제출하지 않은 것으로 분리한다.
  const submitted: DocumentData[] = [];
  const unsubmitted: Assignment[] = [];

  assignmentsSnapshot.docs.forEach(doc => {
    const assignment = doc.data() as Assignment;
    if (
      !submittedIds.includes(doc.id) &&
      assignment.endDate.seconds > currentSeconds
    ) {
      // endDate가 현재 시간보다 큰 경우만 unsubmitted 배열에 추가
      unsubmitted.push(assignment);
    }
  });

  // endDate의 seconds를 오름차순으로 정렬한다.
  unsubmitted.sort((a, b) => a.endDate.seconds - b.endDate.seconds);

  for (const docData of querySnapshot.docs) {
    const assignmentDoc = docData.data();
    let content = null;
    let submittedData = null;
    let AssignmentData = null;
    // console.log(assignmentDoc);

    if (assignmentDoc.submittedAssignmentId instanceof DocumentReference) {
      const lectureSnapshot = await getDoc(assignmentDoc.submittedAssignmentId);

      if (lectureSnapshot.exists()) {
        submittedData = lectureSnapshot.data();
        if (submittedData.assignmentId instanceof DocumentReference) {
          const lectureSnapshot = await getDoc(submittedData.assignmentId);
          if (lectureSnapshot.exists()) {
            AssignmentData = lectureSnapshot.data();
          }
        }
      }
      content = assignmentDoc.links;

      submitted.push({
        id: docData.id,
        content: content,
        createdAt: submittedData.createdAt,
        submittedData,
        AssignmentData,
        ...assignmentDoc,
      });
    }
  }
  return { submitted, unsubmitted };
};

export const useGetAssignmentsByUser = (userId: string) => {
  return useQuery(["assignments", userId], () =>
    fetchAssignmentsByUser(userId),
  );
};
