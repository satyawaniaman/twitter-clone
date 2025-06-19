import React from "react";
import { AiFillHome } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    icon: <AiFillHome />,
  },
  {
    title: "Explore",
    icon: <BiSearch />,
  },
  {
    title: "Notifications",
    icon: <IoNotificationsOutline />,
  },
  {
    title: "Messages",
    icon: <HiOutlineMail />,
  },
];

function MobileNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2 flex justify-around items-center md:hidden">
      {navigationItems.map((item) => (
        <div
          key={item.title}
          className="flex flex-col items-center p-2"
        >
          <div className="text-2xl">{item.icon}</div>
          <span className="text-xs mt-1">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export default MobileNavigation;