"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import axios from "axios";

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  tweetsCount: number;
  followersCount: number;
  followingCount: number;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  syncUserWithDatabase: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Function to sync user with database and fetch profile
  const syncUserWithDatabase = async (user: User) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await axios.post(`${apiUrl}/api/auth/user`, {
        user_id: user.id,
        email: user.email,
      });

      // Fetch user profile to get the actual username
      const profileResponse = await axios.get(
        `${apiUrl}/api/users/${user.email?.split("@")[0]}`
      );
      setUserProfile(profileResponse.data);
    } catch (error) {
      console.error("Error syncing user with database:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Sync user with database if logged in
      if (session?.user) {
        await syncUserWithDatabase(session.user);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Sync user with database on sign in or when user is updated
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "USER_UPDATED")
      ) {
        await syncUserWithDatabase(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    userProfile,
    syncUserWithDatabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
