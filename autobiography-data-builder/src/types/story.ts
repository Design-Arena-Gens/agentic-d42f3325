export type WritingStyle = "emotional" | "professional" | "simple" | "poetic";

export interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  birthplace: string;
  background: string;
}

export interface SectionContent {
  summary: string;
  highlights: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  notes?: string;
}

export interface CustomizationSettings {
  title: string;
  subtitle: string;
  coverImage: string;
  primaryFont: string;
  quote: string;
}

export interface LifeStory {
  personal: PersonalInfo;
  childhood: SectionContent;
  education: SectionContent;
  career: SectionContent;
  relationships: SectionContent;
  challenges: SectionContent;
  dreams: SectionContent;
  timeline: TimelineEvent[];
  storyDrafts: Record<WritingStyle, string>;
  selectedStyle: WritingStyle;
  customization: CustomizationSettings;
  lastUpdated: string;
  shareableId?: string;
}

export const EMPTY_STORY: LifeStory = {
  personal: {
    fullName: "",
    dateOfBirth: "",
    birthplace: "",
    background: "",
  },
  childhood: { summary: "", highlights: [""] },
  education: { summary: "", highlights: [""] },
  career: { summary: "", highlights: [""] },
  relationships: { summary: "", highlights: [""] },
  challenges: { summary: "", highlights: [""] },
  dreams: { summary: "", highlights: [""] },
  timeline: [],
  storyDrafts: {
    emotional: "",
    professional: "",
    simple: "",
    poetic: "",
  },
  selectedStyle: "emotional",
  customization: {
    title: "My Autobiography",
    subtitle: "A journey of growth",
    coverImage: "",
    primaryFont: "serif",
    quote: "",
  },
  lastUpdated: new Date().toISOString(),
};
