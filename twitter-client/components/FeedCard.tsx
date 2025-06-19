import React, { useState } from "react";
import Image from "next/image";
import {
  FaRegComment,
  FaRetweet,
  FaRegHeart,
  FaRegChartBar,
  FaShareSquare,
} from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import axios from "axios";

interface Tweet {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  _count: {
    likes: number;
  };
}

interface FeedCardProps {
  tweet: Tweet;
}

function FeedCard({ tweet }: FeedCardProps) {
  const [likeCount, setLikeCount] = useState(tweet._count.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const token = sessionData.session.access_token;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) return;

      const response = await axios.post(
        `${backendUrl}/api/tweets/${tweet.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.liked) {
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      } else {
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  // Format date to show relative time (e.g., 2h ago)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="border border-l-0 border-r-0 border-b-0 border-gray-800 p-4 hover:bg-gray-950 transition-all cursor-pointer">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
            <Image
              className="rounded-full"
              src={
                tweet.user.avatarUrl ||
                "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?uid=R167043860&semt=ais_hybrid&w=740"
              }
              alt="user-profile-img"
              fill
              sizes="(max-width: 640px) 40px, 48px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap">
            <h5 className="font-bold mr-2 text-sm sm:text-base">
              {tweet.user.username.split("@")[0]}
            </h5>
            <span className="text-gray-500 text-xs sm:text-sm truncate">@{tweet.user.username}</span>
            <span className="text-gray-500 mx-1 text-xs sm:text-sm">·</span>
            <span className="text-gray-500 text-xs sm:text-sm">{formatDate(tweet.createdAt)}</span>
          </div>
          <div className="mt-1">
            <p className="text-white text-sm sm:text-base break-words">{tweet.content}</p>
          </div>
          {/* Optional image attachment */}
          {tweet.mediaUrl && tweet.mediaType === "image" && (
            <div className="mt-3 rounded-xl overflow-hidden relative">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}> {/* 16:9 aspect ratio */}
                <Image
                  className="rounded-xl"
                  src={tweet.mediaUrl}
                  alt="tweet-image"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}
          <div className="flex justify-between mt-3 text-gray-500 w-full max-w-md text-xs sm:text-sm">
            <div className="flex items-center group">
              <FaRegComment className="mr-1 group-hover:text-blue-500" />
              <span className="group-hover:text-blue-500">0</span>
            </div>
            <div className="flex items-center group">
              <FaRetweet className="mr-1 group-hover:text-green-500" />
              <span className="group-hover:text-green-500">0</span>
            </div>
            <div className="flex items-center group" onClick={handleLike}>
              <FaRegHeart
                className={`mr-1 ${isLiked ? "text-pink-500" : "group-hover:text-pink-500"}`}
              />
              <span
                className={`${isLiked ? "text-pink-500" : "group-hover:text-pink-500"}`}
              >
                {likeCount}
              </span>
            </div>
            <div className="flex items-center group">
              <FaRegChartBar className="mr-1 group-hover:text-blue-500" />
              <span className="group-hover:text-blue-500">0</span>
            </div>
            <div className="flex items-center group">
              <FaShareSquare className="group-hover:text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedCard;
