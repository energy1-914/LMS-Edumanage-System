"use client";

import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import SidebarItem from "./SidebarItem";

type SidebarProps = {
  active: string;
  setActive: (value: string) => void;
};
export default function Sidebar({ active, setActive }: SidebarProps) {
  const CATEGORIES = [
    { icon: "👤", category: "대시보드" },
    { icon: "👤", category: "프로필" },
  ];
  return (
    <aside>
      {CATEGORIES.map(item => (
        <SidebarItem
          category={item.category}
          icon={item.icon}
          isActive={item.category === active}
          setActive={setActive}
          key={uuid()}
        />
      ))}
    </aside>
  );
}
