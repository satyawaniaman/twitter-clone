"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";
import { AiOutlineGif } from "react-icons/ai";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { GifPicker } from "./GifPicker";

const TweetInput: React.FC = () => {
  const [tweetText, setTweetText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);

  // Fetch user data on component mount
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  const handleImageClick = () => {
    // Close GIF picker if open
    if (showGifPicker) {
      setShowGifPicker(false);
    }
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedGif(null); // Remove any selected GIF
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setSelectedImage(null);
    setSelectedGif(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGifSelect = (url: string) => {
    setSelectedGif(url);
    setImagePreview(url);
    setSelectedImage(null); // Remove any selected image
    setShowGifPicker(false);
  };

  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
  };

  const handleSubmit = async () => {
    if (!tweetText.trim() && !selectedImage && !selectedGif) return;

    setIsPosting(true);

    try {
      // Here we would normally upload to a backend API
      // This is a placeholder for actual tweet posting logic
      console.log("Tweet submitted:", {
        text: tweetText,
        image: selectedImage ? selectedImage.name : null,
        gif: selectedGif,
      });

      // Reset form after posting
      setTweetText("");
      setSelectedImage(null);
      setSelectedGif(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error posting tweet:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

  const hasMedia = Boolean(selectedImage || selectedGif);

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex space-x-4">
        {/* User avatar */}
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

        {/* Tweet input area */}
        <div className="flex-grow">
          <textarea
            placeholder="What's happening?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            className="w-full bg-transparent text-lg outline-none resize-none text-white placeholder-gray-500 min-h-[60px]"
            maxLength={280}
          />

          {/* Media preview (image or GIF) */}
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
                alt={selectedGif ? "GIF" : "Tweet image"}
                width={500}
                height={300}
                className="w-full object-contain max-h-[300px]"
              />
            </div>
          )}

          {/* Tweet controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-4 text-blue-500">
              {/* Image upload */}
              <div
                onClick={handleImageClick}
                className={`cursor-pointer hover:bg-blue-500/10 p-2 rounded-full transition ${
                  selectedGif ? "opacity-50" : ""
                }`}
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

              {/* GIF picker */}
              <div
                className={`cursor-pointer hover:bg-blue-500/10 p-2 rounded-full transition ${
                  showGifPicker ? "bg-blue-500/10" : ""
                } ${selectedImage ? "opacity-50" : ""}`}
                onClick={toggleGifPicker}
                title="Add a GIF"
              >
                <AiOutlineGif size={20} />
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

          {/* GIF picker panel */}
          {showGifPicker && (
            <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
              <GifPicker onSelect={handleGifSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetInput;
