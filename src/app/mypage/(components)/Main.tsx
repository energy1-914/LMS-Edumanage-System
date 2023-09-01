"use client";

import React, { useState } from "react";
import Dashboard from "./(dashboard)/Dashboard";
import Profile from "./Profile";
import Sidebar from "./(sidebar)/Sidebar";

export default function Main() {
  const [active, setActive] = useState("대시보드");
  return (
    <div className="w-[1024px] flex mb-[100px] justify-center">
      <div className="mr-[20px]">
        <Sidebar active={active} setActive={setActive} />
      </div>
      <div className="flex flex-col w-9/12 gap-4">
        {active === "대시보드" ? <Dashboard /> : <Profile />}
      </div>
    </div>
  );
}
