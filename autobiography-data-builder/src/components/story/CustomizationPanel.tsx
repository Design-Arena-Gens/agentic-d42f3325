"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { LifeStory } from "@/types/story";

interface CustomizationPanelProps {
  customization: LifeStory["customization"];
  onChange: (settings: LifeStory["customization"]) => Promise<void> | void;
}

const fonts = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "mono", label: "Monospace" },
  { id: "handwritten", label: "Handwritten" },
];

export function CustomizationPanel({ customization, onChange }: CustomizationPanelProps) {
  const [localSettings, setLocalSettings] = useState(customization);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(customization);
  }, [customization]);

  const handleUpdate = async (updates: Partial<LifeStory["customization"]>) => {
    const next = { ...localSettings, ...updates };
    setLocalSettings(next);
    try {
      setSaving(true);
      await onChange(next);
    } catch (error) {
      console.error(error);
      toast.error("Could not apply personalization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Customization</h3>
          <p className="text-sm text-white/70">Tailor the look and feel of your autobiography.</p>
        </div>
        {saving && <span className="text-xs text-emerald-300">Saving...</span>}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm text-white/80">Title</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={localSettings.title}
            onChange={(event) => handleUpdate({ title: event.target.value })}
            placeholder="My Life Story"
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Subtitle</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={localSettings.subtitle}
            onChange={(event) => handleUpdate({ subtitle: event.target.value })}
            placeholder="Moments of growth and transformation"
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Cover image URL</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={localSettings.coverImage}
            onChange={(event) => handleUpdate({ coverImage: event.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Favorite quote</label>
          <textarea
            rows={2}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={localSettings.quote}
            onChange={(event) => handleUpdate({ quote: event.target.value })}
            placeholder="A personal motto or guiding phrase"
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Font style</label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {fonts.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => handleUpdate({ primaryFont: font.id })}
                className={clsx(
                  "rounded-xl border px-4 py-3 text-left transition",
                  localSettings.primaryFont === font.id
                    ? "border-emerald-400/70 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                )}
              >
                <span className="text-sm font-semibold text-white">{font.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
