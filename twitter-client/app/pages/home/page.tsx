"use client";

import React, { useEffect, useState } from "react";
import FeedCard from "@/components/FeedCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import TweetInput from "@/components/TweetInput";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
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

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchTweets = async (cursor?: string) => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        setError("Backend URL not configured");
        return;
      }

      const url = cursor
        ? `${backendUrl}/api/tweets?cursor=${cursor}`
        : `${backendUrl}/api/tweets`;

      const response = await axios.get(url);

      if (cursor) {
        setTweets((prev) => [...prev, ...response.data.tweets]);
      } else {
        setTweets(response.data.tweets);
      }

      setNextCursor(response.data.nextCursor);
    } catch (err) {
      console.error("Error fetching tweets:", err);
      setError("Failed to load tweets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
    
    // Listen for avatar updates to refresh tweets
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { userId, newAvatarUrl } = event.detail;
      setTweets(prevTweets => 
        prevTweets.map(tweet => 
          tweet.user.id === userId 
            ? { ...tweet, user: { ...tweet.user, avatarUrl: newAvatarUrl } }
            : tweet
        )
      );
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  const loadMoreTweets = () => {
    if (nextCursor) {
      fetchTweets(nextCursor);
    }
  };

  return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 h-screen w-screen max-w-7xl mx-auto">
        {/* Left sidebar - hidden on mobile, visible on md screens and up */}
        <div className="hidden md:block md:col-span-1 lg:col-span-3">
          <Sidebar />
        </div>

        {/* Main content - full width on mobile, adjusted on larger screens */}
        <div className="col-span-1 md:col-span-3 lg:col-span-6 border-x border-gray-800 overflow-y-auto">
          <div className="sticky top-0 bg-black z-10 border-b border-gray-800 p-3 sm:p-4">
            <h1 className="text-xl font-bold">Home</h1>
          </div>
          <TweetInput />
          {loading && tweets.length === 0 ? (
            <div className="flex justify-center p-4">
              <p className="text-gray-500 text-sm sm:text-base">
                Loading tweets...
              </p>
            </div>
          ) : error ? (
            <div className="flex justify-center p-4">
              <p className="text-red-500 text-sm sm:text-base">{error}</p>
            </div>
          ) : (
            <>
              {tweets.map((tweet) => (
                <FeedCard key={tweet.id} tweet={tweet} />
              ))}
              {nextCursor && (
                <div className="flex justify-center p-4">
                  <button
                    onClick={loadMoreTweets}
                    className="text-blue-500 hover:text-blue-600 text-sm sm:text-base px-4 py-2 rounded-full hover:bg-blue-500/10 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load more tweets"}
                  </button>
                </div>
              )}
              {tweets.length === 0 && (
                <div className="flex justify-center p-4">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No tweets found. Be the first to tweet!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right sidebar - hidden on mobile and md screens, visible on lg screens */}
        <div className="hidden lg:block lg:col-span-3 p-4">
          {/* Add content for right sidebar here */}
        </div>

        {/* Mobile navigation component */}
        <MobileNavigation />
      </div>
    </ProtectedRoute>
  );
}
