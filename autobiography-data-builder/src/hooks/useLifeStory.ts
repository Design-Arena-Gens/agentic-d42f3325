"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { db } from "@/lib/firebase";
import { EMPTY_STORY, LifeStory, TimelineEvent, WritingStyle } from "@/types/story";

type UpdatePayload = Partial<LifeStory>;

export function useLifeStory(userId: string | undefined) {
  const [story, setStory] = useState<LifeStory>(EMPTY_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStory(EMPTY_STORY);
      setLoading(false);
      return () => undefined;
    }

    const ref = doc(collection(db, "stories"), userId);

    setLoading(true);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as LifeStory;
        setStory({ ...EMPTY_STORY, ...data });
      } else {
        setStory(EMPTY_STORY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const persist = useCallback(
    async (payload: UpdatePayload) => {
      if (!userId) return;
      setSaving(true);
      const ref = doc(collection(db, "stories"), userId);
      const enriched = {
        ...payload,
        lastUpdated: new Date().toISOString(),
      } as Partial<LifeStory>;

      try {
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          await updateDoc(ref, enriched);
        } else {
          await setDoc(ref, { ...EMPTY_STORY, ...enriched });
        }
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const updateSection = useCallback(
    async (section: keyof LifeStory, value: LifeStory[keyof LifeStory]) => {
      await persist({ [section]: value } as UpdatePayload);
    },
    [persist]
  );

  const addTimelineEvent = useCallback(
    async (event: Omit<TimelineEvent, "id">) => {
      const id = nanoid();
      const next = [...story.timeline, { ...event, id }];
      await persist({ timeline: next });
    },
    [persist, story.timeline]
  );

  const updateTimelineEvent = useCallback(
    async (eventId: string, data: Partial<TimelineEvent>) => {
      const next = story.timeline.map((event) =>
        event.id === eventId ? { ...event, ...data } : event
      );
      await persist({ timeline: next });
    },
    [persist, story.timeline]
  );

  const deleteTimelineEvent = useCallback(
    async (eventId: string) => {
      const next = story.timeline.filter((event) => event.id !== eventId);
      await persist({ timeline: next });
    },
    [persist, story.timeline]
  );

  const updateStoryDraft = useCallback(
    async (style: WritingStyle, content: string) => {
      await persist({
        storyDrafts: {
          ...story.storyDrafts,
          [style]: content,
        },
        selectedStyle: style,
      });
    },
    [persist, story.storyDrafts]
  );

  const setCustomization = useCallback(
    async (customization: LifeStory["customization"]) => {
      await persist({ customization });
    },
    [persist]
  );

  const createShareLink = useCallback(
    async (draft: string, style: WritingStyle) => {
      if (!userId) {
        throw new Error("No user");
      }

      const shareId = story.shareableId ?? nanoid(12);
      await persist({
        shareableId: shareId,
        selectedStyle: style,
        storyDrafts: {
          ...story.storyDrafts,
          [style]: draft,
        },
      });

      await setDoc(doc(collection(db, "shares"), shareId), {
        createdAt: new Date().toISOString(),
        storyId: userId,
        style,
        draft,
        personal: story.personal,
        customization: story.customization,
        timeline: story.timeline,
        title: story.customization.title || story.personal.fullName || "Autobiography",
      });

      return shareId;
    },
    [persist, story, userId]
  );

  const value = useMemo(
    () => ({
      story,
      loading,
      saving,
      updateSection,
      addTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,
      updateStoryDraft,
      setCustomization,
      persist,
      createShareLink,
    }),
    [
      story,
      loading,
      saving,
      updateSection,
      addTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,
      updateStoryDraft,
      setCustomization,
      persist,
      createShareLink,
    ]
  );

  return value;
}
