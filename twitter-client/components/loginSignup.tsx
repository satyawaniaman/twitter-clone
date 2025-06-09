"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with email
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          alert("Check your email for the confirmation link.");
        } else {
          router.push("/pages/home");
        }
      } else {
        // Sign in with email
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/pages/home");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/pages/home`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/pages/home`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left side with X logo */}
      <div className="w-1/2 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-72 h-72 text-white"
          viewBox="0 0 1200 1227"
          fill="currentColor"
        >
          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
        </svg>
      </div>

      {/* Right side with login/signup form */}
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <h1 className="text-6xl font-bold mb-12">Happening now</h1>
        <h2 className="text-3xl font-bold mb-8">
          {isSignUp ? "Join today." : "Sign in to X"}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="max-w-xs">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full py-2.5 px-4 bg-white text-black font-medium rounded-full mb-3 hover:bg-gray-200 transition"
          >
            <FcGoogle className="mr-2 text-xl" />
            Sign {isSignUp ? "up" : "in"} with Google
          </button>

          <button
            onClick={handleAppleSignIn}
            className="flex items-center justify-center w-full py-2.5 px-4 bg-white text-black font-medium rounded-full mb-3 hover:bg-gray-200 transition"
          >
            <FaApple className="mr-2 text-xl" />
            Sign {isSignUp ? "up" : "in"} with Apple
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="px-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          {showForm ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2.5 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2.5 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 transition"
              >
                {loading ? "Processing..." : isSignUp ? "Sign up" : "Sign in"}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 px-4 bg-blue-500 font-bold rounded-full mb-4 hover:bg-blue-600 transition"
            >
              {isSignUp ? "Create account" : "Sign in"}
            </button>
          )}

          {/* Terms text (only show for signup) */}
          {isSignUp && (
            <p className="text-xs text-gray-500 my-4">
              By signing up, you agree to the{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Privacy Policy
              </a>
              , including{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Cookie Use
              </a>
              .
            </p>
          )}

          <div className="mt-8">
            <p className="text-gray-500 mb-3">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setShowForm(false);
                setError("");
              }}
              className="w-full py-2.5 px-4 bg-transparent border border-gray-600 rounded-full text-blue-500 font-bold hover:bg-blue-950/30 transition"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-2 w-full text-center flex justify-center space-x-4 text-xs text-gray-500">
        <a href="#" className="hover:underline">
          About
        </a>
        <a href="#" className="hover:underline">
          Download the X app
        </a>
        <a href="#" className="hover:underline">
          Help Centre
        </a>
        <a href="#" className="hover:underline">
          Terms of Service
        </a>
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
        <a href="#" className="hover:underline">
          Cookie Policy
        </a>
        <a href="#" className="hover:underline">
          Accessibility
        </a>
        <a href="#" className="hover:underline">
          Ads info
        </a>
        <a href="#" className="hover:underline">
          Blog
        </a>
        <a href="#" className="hover:underline">
          Status
        </a>
        <a href="#" className="hover:underline">
          Careers
        </a>
        <a href="#" className="hover:underline">
          Brand Resources
        </a>
        <a href="#" className="hover:underline">
          Advertising
        </a>
        <a href="#" className="hover:underline">
          Marketing
        </a>
        <span>© 2023 X Corp.</span>
      </div>
    </div>
  );
}
