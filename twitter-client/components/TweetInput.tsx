"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import axios from "axios";

const TweetInput: React.FC = () => {
  const [tweetText, setTweetText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchUser();
    
    // Listen for avatar updates to refresh user data
    const handleAvatarUpdate = () => {
      fetchUser(); // Refetch user data when avatar is updated
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!tweetText.trim() && !selectedImage) return;
    setIsPosting(true);
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Authentication error:", sessionError);
        setIsPosting(false);
        return;
      }
      const token = sessionData.session.access_token;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        console.error("Backend URL not configured");
        setIsPosting(false);
        return;
      }
      const formData = new FormData();
      formData.append("content", tweetText);
      if (selectedImage) {
        // Validate file size and type before uploading
        if (selectedImage.size > 10 * 1024 * 1024) {
          console.error("File too large");
          setIsPosting(false);
          return;
        }
        formData.append("media", selectedImage);
      }
      
      console.log("Uploading media:", selectedImage?.name, selectedImage?.type, selectedImage?.size);
      
      const response = await axios.post(`${backendUrl}/api/tweets`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type manually for FormData
        },
      });
      
      console.log("Tweet posted successfully:", response.data);
      
      setTweetText("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error posting tweet:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Error posting tweet:", error.message);
      } else {
        // For completely unknown error types, convert to string or use a safe representation
        console.error("Error posting tweet:", String(error));
      }
      // Optionally show error to user
    } finally {
      setIsPosting(false);
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
  const hasMedia = Boolean(selectedImage);

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden relative">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex-grow">
          <textarea
            placeholder="What's happening?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            className="w-full bg-transparent text-lg outline-none resize-none text-white placeholder-gray-500 min-h-[60px]"
            maxLength={280}
          />
          {imagePreview && (
            <div className="relative mt-2 mb-4 rounded-2xl overflow-hidden border border-gray-700">
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                aria-label="Remove media"
              >
                ✕
              </button>
              <Image
                src={imagePreview}
                alt="Tweet image"
                width={500}
                height={300}
                className="w-full object-contain max-h-[300px]"
              />
            </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-4 text-blue-500">
              <div
                onClick={handleImageClick}
                className="cursor-pointer hover:bg-blue-500/10 p-2 rounded-full transition"
                title="Upload image"
              >
                <BiImageAlt size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={(!tweetText.trim() && !hasMedia) || isPosting}
              className={`bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold ${
                (!tweetText.trim() && !hasMedia) || isPosting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetInput;
