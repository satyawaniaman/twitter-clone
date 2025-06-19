"use client";

import React from "react";
import { useParams } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Invalid profile URL</p>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <UserProfile username={username} />
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
