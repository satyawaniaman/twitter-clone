"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function ProfileSection() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/pages/auth");
  };

  if (!user) {
    return null;
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
  return (
    <div className="relative mt-auto mb-4">
      <div
        className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-700/20 cursor-pointer transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden relative">
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{displayName}</p>
          <p className="text-gray-500 text-xs">
            @{displayName.toLowerCase().replace(/\s/g, "")}
          </p>
        </div>
        <div className="text-xl">•••</div>
      </div>

      {showDropdown && (
        <div className="absolute bottom-full mb-2 left-0 bg-black border border-gray-700 rounded-xl shadow-lg w-60 overflow-hidden">
          <div
            className="p-4 hover:bg-gray-700/20 cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            Log out @{displayName.toLowerCase().replace(/\s/g, "")}
          </div>
        </div>
      )}
    </div>
  );
}
