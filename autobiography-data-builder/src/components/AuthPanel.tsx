"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export function AuthPanel() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();
    const displayName = String(form.get("displayName") || "").trim();

    if (!email || !password || (isSigningUp && !displayName)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      if (isSigningUp) {
        await signupWithEmail(email, password, displayName);
        toast.success("Account created! You are now signed in.");
      } else {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Signed in with Google");
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8 shadow-xl">
      <h2 className="text-2xl font-semibold text-white mb-1">
        {isSigningUp ? "Create your account" : "Welcome back"}
      </h2>
      <p className="text-sm text-white/70 mb-6">
        {isSigningUp
          ? "Start crafting your autobiography in minutes."
          : "Sign in to continue building your life story."}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSigningUp && (
          <div>
            <label className="text-sm text-white/80 mb-1 block" htmlFor="displayName">
              Full name
            </label>
            <input
              id="displayName"
              name="displayName"
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label className="text-sm text-white/80 mb-1 block" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm text-white/80 mb-1 block" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isSigningUp
            ? "Create account"
            : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-2 my-6">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wide text-white/60">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full rounded-lg bg-white/90 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-white disabled:opacity-50"
        disabled={loading}
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-white/70">
        {isSigningUp ? "Already have an account?" : "Need to create an account?"}{" "}
        <button
          onClick={() => setIsSigningUp((prev) => !prev)}
          className="font-semibold text-emerald-300 hover:text-emerald-200"
          type="button"
        >
          {isSigningUp ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
