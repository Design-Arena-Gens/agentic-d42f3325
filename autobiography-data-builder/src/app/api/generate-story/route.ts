import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LifeStory, WritingStyle } from "@/types/story";

const STYLE_TONES: Record<WritingStyle, string> = {
  emotional:
    "Write in a heartfelt, intimate voice that emphasizes emotions, vulnerability, and sensory details.",
  professional:
    "Write in an articulate, polished voice suitable for publication or professional audiences.",
  simple:
    "Write in a clear, friendly, and accessible tone that any reader can understand.",
  poetic:
    "Write with lyrical flow, metaphors, and rhythmic language that feels poetic and reflective.",
};

const DEFAULT_PARAGRAPH =
  "Your memories are almost ready to bloom. Add more detail in each section, then regenerate for a richer narrative.";

function buildPrompt(story: LifeStory, style: WritingStyle) {
  const highlightSection = (title: string, section: { summary: string; highlights: string[] }) => `
### ${title}
Summary: ${section.summary}
Highlights:
${section.highlights.filter(Boolean).map((item, index) => `${index + 1}. ${item}`).join("\n")}`;

  const timelineText = story.timeline
    .map(
      (event, index) =>
        `${index + 1}. ${event.title} (${event.date || "undated"}) - ${event.description}` +
        (event.notes ? ` | Notes: ${event.notes}` : "")
    )
    .join("\n");

  return `You are an expert autobiographical writer. Using the structured notes below, craft a cohesive autobiography chapter in the ${style.toUpperCase()} style.

${STYLE_TONES[style]}

Focus on narrative flow, transitions between periods of life, and reflective insights. Sprinkle in details from the timeline where appropriate. Write in first person.

### Personal Information
Name: ${story.personal.fullName}
Date of birth: ${story.personal.dateOfBirth}
Birthplace: ${story.personal.birthplace}
Background: ${story.personal.background}

${highlightSection("Childhood", story.childhood)}
${highlightSection("Education", story.education)}
${highlightSection("Career", story.career)}
${highlightSection("Family & Relationships", story.relationships)}
${highlightSection("Challenges & Lessons", story.challenges)}
${highlightSection("Dreams & Future", story.dreams)}

### Timeline
${timelineText || "No timeline events provided."}

Instructions:
- Produce 6-8 paragraphs.
- Open with a compelling scene or reflection.
- Close with forward-looking sentiments tied to dreams and beliefs.`;
}

function fallbackDraft(story: LifeStory, style: WritingStyle) {
  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1);
  const sections = [
    { title: "Roots", section: story.personal.background },
    { title: "Childhood", section: story.childhood.summary },
    { title: "Education", section: story.education.summary },
    { title: "Career", section: story.career.summary },
    { title: "Relationships", section: story.relationships.summary },
    { title: "Challenges", section: story.challenges.summary },
    { title: "Dreams", section: story.dreams.summary },
  ];

  const paragraphs = sections
    .filter((block) => block.section?.trim().length)
    .map((block) => `${block.title}: ${block.section}`);

  return `(${styleLabel} draft) ${story.personal.fullName || "My story"}\n\n${
    paragraphs.length ? paragraphs.join("\n\n") : DEFAULT_PARAGRAPH
  }`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { style, story } = body as { style: WritingStyle; story: LifeStory };

    if (!style || !story) {
      return NextResponse.json({ error: "Missing style or story payload." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      const draft = fallbackDraft(story, style);
      return NextResponse.json({ draft, provider: "fallback" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt(story, style);

    const result = await model.generateContent(prompt);
    const draft = result.response.text() || fallbackDraft(story, style);

    return NextResponse.json({ draft, provider: "gemini" });
  } catch (error) {
    console.error("generate-story error", error);
    return NextResponse.json(
      { error: "Failed to generate story", draft: DEFAULT_PARAGRAPH },
      { status: 500 }
    );
  }
}
