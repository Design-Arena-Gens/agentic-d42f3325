"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useLifeStory } from "@/hooks/useLifeStory";
import { LifeStory } from "@/types/story";
import { TimelineManager } from "./TimelineManager";
import { StoryPreview } from "./StoryPreview";
import { CustomizationPanel } from "./CustomizationPanel";

const highlightsSchema = z
  .array(z.string().min(1, "Highlight cannot be empty"))
  .min(1, "Add at least one highlight");

const storySchema = z.object({
  personal: z.object({
    fullName: z.string().min(2, "Please add a full name"),
    dateOfBirth: z.string().min(1, "Tell us when you were born"),
    birthplace: z.string().min(2, "Birthplace is required"),
    background: z.string().min(10, "Share a short background"),
  }),
  childhood: z.object({
    summary: z.string().min(10, "Add a short narrative"),
    highlights: highlightsSchema,
  }),
  education: z.object({
    summary: z.string().min(10),
    highlights: highlightsSchema,
  }),
  career: z.object({
    summary: z.string().min(10),
    highlights: highlightsSchema,
  }),
  relationships: z.object({
    summary: z.string().min(10),
    highlights: highlightsSchema,
  }),
  challenges: z.object({
    summary: z.string().min(10),
    highlights: highlightsSchema,
  }),
  dreams: z.object({
    summary: z.string().min(10),
    highlights: highlightsSchema,
  }),
});

type StoryFormValues = z.infer<typeof storySchema>;

type NonPersonalSectionKey = Exclude<keyof StoryFormValues, "personal">;

const sections: {
  key: keyof StoryFormValues;
  label: string;
  description: string;
}[] = [
  {
    key: "personal",
    label: "Personal Information",
    description: "Lay the foundation with essential personal details.",
  },
  {
    key: "childhood",
    label: "Childhood Memories",
    description: "Capture formative stories and lessons from your early years.",
  },
  {
    key: "education",
    label: "Education Journey",
    description: "Highlight your academic path and defining learning moments.",
  },
  {
    key: "career",
    label: "Career & Achievements",
    description: "Showcase milestones and professional growth.",
  },
  {
    key: "relationships",
    label: "Family & Relationships",
    description: "Celebrate the people who shaped your life.",
  },
  {
    key: "challenges",
    label: "Life Challenges & Lessons",
    description: "Share pivotal challenges and what they taught you.",
  },
  {
    key: "dreams",
    label: "Dreams, Beliefs & Future Goals",
    description: "Express what drives you forward and your vision ahead.",
  },
];

export function StoryBuilder() {
  const { user } = useAuth();
  const userId = user?.uid;
  const {
    story,
    loading,
    saving,
    persist,
    updateStoryDraft,
    setCustomization,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    createShareLink,
  } = useLifeStory(userId);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const defaultValues = useMemo(
    () => ({
      personal: story.personal,
      childhood: story.childhood,
      education: story.education,
      career: story.career,
      relationships: story.relationships,
      challenges: story.challenges,
      dreams: story.dreams,
    }),
    [story]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues,
    values: defaultValues,
  });

  const handleSave = async (data: StoryFormValues) => {
    try {
      await persist({
        personal: data.personal,
        childhood: data.childhood,
        education: data.education,
        career: data.career,
        relationships: data.relationships,
        challenges: data.challenges,
        dreams: data.dreams,
      });
      toast.success("Story data saved");
      reset(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save story data");
    }
  };

  const currentSection = sections[activeSectionIndex];
  const isPersonalSection = currentSection.key === "personal";
  const nonPersonalKey = isPersonalSection
    ? null
    : (currentSection.key as NonPersonalSectionKey);
  const highlightsPath = nonPersonalKey
    ? (`${nonPersonalKey}.highlights` as const)
    : null;
  const watchedHighlights = highlightsPath ? watch(highlightsPath) : undefined;
  const highlights =
    highlightsPath && Array.isArray(watchedHighlights)
      ? (watchedHighlights as string[])
      : [""];

  const addHighlight = () => {
    if (!highlightsPath) return;
    setValue(highlightsPath, [...highlights, ""], {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const removeHighlight = (index: number) => {
    if (!highlightsPath) return;
    const next = highlights.filter((_, idx) => idx !== index);
    setValue(highlightsPath, next.length ? next : [""], {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Guided Writer
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {currentSection.label}
              </h3>
              <p className="text-sm text-white/70">
                {currentSection.description}
              </p>
            </div>
            <div className="flex flex-col items-end text-xs text-white/60">
              <span>
                Step {activeSectionIndex + 1} of {sections.length}
              </span>
              {saving && <span className="text-emerald-300">Saving...</span>}
            </div>
          </div>

          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit(handleSave)}
          >
            {isPersonalSection ? (
              <>
                <div>
                  <label className="text-sm text-white/80" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Jane Doe"
                    {...register("personal.fullName")}
                  />
                  {errors.personal?.fullName && (
                    <p className="mt-1 text-xs text-rose-300">
                      {errors.personal.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-white/80" htmlFor="dateOfBirth">
                      Date of birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      {...register("personal.dateOfBirth")}
                    />
                    {errors.personal?.dateOfBirth && (
                      <p className="mt-1 text-xs text-rose-300">
                        {errors.personal.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-white/80" htmlFor="birthplace">
                      Birthplace
                    </label>
                    <input
                      id="birthplace"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="City, Country"
                      {...register("personal.birthplace")}
                    />
                    {errors.personal?.birthplace && (
                      <p className="mt-1 text-xs text-rose-300">
                        {errors.personal.birthplace.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/80" htmlFor="background">
                    Background overview
                  </label>
                  <textarea
                    id="background"
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Share a short overview of your upbringing, culture, or values."
                    {...register("personal.background")}
                  />
                  {errors.personal?.background && (
                    <p className="mt-1 text-xs text-rose-300">
                      {errors.personal.background.message}
                    </p>
                  )}
                </div>
              </>
            ) : nonPersonalKey ? (
              <>
                <div>
                  <label className="text-sm text-white/80" htmlFor={`${currentSection.key}-summary`}>
                    Section summary
                  </label>
                  <textarea
                    id={`${currentSection.key}-summary`}
                    rows={5}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Describe this chapter of your life."
                    {...register(`${nonPersonalKey}.summary` as const)}
                  />
                  {nonPersonalKey && errors[nonPersonalKey]?.summary && (
                    <p className="mt-1 text-xs text-rose-300">
                      {errors[nonPersonalKey]?.summary?.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/80">
                      Highlights
                    </label>
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      Add highlight
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {highlights.map((_, index) => (
                      <div key={`${currentSection.key}-highlight-${index}`} className="flex items-start gap-3">
                        <textarea
                          rows={2}
                          className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="One key moment or insight"
                          {...register(
                            `${nonPersonalKey}.highlights.${index}` as const
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  {nonPersonalKey && errors[nonPersonalKey]?.highlights && (
                    <p className="mt-1 text-xs text-rose-300">
                      {(errors[nonPersonalKey]?.highlights?.message as string) ||
                        "Please add at least one highlight."}
                    </p>
                  )}
                </div>
              </>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionIndex((prev) => Math.max(prev - 1, 0))}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
                  disabled={activeSectionIndex === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSectionIndex((prev) =>
                      Math.min(prev + 1, sections.length - 1)
                    )
                  }
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
                  disabled={activeSectionIndex === sections.length - 1}
                >
                  Next
                </button>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
              >
                {saving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
              </button>
            </div>
          </form>
        </div>

        <TimelineManager
          events={story.timeline}
          onCreate={addTimelineEvent}
          onUpdate={updateTimelineEvent}
          onDelete={deleteTimelineEvent}
        />
      </div>

      <div className="space-y-6">
        <StoryPreview
          story={story}
          loading={loading}
          onGenerate={async (style) => {
            try {
              const response = await fetch("/api/generate-story", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ style, story }),
              });

              if (!response.ok) {
                throw new Error("Generation request failed");
              }

              const result = await response.json();
              if (!result?.draft) {
                throw new Error(result?.error || "No story returned");
              }

              await updateStoryDraft(style, result.draft);
              return result.draft as string;
            } catch (error) {
              console.error(error);
              throw error;
            }
          }}
          onDraftChange={updateStoryDraft}
          onShare={createShareLink}
        />

        <CustomizationPanel
          customization={story.customization}
          onChange={setCustomization}
        />
      </div>
    </div>
  );
}
