// components/GifPicker.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";

interface GifObject {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
    original: {
      url: string;
    };
  };
}

export function GifPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchGifs = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
        params: {
          api_key: process.env.NEXT_PUBLIC_GIPHY_API_KEY,
          q: query,
          limit: 15,
        },
      });

      if (res.data && res.data.data) {
        setGifs(res.data.data);
      } else {
        setError("No GIFs found");
      }
    } catch (err) {
      console.error("Error fetching GIFs:", err);
      setError("Failed to load GIFs");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchGifs();
    }
  };

  return (
    <div className="p-4 bg-black text-white">
      <div className="flex gap-2">
        <input
          className="border border-gray-700 bg-gray-900 p-2 rounded-md w-full text-white"
          placeholder="Search GIFs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={searchGifs}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="grid grid-cols-3 gap-2 mt-4">
        {gifs.map((gif) => (
          <div
            key={gif.id}
            className="relative aspect-video overflow-hidden rounded-md border border-gray-700"
          >
            <Image
              alt="gif"
              src={gif.images.fixed_height.url}
              fill
              className="cursor-pointer rounded-md object-cover hover:opacity-80 transition"
              onClick={() => onSelect(gif.images.original.url)}
            />
          </div>
        ))}
      </div>

      {gifs.length === 0 && !loading && !error && (
        <p className="text-gray-500 text-center p-4">
          Search for GIFs to display results
        </p>
      )}
    </div>
  );
}
