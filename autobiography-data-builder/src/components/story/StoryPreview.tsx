"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { LifeStory, WritingStyle } from "@/types/story";
import { ExportButtons } from "./export/ExportButtons";

interface StoryPreviewProps {
  story: LifeStory;
  loading: boolean;
  onGenerate: (style: WritingStyle) => Promise<string>;
  onDraftChange: (style: WritingStyle, content: string) => Promise<void> | void;
  onShare: (draft: string, style: WritingStyle) => Promise<string>;
}

const styles: { value: WritingStyle; label: string; description: string }[] = [
  { value: "emotional", label: "Emotional", description: "Rich with feelings and vivid storytelling." },
  { value: "professional", label: "Professional", description: "Polished, formal voice suitable for publications." },
  { value: "simple", label: "Simple", description: "Clear, friendly tone for any reader." },
  { value: "poetic", label: "Poetic", description: "Rhythmic and lyrical narration." },
];

export function StoryPreview({
  story,
  loading,
  onGenerate,
  onDraftChange,
  onShare,
}: StoryPreviewProps) {
  const [activeStyle, setActiveStyle] = useState<WritingStyle>(story.selectedStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingText, setEditingText] = useState(story.storyDrafts[story.selectedStyle] || "");

  useEffect(() => {
    setActiveStyle(story.selectedStyle);
  }, [story.selectedStyle]);

  useEffect(() => {
    setEditingText(story.storyDrafts[activeStyle] || "");
  }, [story.storyDrafts, activeStyle]);

  const generate = async (style: WritingStyle) => {
    try {
      setIsGenerating(true);
      const nextDraft = await onGenerate(style);
      setActiveStyle(style);
      if (nextDraft) {
        setEditingText(nextDraft);
      }
      toast.success(`Generated a ${style} draft`);
    } catch (error) {
      console.error(error);
      toast.error("Story generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleChange = (style: WritingStyle) => {
    const nextDraft = story.storyDrafts[style] || "";
    setActiveStyle(style);
    setEditingText(nextDraft);
    onDraftChange(style, nextDraft);
  };

  const handleDraftChange = (content: string) => {
    setEditingText(content);
    onDraftChange(activeStyle, content);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">AI Story Studio</h3>
            <p className="text-sm text-white/70">
              Generate drafts in different voices and refine them instantly.
            </p>
          </div>
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-emerald-400/60"
            onClick={() => generate(activeStyle)}
            disabled={isGenerating || loading}
          >
            {isGenerating ? "Generating..." : "Regenerate"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => handleStyleChange(style.value)}
              className={clsx(
                "rounded-xl border px-4 py-3 text-left transition",
                activeStyle === style.value
                  ? "border-emerald-400/70 bg-emerald-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              )}
              type="button"
            >
              <h4 className="text-sm font-semibold text-white">{style.label}</h4>
              <p className="text-xs text-white/60">{style.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/70 p-4">
          <textarea
            value={editingText}
            onChange={(event) => handleDraftChange(event.target.value)}
            placeholder="Generate your first draft to begin editing..."
            className="h-72 w-full resize-y rounded-lg border border-white/10 bg-black/40 px-3 py-3 text-sm leading-relaxed text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <ExportButtons
          story={story}
          activeStyle={activeStyle}
          draft={editingText}
          onShare={async () => {
            const id = await onShare(editingText, activeStyle);
            const shareUrl = `${window.location.origin}/share/${id}`;
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(shareUrl);
              toast.success("Shareable link copied to clipboard");
            } else {
              toast.success("Shareable link ready");
            }
            return shareUrl;
          }}
        />
      </div>
    </section>
  );
}
