"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/pages/home");
      } else {
        router.push("/pages/auth");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}
