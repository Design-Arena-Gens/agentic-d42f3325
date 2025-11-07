"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { LifeStory } from "@/types/story";

interface StoryWithId extends LifeStory {
  id: string;
  ownerEmail?: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [stories, setStories] = useState<StoryWithId[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const loadStories = async () => {
      setFetching(true);
      try {
        const snapshot = await getDocs(collection(db, "stories"));
        const items: StoryWithId[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as LifeStory),
        }));
        setStories(items);
      } catch (err) {
        console.error(err);
        setError("Unable to load stories.");
      } finally {
        setFetching(false);
      }
    };

    loadStories();
  }, [isAdmin]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking access...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Sign in to view the admin dashboard.
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        You do not have permission to view this page.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-white/60">Manage user stories, exports, and share links.</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:border-emerald-400/60"
          >
            Back to builder
          </Link>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Stories</h2>
            {fetching && <span className="text-xs text-emerald-300">Refreshing...</span>}
          </div>
          <div className="mt-4 grid gap-4">
            {stories.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.customization?.title || item.personal?.fullName || "Untitled"}
                    </h3>
                    <p className="text-xs text-white/60">Story ID: {item.id}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                    Updated {new Date(item.lastUpdated).toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">
                  {item.storyDrafts?.[item.selectedStyle] || "No AI draft yet."}
                </p>
                {item.shareableId && (
                  <p className="mt-3 text-xs text-white/60">
                    Share link: {" "}
                    <Link
                      href={`/share/${item.shareableId}`}
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      View
                    </Link>
                  </p>
                )}
              </article>
            ))}

            {!stories.length && !fetching && (
              <div className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
                No stories stored yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
