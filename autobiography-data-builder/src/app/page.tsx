"use client";
import Image from "next/image";
import { AuthPanel } from "@/components/AuthPanel";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, logout, loading } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.25),_transparent_45%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-slate-900/70 to-transparent" />

      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-10 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Image src="/favicon.ico" alt="Autobiography Data Builder" width={28} height={28} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Autobiography Data Builder</h1>
              <p className="text-sm text-white/60">Collect memories, craft narratives, publish your life story.</p>
            </div>
          </div>
          {user ? (
            <button
              onClick={logout}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-emerald-400/60"
            >
              Log out
            </button>
          ) : null}
        </header>

        {!user ? (
          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6 text-white">
              <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Turn cherished memories into a beautifully crafted autobiography.
              </h2>
              <p className="text-lg text-white/70">
                Capture each chapter of your life with guided prompts, visual timelines, and AI-assisted storytelling. Share a polished autobiography with family, readers, or your future self.
              </p>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">1</span>
                  Guided sections cover personal history, relationships, lessons, and dreams.
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">2</span>
                  AI drafts your story in multiple styles you can edit and refine.
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">3</span>
                  Export to PDF, DOCX, or share a private link with loved ones.
                </li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <AuthPanel />
            </div>
          </div>
        ) : (
          <div className="mt-10">
            {loading && <p className="text-sm text-white/60">Loading your workspace...</p>}
            <StoryBuilder />
          </div>
        )}
      </div>
    </main>
  );
}
