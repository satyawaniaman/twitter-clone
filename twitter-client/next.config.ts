import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  removeConsole: {
    exclude: ["log", "warn", "error", "info"],
  },
  images: {
    domains: [
      "img.freepik.com",
      "images.unsplash.com",
      "https://assets.example.com/account123/**",
      "lh3.googleusercontent.com",
      "abs.twimg.com",
      "zkyfqhujeohggpjdpqss.supabase.co",
      "twitter-clone-72fa.onrender.com",
    ],
  },
};
export default nextConfig;
