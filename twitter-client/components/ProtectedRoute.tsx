"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import axios from "axios";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Function to sync user with database
  const syncUserWithDatabase = async (userId: string, userEmail: string) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      await axios.post(`${apiUrl}/api/auth/user`, {
        user_id: userId,
        email: userEmail,
      });
    } catch (error) {
      console.error("Error syncing user with database:", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/pages/auth");
      } else {
        // Ensure user exists in database
        if (session.user) {
          await syncUserWithDatabase(session.user.id, session.user.email || "");
        }
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/pages/auth");
      } else if (
        (event === "SIGNED_IN" || event === "USER_UPDATED") &&
        session
      ) {
        // Ensure user exists in database after sign in
        await syncUserWithDatabase(session.user.id, session.user.email || "");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
