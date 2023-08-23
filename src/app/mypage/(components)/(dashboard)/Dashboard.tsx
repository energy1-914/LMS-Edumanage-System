import UserActivityGraph from "./UserActivityGraph";
import SubmittedAssignmentPieRate from "./SubmittedAssignmentPieRate";
import LectureProgressPieRate from "./LectureProgressPieRate";
import UserActivityCounters from "./UserActivityCounters";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-2 gap-y-7 gap-x-3">
      <UserActivityGraph />
      <UserActivityCounters />
      <SubmittedAssignmentPieRate />
      <LectureProgressPieRate />
    </div>
  );
};

export default Dashboard;
