"use client";

type SidebarItemProps = {
  icon: string;
  category: string;
  isActive: boolean;
  setActive: (value: string) => void;
};

export default function SidebarItem({
  icon,
  category,
  isActive,
  setActive,
}: SidebarItemProps) {
  const handleClick = () => {
    setActive(category);
  };
  const buttonClass = `w-[245px] h-[46px] rounded-[10px]
    py-[13px] pr-[35px] pl-[20px] mb-2.5
    ${isActive ? "bg-primary-10" : "hover:bg-primary-10"}
    flex items-center `;

  return (
    <button onClick={handleClick} className={buttonClass}>
      <span className="text-xl mr-5">{icon}</span>
      <span className="font-medium text-base">{category}</span>
    </button>
  );
}
