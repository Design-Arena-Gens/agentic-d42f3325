"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { LifeStory, WritingStyle } from "@/types/story";

interface ExportButtonsProps {
  story: LifeStory;
  activeStyle: WritingStyle;
  draft: string;
  onShare: () => Promise<string | void>;
}

type ExportFormat = "pdf" | "docx";

export function ExportButtons({ story, activeStyle, draft, onShare }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [sharing, setSharing] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!draft) {
      toast.error("Generate or write a draft before exporting");
      return;
    }

    try {
      setExporting(format);
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story, draft, style: activeStyle }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `${story.customization.title || "autobiography"}.${format}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${format.toUpperCase()} file`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to export file");
    } finally {
      setExporting(null);
    }
  };

  const handleShare = async () => {
    if (!draft) {
      toast.error("Write or generate a draft before sharing");
      return;
    }
    try {
      setSharing(true);
      await onShare();
    } catch (error) {
      console.error(error);
      toast.error("Unable to create shareable link");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        onClick={() => handleExport("pdf")}
        className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-emerald-400/60"
        disabled={exporting !== null}
      >
        {exporting === "pdf" ? "Preparing PDF..." : "Export as PDF"}
      </button>
      <button
        onClick={() => handleExport("docx")}
        className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-emerald-400/60"
        disabled={exporting !== null}
      >
        {exporting === "docx" ? "Preparing DOCX..." : "Export as DOCX"}
      </button>
      <button
        onClick={handleShare}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
        disabled={sharing}
      >
        {sharing ? "Creating link..." : "Shareable link"}
      </button>
    </div>
  );
}
