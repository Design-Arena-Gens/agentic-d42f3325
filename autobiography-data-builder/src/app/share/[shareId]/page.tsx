"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LifeStory, TimelineEvent, WritingStyle } from "@/types/story";
import { format } from "date-fns";

interface SharePayload {
  title: string;
  draft: string;
  createdAt: string;
  style: WritingStyle;
  personal: LifeStory["personal"];
  customization: LifeStory["customization"];
  timeline: TimelineEvent[];
}

export default function SharePage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId;
  const [data, setData] = useState<SharePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    const fetchShare = async () => {
      try {
        const ref = doc(db, "shares", shareId);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          setError("This shared story is no longer available.");
          return;
        }
        const payload = snapshot.data() as SharePayload;
        setData(payload);
      } catch (err) {
        console.error(err);
        setError("Unable to load shared story.");
      } finally {
        setLoading(false);
      }
    };

    fetchShare();
  }, [shareId]);

  const paragraphs = useMemo(() => {
    if (!data?.draft) return [];
    return data.draft
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading shared story...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Autobiography link</h1>
          <p className="text-white/70">{error ?? "This story could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-8 shadow-lg">
          <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-4 py-1 text-xs uppercase tracking-wide text-emerald-200">
            Shared autobiography
          </span>
          <h1 className="mt-4 text-4xl font-semibold">{data.customization.title || data.title}</h1>
          {data.customization.subtitle && (
            <p className="mt-1 text-lg text-white/70">{data.customization.subtitle}</p>
          )}
          <p className="mt-6 text-sm text-white/60">
            Authored by {data.personal.fullName || "Anonymous"} · {data.style} style · Published {format(new Date(data.createdAt), "PPP")}
          </p>
        </header>

        <article className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-white/90">
              {paragraph}
            </p>
          ))}
        </article>

        {data.timeline?.length ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">Life timeline</h2>
            <div className="mt-4 space-y-4">
              {data.timeline.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                    <span className="text-sm text-white/60">
                      {event.date ? format(new Date(event.date), "PPP") : "Undated"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">{event.description}</p>
                  {event.notes && <p className="mt-2 text-xs text-white/60">Notes: {event.notes}</p>}
                  {event.imageUrl && (
                    <a
                      href={event.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      View image ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
