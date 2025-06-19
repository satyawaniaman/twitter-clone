"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import axios from "axios";
import { toast } from "sonner";

import { FaCalendarAlt, FaCamera } from "react-icons/fa";

import FeedCard from "@/components/FeedCard";

interface UserProfileData {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  _count: {
    tweets: number;
    followers: number;
    following: number;
  };
}

interface UpdateProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

interface UserProfileProps {
  username: string;
}

interface Tweet {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  _count: {
    likes: number;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    fullName: "",
    bio: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "posts" | "replies" | "highlights" | "articles" | "media" | "likes"
  >("posts");

  // Fetch user profile
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<UserProfileData>({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");

      const response = await axios.get(`${backendUrl}/api/users/${username}`);
      return response.data;
    },
    enabled: !!username,
  });

  // Fetch user tweets
  const { data: tweetsData, isLoading: tweetsLoading } = useQuery({
    queryKey: ["userTweets", username],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");

      const response = await axios.get(
        `${backendUrl}/api/tweets/user/${username}`
      );
      return response.data;
    },
    enabled: !!username,
  });

  // Check if current user is viewing their own profile
  const isOwnProfile = user && profileData && user.id === profileData.id;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");

      const response = await axios.put(
        `${backendUrl}/api/users/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.put(
        `${backendUrl}/api/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Avatar upload successful:", data);
      // Update the edit form with the new avatar URL
      setEditForm(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      
      // Invalidate both profile and tweets queries to update avatar everywhere
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({ queryKey: ["userTweets", username] });
      
      // Dispatch custom event to refresh home feed
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { userId: data.id, newAvatarUrl: data.avatarUrl } 
      }));
      
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Avatar updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    },
  });

  const handleEditClick = () => {
    if (profileData) {
      setEditForm({
        username: profileData.username || "",
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        avatarUrl: profileData.avatarUrl || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = () => {
    // Include current avatar URL in the profile update
    const profileUpdateData = {
      ...editForm,
      avatarUrl: avatarPreview || profileData?.avatarUrl || undefined
    };
    updateProfileMutation.mutate(profileUpdateData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 bg-gray-700 animate-pulse rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-gray-700 animate-pulse rounded" />
              <div className="h-5 w-32 bg-gray-700 animate-pulse rounded" />
              <div className="h-5 w-full bg-gray-700 animate-pulse rounded" />
              <div className="h-5 w-3/4 bg-gray-700 animate-pulse rounded" />
              <div className="flex gap-4 mt-4">
                <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
                <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
          <p className="text-gray-400">
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="px-4">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profileData.fullName}
              </h1>
              <p className="text-sm text-gray-400">
                {profileData._count.tweets} posts
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="py-4">
          {/* Avatar and Edit Button */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black relative">
                <Image
                  src={
                    avatarPreview ||
                    profileData.avatarUrl ||
                    "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                  }
                  alt={profileData.fullName || profileData.username}
                  fill
                  className="object-cover"
                />
              </div>
              {isOwnProfile && isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <label className="cursor-pointer text-white">
                    <FaCamera size={24} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-1.5 border border-gray-600 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
                  >
                    Edit profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 border border-gray-600 text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-1.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar Upload Button */}
          {isOwnProfile && isEditing && avatarFile && (
            <button
              onClick={handleAvatarUpload}
              disabled={uploadAvatarMutation.isPending}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploadAvatarMutation.isPending
                ? "Uploading..."
                : "Upload Avatar"}
            </button>
          )}

          {/* Profile Information */}
          <div className="mb-4">
            {!isEditing ? (
              <div>
                {/* Name and Verification */}
                <div className="flex items-center gap-1 mb-1">
                  <h2 className="text-2xl font-bold text-white">
                    {profileData.fullName}
                  </h2>
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Username */}
                <p className="text-gray-400 mb-3">@{profileData.username}</p>

                {/* Bio */}
                {profileData.bio && (
                  <p className="text-white mb-3 leading-relaxed">
                    {profileData.bio}
                  </p>
                )}

                {/* Join Date */}
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                  <FaCalendarAlt size={14} />
                  <span>Joined {formatJoinDate(profileData.createdAt)}</span>
                </div>

                {/* Following/Followers */}
                <div className="flex gap-6">
                  <button className="hover:underline">
                    <span className="font-bold text-white">
                      {profileData._count.following}
                    </span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-bold text-white">
                      {profileData._count.followers}
                    </span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full px-3 py-3 bg-transparent border border-gray-600 rounded text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-3 bg-transparent border border-gray-600 rounded text-white resize-none focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Bio"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex">
            {[
              { key: "posts", label: "Posts" },
              { key: "replies", label: "Replies" },
              { key: "highlights", label: "Highlights" },
              { key: "articles", label: "Articles" },
              { key: "media", label: "Media" },
              { key: "likes", label: "Likes" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(
                    tab.key as
                      | "posts"
                      | "replies"
                      | "highlights"
                      | "articles"
                      | "media"
                      | "likes"
                  )
                }
                className={`flex-1 py-4 text-sm font-medium transition-colors relative hover:bg-gray-900/50 ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="relative">
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feed Content */}
        <div className="mt-0">
          {activeTab === "posts" && (
            <div>
              {tweetsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b border-gray-800 p-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-700 animate-pulse rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/4 bg-gray-700 animate-pulse rounded" />
                          <div className="h-4 w-full bg-gray-700 animate-pulse rounded" />
                          <div className="h-4 w-3/4 bg-gray-700 animate-pulse rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tweetsData?.tweets?.length > 0 ? (
                <div>
                  {tweetsData.tweets.map((tweet: Tweet) => (
                    <FeedCard key={tweet.id} tweet={tweet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400">
                    <h3 className="text-xl font-bold mb-2">
                      {isOwnProfile
                        ? "You haven't posted anything yet"
                        : `@${username} hasn't posted anything yet`}
                    </h3>
                    <p className="text-sm">
                      {isOwnProfile
                        ? "When you post something, it will show up here."
                        : "When they post something, it will show up here."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "replies" && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <h3 className="text-xl font-bold mb-2">No replies yet</h3>
                <p className="text-sm">Replies will show up here.</p>
              </div>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <h3 className="text-xl font-bold mb-2">No highlights yet</h3>
                <p className="text-sm">Highlighted posts will show up here.</p>
              </div>
            </div>
          )}

          {activeTab === "articles" && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <h3 className="text-xl font-bold mb-2">No articles yet</h3>
                <p className="text-sm">Published articles will show up here.</p>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <h3 className="text-xl font-bold mb-2">No media yet</h3>
                <p className="text-sm">Photos and videos will show up here.</p>
              </div>
            </div>
          )}

          {activeTab === "likes" && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <h3 className="text-xl font-bold mb-2">No likes yet</h3>
                <p className="text-sm">Liked posts will show up here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
