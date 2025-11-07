import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { height } = page.getSize();
    const margin = 50;
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let cursorY = height - margin;

    const drawText = (text: string, options: { size?: number; lineGap?: number; bold?: boolean } = {}) => {
      const size = options.size ?? 12;
      const lineGap = options.lineGap ?? 6;
      const lines = wrapText(text, 70);
      const usedFont = options.bold ? titleFont : font;

      lines.forEach((line) => {
        if (cursorY <= margin) {
          cursorY = height - margin;
          pdfDoc.addPage([595.28, 841.89]);
        }
        const currentPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
        currentPage.drawText(line, {
          x: margin,
          y: cursorY,
          size,
          font: usedFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        cursorY -= size + lineGap;
      });
    };

    drawText(story.customization.title || story.personal.fullName || "Autobiography", {
      size: 22,
      bold: true,
      lineGap: 10,
    });

    if (story.customization.subtitle) {
      drawText(story.customization.subtitle, { size: 14, lineGap: 12 });
    }

    drawText(`Writing style: ${style}`, { size: 10, lineGap: 10 });
    drawText(draft, { size: 12, lineGap: 6 });

    const pdfBytes = await pdfDoc.save();
    const nodeBuffer = Buffer.from(pdfBytes);
    const arrayBuffer: ArrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    );

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          (story.customization.title || "autobiography").toLowerCase().replace(/\s+/g, "-")
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("pdf export error", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

function wrapText(text: string, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > width) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
