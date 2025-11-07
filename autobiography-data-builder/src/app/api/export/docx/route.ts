import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { LifeStory, WritingStyle } from "@/types/story";

interface ExportPayload {
  story: LifeStory;
  draft: string;
  style: WritingStyle;
}

export async function POST(request: Request) {
  try {
    const { story, draft, style } = (await request.json()) as ExportPayload;

    if (!story || !draft) {
      return NextResponse.json({ error: "Missing story or draft" }, { status: 400 });
    }

    const paragraphs = draft
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map(
        (chunk) =>
          new Paragraph({
            children: [
              new TextRun({ text: chunk, font: "Times New Roman", size: 24 }),
            ],
            spacing: { after: 200 },
          })
      );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: story.customization.title || story.personal.fullName || "Autobiography",
              heading: HeadingLevel.TITLE,
            }),
            story.customization.subtitle
              ? new Paragraph({
                  text: story.customization.subtitle,
                  heading: HeadingLevel.HEADING_3,
                })
              : null,
            new Paragraph({
              children: [
                new TextRun({ text: `Writing style: ${style}`, italics: true, size: 22 }),
              ],
              spacing: { after: 300 },
            }),
            ...paragraphs,
          ].filter(Boolean) as Paragraph[],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${(story.customization.title || "autobiography").toLowerCase().replace(/\s+/g, "-")}.docx`;
    const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const arrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    );

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("docx export error", error);
    return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
  }
}
