import React from "react";
import { BsTwitterX, BsBookmark } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { RiFileListLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { CiCircleMore } from "react-icons/ci";
import { CustomButton } from "@/components/CustomButton";
import FeedCard from "@/components/FeedCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSection from "@/components/ProfileSection";
import TweetInput from "@/components/TweetInput";

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}
const sidebarMenuItems: TwitterSidebarButton[] = [
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
  {
    title: "Lists",
    icon: <RiFileListLine />,
  },
  {
    title: "Bookmarks",
    icon: <BsBookmark />,
  },
  {
    title: "Profile",
    icon: <CgProfile />,
  },
  {
    title: "More",
    icon: <CiCircleMore />,
  },
];
export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid grid-cols-10 h-screen w-screen px-4">
        {/* Left sidebar */}
        <div className="col-span-3 pt-1 pl-28 flex flex-col h-full">
          <div className="p-3 text-2xl hover:bg-gray-700/20 rounded-full flex items-center justify-center cursor-pointer transition-colors w-fit">
            <BsTwitterX />
          </div>
          <div className="text-xl font-bold mt-4 flex flex-col flex-grow">
            <ul>
              {sidebarMenuItems.map((item) => (
                <li
                  className="flex items-center gap-4 hover:bg-gray-700/20 rounded-full p-3 w-fit cursor-pointer transition-colors"
                  key={item.title}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 mb-4">
              <CustomButton>Post</CustomButton>
            </div>

            {/* Add margin-top: auto to push the profile section to the bottom */}
            <div className="mt-auto">
              <ProfileSection />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-4 border-x border-gray-800 h-screen overflow-scroll">
          {/* Home header */}
          <div className="sticky top-0 backdrop-blur-md bg-black/70 z-10">
            <h1 className="text-xl font-bold p-4 border-b border-gray-800">
              Home
            </h1>
          </div>

          {/* Tweet input component */}
          <TweetInput />

          {/* Feed content */}
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
        </div>

        {/* Right sidebar */}
        <div className="col-span-3"></div>
      </div>
    </ProtectedRoute>
  );
}
