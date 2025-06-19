import React from "react";
import { AiFillHome } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { BsBookmark, BsTwitterX } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { CiCircleMore } from "react-icons/ci";
import { HiOutlineMail } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { RiFileListLine } from "react-icons/ri";
import { CustomButton } from "./CustomButton";
import ProfileSection from "./ProfileSection";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}
function Sidebar() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const getUsernameFromUser = () => {
    // Use the actual username from the database profile if available
    if (userProfile?.username) {
      return userProfile.username;
    }
    // Fallback to email-based username if profile not loaded yet
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "user";
  };

  const sidebarMenuItems: TwitterSidebarButton[] = [
    {
      title: "Home",
      icon: <AiFillHome />,
      href: "/pages/home",
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
      onClick: () => {
        window.open("https://x.com/satyawani_aman", "_blank", "noopener,noreferrer");
      },
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
      onClick: () => {
        if (user) {
          const username = getUsernameFromUser();
          router.push(`/pages/profile/${username}`);
        }
      },
    },
    {
      title: "More",
      icon: <CiCircleMore />,
    },
  ];

  const handleItemClick = (item: TwitterSidebarButton) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="h-full flex flex-col md:pl-1 lg:pl-4 xl:pl-8  pt-1">
      <div
        className="p-3 text-2xl hover:bg-gray-700/20 rounded-full flex items-center justify-center cursor-pointer transition-colors w-fit"
        onClick={() => router.push("/pages/home")}
      >
        <BsTwitterX />
      </div>
      <div className="text-xl font-bold mt-4 flex flex-col flex-grow">
        <ul>
          {sidebarMenuItems.map((item) => (
            <li
              className={`flex items-center md:justify-center lg:justify-start gap-4 hover:bg-gray-700/20 rounded-full p-3 w-fit cursor-pointer transition-colors ${
                item.title === "Messages" ? "hover:text-blue-400" : ""
              }`}
              key={item.title}
              onClick={() => handleItemClick(item)}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="hidden lg:inline text-xl font-semibold">
                {item.title === "Messages" ? "Reach out to me" : item.title}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 mb-4 flex justify-center lg:justify-start">
          <div className="md:w-12 lg:w-auto">
            <CustomButton className="md:!px-3 lg:!px-24 whitespace-nowrap">
              <span className="hidden lg:inline">Post</span>
              <span className="lg:hidden">+</span>
            </CustomButton>
          </div>
        </div>

        {/* Add margin-top: auto to push the profile section to the bottom */}
        <div className="mt-auto">
          <ProfileSection />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
