import Reminder from "@/app/mypage/(components)/Reminder";
import Sidebar from "./(components)/Sidebar";
import Profile from "./(components)/Profile";
import Dashboard from "./(components)/(dashboard)/Dashboard";

export default function MyPage() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-[1024px] flex mb-[100px] justify-center">
        <div className="mr-[20px]">
          <Sidebar />
        </div>
        <div className="flex flex-col w-9/12">
          <Profile />
          <Reminder />
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
